// Razorpay Standard Checkout: create an order, then verify the signature
// Razorpay returns after the user pays. All routes require a valid JWT
// (requireAuth) — the signed-in user is who gets marked isPro on success.
import { Router, type NextFunction, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { requireAuth, markUserPro, type AuthedRequest } from './auth';

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Price is derived server-side from the signed-in user's email, never taken
// from the client, so a request can't be tampered with to buy the upgrade
// for less. Students on the college domain get the discounted price.
const STUDENT_EMAIL_SUFFIX = '@ietdavv.edu.in';
const STUDENT_PRICE_PAISE = 100; // ₹1
const STANDARD_PRICE_PAISE = 4900; // ₹49

function priceForEmail(email: string): number {
  return email.toLowerCase().endsWith(STUDENT_EMAIL_SUFFIX) ? STUDENT_PRICE_PAISE : STANDARD_PRICE_PAISE;
}

const razorpay = KEY_ID && KEY_SECRET ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET }) : null;

// order_id -> the user who created it, so /verify can't be replayed with
// someone else's (order_id, payment_id, signature) triple to grant free
// access. Consumed (deleted) on first successful verify. Dev/process-memory
// scoped is fine here: orders are paid within the same short-lived session,
// and a lost entry just means a safe rejection instead of a false accept.
const orderOwners = new Map<string, number>();

const wrap =
  (fn: (req: AuthedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res).catch(next);
  };

export const paymentRouter = Router();
paymentRouter.use(requireAuth);

/** POST /api/payment/create-order — no body needed, price is fixed server-side. */
paymentRouter.post('/create-order', wrap(async (req, res) => {
  if (!razorpay) {
    res.status(500).json({ error: 'Payments are not configured on this server.' });
    return;
  }
  const amount = priceForEmail(req.user!.email);
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `pro-${req.user!.id}-${Date.now()}`,
    });
    orderOwners.set(order.id, req.user!.id);
    if (orderOwners.size > 10_000) orderOwners.clear(); // crude memory guard, mirrors app.ts's rate-limit map
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e) {
    // Razorpay's SDK throws on auth failures (bad keys) and other API errors alike;
    // it doesn't give us a clean way to tell them apart, so this is a flat 500.
    console.error('[payment] order creation failed:', e);
    res.status(500).json({ error: 'Could not start checkout — try again.' });
  }
}));

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

/** POST /api/payment/verify — body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } */
paymentRouter.post('/verify', wrap(async (req, res) => {
  if (!KEY_SECRET) {
    res.status(500).json({ error: 'Payments are not configured on this server.' });
    return;
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as VerifyBody;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: 'Missing payment fields.' });
    return;
  }

  const owner = orderOwners.get(razorpay_order_id);
  if (owner === undefined || owner !== req.user!.id) {
    res.status(400).json({ error: 'This order does not belong to your session.' });
    return;
  }

  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  const signatureOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!signatureOk) {
    res.status(400).json({ error: 'Payment signature does not match — not marking as paid.' });
    return;
  }

  orderOwners.delete(razorpay_order_id); // one-time use, prevents replay

  const result = await markUserPro(req.user!.id, req.user!.sid);
  if (!result) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }
  res.json(result);
}));
