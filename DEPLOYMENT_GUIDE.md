# Deployment Architecture: Cloudflare Worker (Backend API) & Render Static Sites (Frontend)

This blueprint contains the deployment steps and configuration for running:
- **Backend API**: Cloudflare Workers (`apps/server/src/worker.ts`)
- **Frontend Readers App**: Render Static Site (`apps/readers`)
- **Frontend Admin CMS**: Render Static Site (`apps/admin`)

---

## 1. Cloudflare Workers (Backend API)

The backend runs as a high-performance, serverless Cloudflare Worker with Express routing (`apps/server/src/worker.ts`) and built-in CORS for Render static clients.

### Configuration (`wrangler.toml`):
The root `wrangler.toml` is pre-configured:
- `main = "apps/server/src/worker.ts"`
- `compatibility_flags = ["nodejs_compat"]`

### Deploying the Backend:
```bash
# 1. Login to Cloudflare via CLI
npx wrangler login

# 2. Add your secrets
npx wrangler secret put META_APP_SECRET
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put X_ACCESS_TOKEN
npx wrangler secret put LINKEDIN_OAUTH_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put WORDPRESS_APP_PASSWORD
npx wrangler secret put GHOST_ADMIN_API_KEY

# 3. Deploy to Cloudflare
npx wrangler deploy
```

Once deployed, Cloudflare gives you a worker URL, for example:  
👉 `https://chronicle-api.<your-subdomain>.workers.dev`

---

## 2. Render Blueprint & Static Sites (`render.yaml`)

Render supports automatic infrastructure-as-code deployment via `render.yaml`. The blueprint is configured for static sites (no disallowed `plan` property and no `origins` schema keys).

### Option 1: One-Click Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Select your repository. Render detects `/render.yaml` automatically.
4. Render provisions both static sites:
   - **`chronicle-blog`**: readers frontend (`./apps/readers/dist`)
   - **`chronicle-admin`**: editorial CMS (`./apps/admin/dist`)
5. Set `VITE_API_URL` to your Cloudflare Worker URL (`https://chronicle-api.<worker>.workers.dev/api`) and click **Apply**.

---

### Option 2: Manual Static Site Setup in Render Dashboard

#### A. Deploy Reader Site (`apps/readers`)
1. Click **New +** > **Static Site**.
2. Build configuration:
   - **Build Command**: `npm install && npm run build:readers`
   - **Publish Directory**: `./apps/readers/dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://chronicle-api.<worker>.workers.dev/api`

---

### B. Deploy Admin CMS (`apps/admin`)
1. In Render Dashboard, click **New +** > **Static Site**.
2. Connect the same repository.
3. Set the following build configuration:
   - **Name**: `chronicle-admin`
   - **Branch**: `main`
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://chronicle-api.<your-subdomain>.workers.dev/api`
5. Click **Create Static Site**.

---

## 3. Quick Test Checklist

1. **Verify Backend Health**:  
   Visit `https://chronicle-api.<your-subdomain>.workers.dev/api/health` — should return:
   ```json
   { "status": "ok", "service": "Chronicle REST & AI Engine" }
   ```
2. **Verify Frontend**:  
   Open your Render Static URL. Articles, categories, comments, and views counter will load directly from your Cloudflare Worker.
3. **CORS**:  
   The Cloudflare Worker adapter in `apps/server/src/worker.ts` includes automatic HTTP `OPTIONS` preflight response and wildcard cross-origin headers, ensuring seamless communication between Render domains and Cloudflare.
