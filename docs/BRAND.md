---
name: Cyvl brand and design system (cyvl.com)
description: Exact color tokens, fonts, typography, brand voice, and visual system from cyvl.com — the reference site for the cyvl-relations project UI
type: project
originSessionId: 406971b3-4b80-4311-9932-6bd8c4f23b1a
---
Reference site: **https://www.cyvl.com/** (Webflow-built, March 2025 stylesheet). User wants cyvl-relations UI to match this brand.

**Why:** User explicitly asked to research and remember cyvl.com so future UI work in this repo aligns with the live brand.
**How to apply:** Use these tokens as defaults for any color/typography/layout choice in cyvl-relations. Prefer Tailwind values or CSS vars that mirror the names below.

## Brand identity
- **Company:** Cyvl — AI-native infrastructure intelligence platform for public works / municipalities.
- **Tagline:** "Infrastructure Intelligence. From Capture to Capital Plan."
- **Secondary tagline:** "Smarter Infrastructure, Faster."
- **Mission:** Empower governments to build/maintain public infrastructure they're proud of via sensors + Infrastructure Intelligence Platform.
- **Hero copy style:** Bold/punchy, occasional profanity-coded ("Fixing the *** roads! has never been easier"). Action verbs. Mid-headline italics.
- **Primary CTA copy:** "Fill my potholes now", "Unlock better infrastructure", "Enter interactive demo".
- **Audience:** City/municipal public-works staff, DPW directors, engineers. Tone: conversational-professional, urgent, credible.
- **Pillars (section headers):** Precision Capture · Infrastructure AI · Intelligence Platform · Automated Asset Plans · 360° Virtual Site Visits · 3D LiDAR Point Cloud.
- **Proof points:** "Over 700 US communities", "500+ communities US/CA/AU", "50+ AI models", "sub-inch precision", "full city coverage in days".

## Color tokens (from webflow CSS vars)

Neutrals (warm off-white → near-black, slight green/khaki cast):
- `--neutral--50:  #f9f9f9` (page bg light)
- `--neutral--100: #e2e3dc`
- `--neutral--200: #d0d1c7`
- `--neutral--300: #bebfb6`
- `--neutral--400: #a7a8a0`
- `--neutral--500: #86877a`
- `--neutral--600: #63635c`
- `--neutral--700: #474742`
- `--neutral--800: #292926` (dark surfaces)
- `--accent--black: #000`

Brand secondary (construction-safety palette):
- `--secondary--high-vis-yellow: #daff00` ← **signature accent**, used on CTA bg
- `--secondary--signal-red:     #ff470a` (alert/danger)
- `--secondary--utility-blue:   #1b79c5`
- `--secondary--concrete-gray:  #6a736f`
- Also seen: `#c8f135` (high-vis variant)

System (status):
- green-400 `#11845b` · green-300 `#05c168` · green-100 `#def2e6`
- blue-400 `#086cd9` · blue-300 `#1d88fe` · blue-100 `#eaf4ff`
- orange-400 `#d5691b` · orange-300 `#ff9e2c` · orange-100 `#fff3e4`
- red-400 `#dc2b2b` · red-200 `#ffbec2` · red-100 `#ffeff0`

Dominant background usage: `#fafafa` / `--neutral--50` / `#fff` for light sections, `--accent--black` / `--neutral--800` for dark hero/footer. **High-vis yellow used sparingly** as the punchy CTA button bg.

## Typography
- **Primary body/UI:** `Geist, Arial, sans-serif` (most used, ~41 declarations)
- **Display/marketing:** `Uncutsans` / `Uncutsans Variable` (Uncut Sans — modern grotesque, free from Grilli Type)
- **Occasional:** `Mona Sans`
- Headings tend to large, tight leading, near-black on light or white on dark.

## Layout / shape language
- **Border-radius:** dominant `3px` (small/sharp); cards `8–12px`; pills/buttons `40–48px` for rounded CTAs.
- **Shadows:** very subtle, low-opacity (`0 2px 12px #00000014`, `0 8px 28px #14142b1a`). Not glossy.
- **Cards:** image-thumbnail + overlay text, used on home (Sensor/Models/Platform) and case-studies grid (community thumbnails with regional/population/use-case filters).
- **Navigation:** Product · How it Works · Sensor · Models · Platform · Case Studies · Newsroom · Company · Get started free · Login.
- **Footer:** About · Case Studies · Careers · Blog · Sign In · Privacy Policy · LinkedIn · Instagram.

## Team / company facts
- Co-founders: Daniel Pelaez (CEO), Noah Parker (VP Eng), Noah Budris (VP Ops).
- Execs: Reed Walker (CFO), Dan McCarthy (VP Product), Brian Denenberg (VP Sales).
- Investors: Companion Ventures, Sentinel Global.

## Practical defaults for cyvl-relations UI
- Light page bg: `#fafafa`. Text: `#000` / `--neutral--800`.
- Dark sections: `#000` bg, `#fff` text, `#daff00` accent.
- Primary CTA: `#daff00` bg, black text, pill radius (`48px`), Geist medium/semibold.
- Body font stack: `"Geist", Arial, sans-serif`. Display: `"Uncut Sans", Arial, sans-serif`.
- Borders/hairlines: `--neutral--200` (#d0d1c7).
- Status colors: use the `--system--*` ramps above; do not invent new greens/reds.
