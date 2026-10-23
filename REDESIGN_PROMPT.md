# Role

You are a **world-class senior product designer and front-end design engineer**. You have 15+ years of experience shipping polished consumer learning products used by millions of students: ed-tech, developer tools and interview-prep platforms. You think in systems (tokens, type scales, spacing rhythm, components), you have strong visual taste, and you write the CSS yourself with clean, production-quality code. You care about accessibility, performance and mobile as much as about beauty.

# Context: the product

**VizuCode** (vizucode.site) is a placement-prep platform for **Indian college students (18–23)** getting ready for tech interviews and campus OAs. It has 100+ registered users and is growing. Students usually use it on a **laptop at night** while studying, often in dark mode, and on **mid-range Android phones**.

Sections:
- **DSA (home)**: a catalog of 300+ LeetCode problems with progress tracking, streaks and a progress ring.
- **Visualizer** (`/visualize/:slug`): step-by-step animated visualizations of algorithms (array, tree, heap, stack, matrix, intervals, linked list, bits and binary-search widgets) with a code panel in C++/Java and trace controls. **This is the core product and must stay the clearest page on the site.**
- **Revision** and **Core Subjects**: DBMS, OS, OOPs, CN, SQL and System Design topic pages. These are long-form reading content blocks.
- **Aptitude & OA**: timed mock tests with a question palette, results and coverage.
- **AI Interview**: upload a resume; "Vizu", an animated robot interviewer, asks questions by voice and grades answers. It's reached from a bot button in the top-right corner of the header.
- **AI News**: a daily top 5 in AI.
- **Feedback**, **Login/Register** (with Google) and **Upgrade** (Pro, paid via Razorpay).

Current look: a calm, "editorial textbook" style with muted grey-blue surfaces, an amber accent, serif body text in places, and light and dark themes. It's clean but feels **generic and flat**. Nothing about it says "this is the best place to prepare for placements".

# Goal

Redesign the **whole site's visual design** so it feels like a **premium, modern, confident product** that students are proud to use and share. It should be **focused and calm enough to study with for hours**, with **energy and personality** where it matters: progress, streaks, achievements, the AI interviewer and calls to action.

