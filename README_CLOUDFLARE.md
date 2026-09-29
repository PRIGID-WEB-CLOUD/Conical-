# ☁️ Deploying Chronicle to Cloudflare

This guide explains how to deploy the Chronicle monorepo to the Cloudflare ecosystem using **Cloudflare Pages** and **Cloudflare Workers**.

---

## 🏗️ 1. Build the Monorepo
Before deploying, you need to generate the production builds for the frontend applications:

```bash
# Install dependencies
npm install

# Build the Reader and Admin applications
npm run build
```

The output will be located in:
*   `apps/readers/dist` (Reader Application)
*   `apps/admin/dist` (Admin CMS)

---

## 📖 2. Deploy Frontends to Cloudflare Pages

Cloudflare Pages is the best place for the high-performance Vite-based frontends.

### A. Deploy Reader App
1.  Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2.  Click **Create application** > **Pages** > **Connect to Git** (or Upload assets).
3.  **Build Settings**:
    *   **Framework preset**: `Vite`
    *   **Build command**: `npm run build:readers`
    *   **Build output directory**: `apps/readers/dist`
    *   **Root directory**: `/` (Monorepo root)

### B. Deploy Admin CMS
Repeat the steps above but use these settings:
*   **Project Name**: `chronicle-admin`
*   **Build command**: `npm run build:admin`
*   **Build output directory**: `apps/admin/dist`

---

## ⚡ 3. Deploy API Server to Cloudflare Workers

The Express-based API server can be deployed as a Cloudflare Worker. Note that Cloudflare Workers uses a serverless runtime; while Express is supported via compatibility layers, you may need to ensure your database (if any) is reachable via HTTP/WebSockets.

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Configure `wrangler.toml`
Create a `wrangler.toml` in the root:

```toml
name = "chronicle-api"
main = "apps/server/src/standalone.ts"
compatibility_date = "2024-03-01"
node_compat = true

[vars]
# Add your environment variables here
NODE_ENV = "production"
# GEMINI_API_KEY = "..." (Use `wrangler secret put GEMINI_API_KEY` instead)
```

### Step 3: Deploy
```bash
wrangler deploy
```

---

## 🔗 4. Connect the Dots
Once your API is live (e.g., `chronicle-api.your-subdomain.workers.dev`), you need to update the frontend environment variables so they point to the live API instead of `localhost`.

1.  In **Cloudflare Pages** (for both Reader and Admin):
2.  Go to **Settings** > **Environment variables**.
3.  Add `VITE_API_BASE_URL` with the value of your Worker URL.
4.  Redeploy the Pages projects.

---

## 🔒 5. Security & Secrets
Never commit your `GEMINI_API_KEY` or social media tokens to `wrangler.toml`. Use Cloudflare Secrets:

```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put INSTAGRAM_ACCESS_TOKEN
# ... and so on
```

---

## 🛠️ Summary of Port Mappings
| Service | Local Dev Port | Cloudflare Service |
| :--- | :--- | :--- |
| **Reader App** | 3000 | Cloudflare Pages |
| **Admin App** | 3001 | Cloudflare Pages |
| **API Server** | 4000 | Cloudflare Workers |
