# ☁️ Deploying Chronicle to Cloudflare

This guide explains how to deploy the Chronicle monorepo to the Cloudflare ecosystem using **Cloudflare Pages** (for frontends) and **Cloudflare Workers** (for the API).

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
2.  Click **Create application** > **Pages** > **Connect to Git**.
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

The Express-based API server requires a small adapter to run on the serverless Workers runtime.

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Environmental Variable Mapping
Cloudflare Workers separates variables into **Plaintext** (in `wrangler.toml`) and **Secrets** (via CLI).

| Variable Category | Variables | Command to Set |
| :--- | :--- | :--- |
| **Secrets** | `GEMINI_API_KEY`, `INSTAGRAM_ACCESS_TOKEN`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `X_ACCESS_TOKEN`, `LINKEDIN_OAUTH_TOKEN`, `YOUTUBE_ACCESS_TOKEN`, `GOOGLE_OAUTH_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `GHOST_ADMIN_API_KEY`, `WORDPRESS_APP_PASSWORD` | `wrangler secret put <KEY>` |
| **Plaintext** | `NODE_ENV`, `APP_URL`, `INSTAGRAM_USER_ID`, `FACEBOOK_PAGE_ID`, `TELEGRAM_CHANNEL_ID`, `GHOST_ADMIN_URL`, `WORDPRESS_SITE_URL` | Define in `[vars]` block of `wrangler.toml` |

### Step 3: Configure `wrangler.toml`
Use the template provided in the root `wrangler.toml`. It includes mappings for all social media and AI integrations. Note that as of Wrangler v4, `node_compat = true` is replaced by:
```toml
compatibility_flags = [ "nodejs_compat" ]
```

### Step 4: Entry Point Adaptation
Cloudflare Workers use a `fetch` handler. If you are using standard Express, you must use an adapter like `itty-router` or a compatibility layer.
Update `apps/server/src/standalone.ts` or create a `worker.ts` that exports:
```typescript
export default {
  async fetch(request, env, ctx) {
    // Adapter logic here
  }
}
```

### Step 5: Deploy
```bash
wrangler deploy
```

---

## 🔗 4. Connect the Dots
Update your frontend environment variables to point to the live Worker URL.

1.  In **Cloudflare Pages** (for both Reader and Admin):
2.  Go to **Settings** > **Environment variables**.
3.  Add `VITE_API_BASE_URL` with the value of your Worker URL (e.g., `https://chronicle-api.user.workers.dev`).
4.  Redeploy the Pages projects.

---

## 🛠️ Summary of Port Mappings
| Service | Local Dev Port | Cloudflare Service |
| :--- | :--- | :--- |
| **Reader App** | 3000 | Cloudflare Pages |
| **Admin App** | 3001 | Cloudflare Pages |
| **API Server** | 4000 | Cloudflare Workers |