Target feeling: *a crafted product made by a small, opinionated team that cares*, like the tools serious developers trust (Stripe docs, Linear, Notion, Codeforces' density, a well-set technical book), with warmth and motivation for students. **It must not look AI-generated or template-made.**

# It must NOT look AI-generated (top priority)

Students have seen hundreds of AI-made sites and can spot one instantly. Avoid every cliché of that look.

**Banned:**
- Purple-to-blue (or any rainbow) gradients on backgrounds, buttons or headline text.
- Glassmorphism and blurred translucent cards; neon glows, glowing borders and "aurora" blobs or orbs in the background.
- Sparkle ✨ / rocket 🚀 / robot 🤖 emoji as decoration, "AI-powered" badges, and emoji used as icons in buttons or headings. Replace the site's current emoji icons (🔊 🎙 👍 💡 🎯 🔒 🔓 📄 ⌨️ ☀️ 🌙 and others) with **one consistent hand-built inline-SVG icon set**: same stroke width, same corner style, sized to the text.
- The generic SaaS landing template: centered hero with gradient text, a row of 3 identical feature cards with icons, then pricing.
- Everything in identical giant rounded-2xl cards with the same soft drop shadow. Everything centered. Uniform padding everywhere.
- Filler microcopy like "Unlock your potential", "Supercharge", "Seamless" or "Elevate".
- Overused stock look: default Inter-everywhere with no typographic personality, grey-on-grey with a single blue accent.

**Instead, show human design decisions:**
- **One distinctive brand idea** carried through the site. For example, VizuCode is about *seeing* algorithms, so borrow the language of the visualizer: grid paper, pointer arrows, array cells, trace lines and index labels, used sparingly as a signature motif in the header, empty states, section dividers and the progress hero.
- **Real typographic hierarchy:** a characterful display face for big headings, used with restraint, paired with a highly readable text face. Tight letter-spacing on large sizes, small caps or mono labels for metadata, and deliberate line lengths (60–75 characters) on reading pages.
- **Content-first density where it helps.** The problem list is a fast, scannable table (like a good dev tool), not a wall of cards. Mix layouts: tables, lists, split panes, and asymmetry where it helps the content.
- **Borders and spacing do most of the structure**, with shadows used rarely and deliberately. Flat, confident color blocks instead of gradients.
- **Restrained color:** mostly neutrals, one strong brand color used with purpose, and semantic colors only where they mean something (Easy/Medium/Hard, correct/wrong, streaks).
- **Hand-tuned details** that show care: optical alignment of icons, consistent number formatting, thoughtful empty and loading states, tasteful hover states and real focus rings.
- The **Vizu bot** stays the one playful character. Everything around it stays calm and professional, so it stands out.

# Design direction (commit to one cohesive system)

1. **Brand and color**
   - A distinctive, ownable palette with one confident primary accent and 2–3 supporting colors for success, warning, info and difficulty (Easy/Medium/Hard).
   - Every text and background pair meets **WCAG AA contrast** in both themes.
   - **Dark mode is a first-class theme, not an inverted afterthought.** Use rich deep surfaces (not pure black) and elevation through slightly lighter surfaces and borders. No glows.
   - Light mode is crisp and airy, not washed out.
2. **Typography**
   - A characterful display face for headings and a highly readable text face for UI and reading (Google Fonts, at most 2 families plus a monospace, with sensible fallbacks). Avoid the default "Inter for everything" look. Use a good monospace for code, numbers and metadata labels.
   - A clear type scale (e.g. 12/14/16/18/22/28/36/48) with tight, confident headings and comfortable 1.6 line-height for long reading pages.
   - Use tabular numbers for stats, timers and scores.
   - Drop the serif body text unless it clearly helps long reading.
3. **Layout and spacing**
   - A consistent 4/8 px spacing scale, consistent container widths, and generous but purposeful whitespace.
   - Clear hierarchy on every page: one primary action per view.
4. **Surfaces and depth**
   - A small set of elevation levels: page, card, raised card and overlay.
   - Consistent corner radii (e.g. 8 / 12 / 16 / pill), subtle layered shadows in light mode and border-plus-tint in dark mode.
5. **Components** (restyle consistently across the site): header and nav (sticky, slightly translucent on scroll), buttons (primary, secondary, ghost, danger, icon, with hover, active, focus and disabled states), inputs and selects, chips and tags (difficulty and topic), cards, tables and lists, tabs, progress bars and rings, stat tiles, badges, alerts and toasts, empty states, loading skeletons, and the footer if present.
6. **Motion**
   - Subtle and fast (120–220 ms ease-out) on hover, press, page and section entry, and progress fills.
   - Celebrate wins (solved a problem, finished a test, a good interview score) with tasteful micro-animation.
   - Respect `prefers-reduced-motion`.
7. **Personality**
   - Make the home page feel motivating: a progress hero with streak, solved count and a clear "continue where you left off".
   - Give the AI Interview a premium but **human** treatment: no "AI magic" clichés. Vizu the bot is the personality.
   - Use Indian-student-friendly microcopy where it helps, but keep it professional.

# Hard constraints

- **Change the design, not the behavior.** Keep every route, feature, data flow, API call, form field and piece of state logic exactly as is. Don't remove features or content.
- The styling is plain CSS in `src/styles.css`, driven by **CSS custom-property tokens on `:root` and `:root[data-theme="dark"]`**. Rebuild the token layer first, then restyle the components on top of it. Keep both themes in full parity, and keep the theme toggle working.
- Keep existing class names wherever possible so the React components keep working. You may add classes or wrapper elements in the TSX where needed for layout, but don't rewrite component logic.
- **No new npm dependencies.** Plain CSS only (no Tailwind, UI kits or icon libraries; icons are inline SVG). One Google Fonts stylesheet, at most 2 families plus a monospace.
- **Visualizer widgets must stay perfectly legible.** Their highlight, compare, swap and visited states must stay clearly distinguishable in both themes, including for color-blind users (don't rely on color alone).
- Code blocks keep a dark, high-contrast code theme in both modes.
- **Mobile-first and responsive.** Everything works at 360 px wide with a 16 px gutter and no horizontal scroll. Tap targets are at least 44 px. Test 360, 768, 1024, 1280 and 1440 px.
- **Accessibility:** visible focus rings, semantic contrast, keyboard navigation preserved, and no information carried by color alone.
- **Performance:** no heavy images or background videos. Gradients, SVG and CSS only. Keep the CSS organized and commented by section.

# Process and deliverables

1. **Audit:** briefly list the 8–10 biggest visual problems with the current design.
2. **Design system:** define the new tokens (color for both themes, type scale, spacing, radii, shadows and motion), with a one-line rationale for each key choice.
3. **Implement:** rewrite the token layer, then restyle global elements, then shared components, then each page in this priority order:
   1. Header/nav
   2. Home (DSA catalog and progress)
   3. Visualizer
   4. Login/Register
   5. Upgrade
   6. Aptitude (home, test, result)
   7. AI Interview
   8. Core subject and revision topic pages
   9. AI News
   10. Feedback
4. **Verify:** screenshot every page in light and dark mode at desktop (1280 px) and phone (390 px) widths. Fix anything cramped, misaligned, low-contrast or overflowing before calling it done.
5. **Report:** say what changed and why, in plain language, with before/after screenshots of the key pages.

**Quality bar:** someone landing on the home page should think within 3 seconds, *"this looks like a real product made by people who care, and it's built for me."* If any page could be mistaken for an AI-generated template, it isn't done.
