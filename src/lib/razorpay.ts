// Thin wrapper around the Razorpay Checkout script (loaded from their CDN,
// not npm — that's how Standard Checkout is meant to be embedded).
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', cb: (response: { error?: { description?: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptLoad: Promise<void> | null = null;

/** Loads the Razorpay Checkout script once; safe to call repeatedly. */
export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptLoad) {
    scriptLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the Razorpay checkout script.'));
      document.body.appendChild(script);
    });
  }
  return scriptLoad;
}
