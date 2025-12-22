# AI Gift Flow SaaS – Architecture Overview

## Product goal

A SaaS that lets a creator generate a “gift journey” (story screens + questions + media) mostly via chat/AI, then publish it to a unique URL that the recipient experiences like a delightful, guided flow.

---

## Core entities

* **Workspace / Account**: user + billing + usage limits
* **Project (Gift)**: high-level container (title, theme, language, recipient name)
* **Flow**: ordered graph of **Nodes** (screens)
* **Node**: one screen block (text, question, choice, reveal, media)
* **Edge**: branching rules between nodes
* **Asset**: AI-generated image/video/audio + metadata + storage URL
* **Run / Session**: recipient’s progress + answers + analytics
* **Credit / Usage**: model calls, tokens, video seconds, storage, bandwidth

---

## UX concept

### 1) Creator experience (AI-first)

**Chat composer** (primary UI)

* Creator describes the gift: “Make a playful story with Pata the duck. 8 screens. At the end reveal a Barcelona weekend. Ask 2 fun questions.”
* AI produces:

  * A **draft flow** (nodes + edges)
  * A **theme selection** (one of your design-system themes)
  * Optional media prompts per node

**Minimal editor (secondary UI)**

* Timeline / outline of nodes
* Quick actions: reorder, delete, duplicate, edit copy, edit branching
* “Generate media” buttons per node (image/video)
* Preview as recipient

### 2) Recipient experience (Typeform-ish but even lighter)

* Full-screen, swipe/next
* Choice buttons, sliders, text input
* Progress indicator (optional)
* Final “reveal” screen with confetti + CTA (e.g., download voucher)

---

## Design system & building blocks

### Building blocks (reusable + AI-safe)

A small, battle-tested set of responsive templates the AI can assemble:

* **Hero / Story Screen** (headline, body, background)
* **Choice Screen** (2–6 options)
* **Quiz Screen** (single/multiple)
* **Text Input Screen** (short answer)
* **Reveal Screen** (big moment + CTA)
* **Media Screen** (image/video with caption)
* **Loading / Generating Screen** (progress + delight)

### Tokens

* Typography scale, spacing, radii, shadows
* Color themes (e.g., “Playful Pastel”, “Elegant Dark”, “Warm Mediterranean”)
* Motion presets (page transition, button feedback)

### AI contract (important)

AI does **not** invent arbitrary UI. It selects:

* block type
* content
* theme
* media prompt
* branching rules
  All blocks map to **known components**.

---

## Architecture (recommended)

### Frontend

* **Next.js (App Router)**
* **shadcn/ui + Tailwind** for creator app and shared components
* **Recipient player**: lightweight runtime that renders nodes
* **Auth**: NextAuth or Clerk (Clerk is fastest)

### Backend

Two good paths:

**Path A (fast MVP): “Next.js + server actions”**

* API routes / server actions handle CRUD + generation requests
* Good until AI generation volume grows

**Path B (scalable): “API + Workers”**

* Web API (Next.js routes or separate Nest/Fastify)
* Async generation via **job queue + workers**

### Database

* **Postgres** (Supabase or Neon)
* Tables: users, projects, flows, nodes, edges, assets, sessions, usage

### Storage

* **S3-compatible** (Cloudflare R2 or AWS S3)
* Store assets + thumbnails + generated vouchers

### AI / Generation

* **Replicate** for images/video (model swap flexibility)
* Prompt templates per block type + theme
* Optional: OpenAI/Anthropic for text planning + flow generation

### Hosting

* **Vercel** for Next.js (creator + recipient)
* **Supabase** (DB + auth optional)
* **Cloudflare R2** (cheap storage + egress)
* Worker hosting options:

  * **Railway / Fly.io** (simple containers)
  * **Render** (background workers)
  * **Supabase Edge Functions** (lighter tasks)

---

## Generation flows

### Flow generation (AI planning)

1. Creator chats: “Build me a gift journey…”
2. LLM returns a structured JSON plan:

   * nodes[] (type, copy, options, mediaPrompt?)
   * edges[] (rules)
   * theme
3. Save as draft
4. Creator tweaks

### Media generation (async)

1. Creator clicks “Generate image/video” or enables “auto-generate all”
2. Create jobs per node asset
3. Worker calls Replicate
4. Store asset in R2/S3
5. Update node with asset URLs

---

## Queue / workers – when to add

### MVP (simpler)

* Use Replicate **webhooks** (if available for the model)
* Store job state in Postgres
* Frontend polls or uses realtime updates

### Scale-up

* Add Redis + queue (BullMQ) when:

  * many concurrent generations
  * retries and rate limits matter
  * you need predictable throughput

---

## Billing & pricing primitives

### One-time payment (recommended)

Instead of subscriptions or credits, treat each gift as a **product**.

**Core idea**: *Pay once → generate → share → done.*

* **Pay per gift** (most intuitive)

  * Example tiers:

    * Small Gift: CHF 5–9 (text + limited images)
    * Premium Gift: CHF 15–25 (more images, optional video, no watermark)
    * Deluxe Gift: CHF 39+ (video, custom domain, long-term hosting)

* **What the price includes**:

  * AI generation (images/video)
  * Hosting for X months / years
  * Shareable public URL

* **Optional paid add-ons**:

  * Extra images / videos
  * Regenerate media
  * Custom domain
  * Downloadable PDF / voucher

### Why one-time payments work well here

* Matches mental model of a **gift**
* No ongoing commitment
* Easy to explain and sell
* Lower churn risk
* Perfect for seasonal spikes (birthdays, weddings, Christmas)

### Hybrid (later, optional)

* Creator packs (e.g. 5 gifts for CHF X)
* Annual creator pass (discounted gifts, not required)

### Partnerships

* travel agencies (weekend trips, vouchers)
* photographers / videographers
* gift shops / experience platforms

---

## Security & abuse prevention

* Rate limit generation
* Signed URLs for private assets (optional)
* Public share links: unguessable IDs + optional passcode

---

## MVP scope (high leverage)

* 1 AI chat → generates a flow (2–12 nodes)
* Minimal outline editor
* Recipient player
* Image generation only (video later)
* Stripe billing + credits
* Analytics: completion rate + drop-off screen

---

## Next steps

1. Define block set (6–8 types)
2. Define JSON schema (FlowSpec)
3. Prototype creator chat → FlowSpec in Next.js
4. Build recipient player runtime
5. Add Replicate image generation + storage
6. Add credits + Stripe
