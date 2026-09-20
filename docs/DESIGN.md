# Design System & UI/UX Standards: Vote India Secure

**Platform**: Vote India Secure (`shareholdervoting.in`)  
**Design Persona**: Enterprise GovTech, High Trust, Corporate Boardroom Elegance  
**Accessibility Target**: WCAG 2.1 Level AA Compliant  
**Core Web Vitals**: LCP $\le 2.5$s, FCP $\le 1.8$s, TBT $\le 200$ms, CLS $\le 0.1$

---

## 1. Visual Philosophy & Design Principles

Vote India Secure delivers a modern, high-confidence interface designed for institutional investors, independent scrutinizers, corporate secretaries, and retail shareholders.

1. **High-Trust Enterprise Aesthetics**:
   - Deep navy and obsidian foundations (`#020817`, `#0d1b2a`) create a calm, focused environment that conveys institutional stability.
   - Vibrant sapphire (`#1e3a8a`), electric cyan (`#06b6d4`), and emerald (`#10b981`) accents direct attention to critical actions and verified states.
2. **Layered Glassmorphism & Depth**:
   - Translucent background panels with `backdrop-blur-xl`, subtle border delineation (`border-white/10` to `border-white/20`), and soft radial gradients.
3. **Zero Placeholder Policy**:
   - All visual elements, QR codes, icons, and badges are fully functional, styled vector graphics or rendered cryptographic tokens.
4. **Performance-First Visuals**:
   - GPU-accelerated CSS 3D transforms (`HeroCyberOrb`) replace heavy canvas/WebGL scripts on critical landing pages, ensuring smooth 60fps animations with near-zero main-thread blocking time.

---

## 2. Color Palette & Design Tokens

### 2.1. Foundation Palettes
| Token Name | HEX / Value | Purpose |
|---|---|---|
| `--background` | `#020817` (Deep Obsidian) | Root page canvas background |
| `--surface` | `#0d1b2a` (Deep Navy) | Card, modal, and drawer surfaces |
| `--surface-elevated` | `#132238` | Hover states and elevated containers |
| `--border-subtle` | `rgba(255, 255, 255, 0.10)` | Baseline container borders |
| `--border-prominent` | `rgba(255, 255, 255, 0.20)` | Active cards and interactive elements |

### 2.2. Brand & Semantic Accents
| Accent Role | Color Range | Class Tokens |
|---|---|---|
| **Primary Brand** | Sapphire to Royal Blue | `bg-[#1e3a8a]`, `hover:bg-blue-800`, `text-blue-400` |
| **Integrity & Trust** | Cyan to Electric Teal | `from-cyan-500 to-teal-400`, `text-cyan-400` |
| **Assent / Success** | Emerald | `bg-emerald-600`, `text-emerald-400`, `border-emerald-500/40` |
| **Dissent / Warning** | Crimson & Amber | `bg-rose-600`, `text-rose-400`, `text-amber-400` |
| **Neutral Text Primary** | `#FFFFFF` (100% White) | Primary headings, button labels |
| **Neutral Text Secondary**| `#E2E8F0` (Slate-200) | Body paragraphs, bullet descriptions |
| **Neutral Text Muted** | `#94A3B8` (Slate-400) | Timestamps, metadata, footnotes |

---

## 3. Typography Hierarchy

The platform employs a two-tier typography system from Google Fonts, preloaded in `index.html` and rendered with `font-display: swap`:

1. **Headings & Display**: `Plus Jakarta Sans` (`font-sans`)
   - Tight tracking (`tracking-tight`), bold to extra-bold weights (`font-bold`, `font-extrabold`).
   - High visual impact with subtle gradient text clipping on hero accents.
2. **Body & Tabular Data**: `Inter` (`font-inter`)
   - Exceptional legibility for dense resolution texts, financial figures, share counts, and legal notices.
   - Native tabular numbers support for aligned voter counts and ballot percentages.

### Typography Scale
| Element | Font Family | Size | Weight | Line Height |
|---|---|---|---|---|
| **Hero Title (H1)** | Plus Jakarta Sans | 48px - 72px (`text-4xl sm:text-6xl lg:text-7xl`) | ExtraBold (800) | 1.1 |
| **Section Title (H2)**| Plus Jakarta Sans | 30px - 48px (`text-3xl md:text-5xl`) | Bold (700) | 1.2 |
| **Card Header (H3)** | Plus Jakarta Sans | 20px - 24px (`text-xl md:text-2xl`) | Bold (700) | 1.3 |
| **Body Large** | Inter | 18px - 20px (`text-lg md:text-xl`) | Regular (400) | 1.6 |
| **Body Normal** | Inter | 14px - 16px (`text-sm md:text-base`) | Regular (400) | 1.6 |
| **Metadata / Badges**| Plus Jakarta Sans | 12px - 13px (`text-xs md:text-sm`) | SemiBold (600) | 1.4 |

---

## 4. Component Standards

### 4.1. Buttons
- **Primary CTA**: Large (`px-8 py-6 rounded-xl`), `bg-[#1e3a8a] hover:bg-[#1e3a8a]/90`, crisp border `border-blue-400/30`, subtle shadow `shadow-blue-900/40`.
- **Secondary / Outline**: `border-white/25 hover:bg-white/10 text-white font-semibold`.
- **Destructive / Dissent**: High-contrast rose button with explicit confirmation modal.

### 4.2. Glassmorphic Cards
- `rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl`.
- Hover transition: `hover:translate-y-[-4px] hover:border-blue-500/40 transition-all duration-300`.

### 4.3. Animated OTP Input
- Individual 6-cell layout with automatic keyboard focus transfer, backspace handling, paste distribution, and mobile numeric keypad triggering (`inputMode="numeric"`).
- Verified state transitions smoothly into an animated SVG checkmark before proceeding.

### 4.4. Ballot Choice Cards (Voting Dashboard)
- Three clearly separated touch targets: **FOR (Assent)**, **AGAINST (Dissent)**, and **ABSTAIN**.
- Active selection highlighted with 2px accent borders and filled radio checkmarks.
- Sticky floating submission bar with unambiguous share count confirmation dialog.

---

## 5. Accessibility (a11y) Standards

1. **Color Contrast Ratios**:
   - Body copy on dark backgrounds strictly maintains a minimum contrast ratio of $7:1$ (exceeding WCAG AAA for normal text).
   - Interactive button states maintain at least $4.5:1$ contrast against adjacent background colors.
2. **Focus Visibility**:
   - All interactive controls (`button`, `input`, `a`, `select`) feature visible focus rings (`focus:ring-2 focus:ring-cyan-400 focus:outline-none focus:ring-offset-2 focus:ring-offset-[#020817]`).
3. **Screen Reader Compatibility**:
   - Decorative SVGs and background graphics include `aria-hidden="true"`.
   - Collapsible FAQs and tabbed navigations utilize explicit `aria-expanded`, `aria-controls`, and `role="region"` attributes.
4. **Motion Preferences**:
   - Micro-animations and spin transforms respect `@media (prefers-reduced-motion: reduce)` rules.
