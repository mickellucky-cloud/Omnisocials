# OmniSocial — $10,000 Enterprise Social Media SaaS Dashboard

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.1_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

An enterprise-grade, multi-workspace social media management suite engineered to the standard of high-growth SaaS unicorns (Linear, Sprout Social, Raycast, Stripe). Features a Buffer-style smart queue, 3-pane unified engagement inbox, Gemini 2.5 Flash AI multi-network repurposing copilot, and authentic 1-Click OAuth 2.0 social channel connections.

---

## 🌟 Key Highlights & Architecture

### 1. 🎛️ Executive Command Center ($10,000 Dashboard Tier)
- **Live Multi-Network Telemetry**: Real-time ping latency and rate limit monitors for 𝕏 API v2, LinkedIn Marketing, Meta Graph API, TikTok LoginKit, Telegram Bot API, and YouTube Data v3.
- **7-Day Velocity Waveform**: Interactive SVG analytics chart displaying cross-channel Impressions, Engagement Rate, Global Audience, and Conversion ROI.
- **Micro-Metric Sparklines**: Integrated area gradient sparklines and trend indicators with sub-millisecond tactile hover feedback.

### 2. ⚡ 1-Click Social Connect & OAuth 2.0 Engine
- **Seamless Roundtrip Authorization**:
  1. Click **Connect with [Platform]** (𝕏, LinkedIn, Instagram, Facebook, TikTok, YouTube, Telegram, Threads).
  2. Redirects to official OAuth 2.0 consent portals with PKCE security, offline token refresh, and requested permission scopes.
  3. Authorizes permissions and redirects back through `/auth/callback`.
  4. Animates an Apple-style 3-step token handshake: *Verifying code* &rarr; *Exchanging token* &rarr; *Linking account*.
  5. Returns to dashboard with celebratory floating glass toast and active channel state.
- **Direct Bot & API Token Hub**: Native zero-approval Telegram bot broadcasting, Ayrshare unified multi-network enterprise gateway, and custom webhook dispatch.

### 3. ✍️ Adaptive Multi-Network Content Studio
- **Gemini 2.5 Flash Repurposing Copilot**: Converts a single raw concept or release note into 8 network-native variants with platform character limits, hashtags, and engagement hooks simultaneously.
- **Visual Media Aspect Ratio Engine**: Live previews for 𝕏 cards (16:9), LinkedIn carousels, Instagram Reels (9:16), YouTube Shorts, and Telegram bulletins.

### 4. 📬 Sprout Social-Style 3-Pane Unified Inbox
- **Collision Detection**: Real-time indicator showing which team member is actively typing or viewing a customer thread.
- **AI Sentiment & Quick Replies**: One-click tone suggestions (Empathetic, Professional, Technical) powered by Gemini AI.

### 5. ⏱️ Buffer Smart Queue & Publishing Calendar
- **Predictive Heatmap Scheduling**: Automated time slots calculated based on global audience peak engagement windows.
- **Multi-Stage Editorial Governance**: Approvals pipeline with revision requests, audit history, and client lockouts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mickellucky-cloud/Omnisocials.git
cd Omnisocials

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or `http://localhost:3005`) to launch the dashboard.

---

## 🌐 Deploy to Vercel

The application is pre-configured for zero-configuration Vercel deployment:

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
3. The build command `npm run build` will automatically run Next.js with Turbopack.
4. *(Optional)* Add any production OAuth client IDs and API keys to your Vercel Environment Variables:
   - `NEXT_PUBLIC_TWITTER_CLIENT_ID`
   - `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
   - `NEXT_PUBLIC_META_APP_ID`
   - `TELEGRAM_BOT_TOKEN`
   - `AYRSHARE_API_KEY`
   - `GEMINI_API_KEY`

---

## 🎨 Design System & Aesthetics

- **4-Layer Depth Architecture**:
  - *Layer 0 (Atmosphere)*: Procedural ambient radial mesh and tactile noise grain overlay.
  - *Layer 1 (Structural Surfaces)*: High-specular glassmorphic panels (`backdrop-filter: blur(20px)`), frosted borders, and inner drop bevels.
  - *Layer 2 (Typography)*: Curated Inter and Outfit typographic pairings with optical tracking (`tracking-tight`).
  - *Layer 3 (Tactile Highlights)*: Apple-style spring press dynamics (`transform: scale(0.972)`), keyboard accelerators (`⌘K`), and live pulsing status halos.
- **Zero-Boring-Design Guarantee**: Strict avoidance of generic templates; custom luxury aesthetic engineered for enterprise client presentations.

---

## 📄 License
MIT © OmniSocial Enterprise Team
