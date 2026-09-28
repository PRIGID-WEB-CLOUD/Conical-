import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { createApiApp } from './apps/server/src/index.js';
import { serverStore } from './apps/server/src/store.js';

const API_PORT = Number(process.env.API_PORT) || 4000;
const ADMIN_PORT = Number(process.env.ADMIN_PORT) || 3001;
const GATEWAY_PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// HTTP Proxy handler for routing requests from Gateway (Port 3000) to sub-servers
function proxyToPort(targetPort: number) {
  return (req: express.Request, res: express.Response) => {
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${targetPort}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[Gateway Proxy Error] ${req.method} ${req.originalUrl} -> 127.0.0.1:${targetPort}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: `Sub-service on port ${targetPort} is currently unreachable.` });
      }
    });

    req.pipe(proxyReq, { end: true });
  };
}

async function startMultiPortMonorepo() {
  console.log(`[Monorepo Engine] Initializing multi-port service cluster (env: ${process.env.NODE_ENV || 'development'})...`);

  // =========================================================================
  // 1. REST & AI API SERVER (Port 4000)
  // =========================================================================
  const apiApp = createApiApp();
  apiApp.listen(API_PORT, () => {
    console.log(`⚡ REST & AI API Server active on distinct PORT ${API_PORT}`);
  });

  // =========================================================================
  // 2. ADMIN CMS APPLICATION SERVER (Port 3001)
  // =========================================================================
  const adminApp = express();

  if (!isProd) {
    const adminVite = await createViteServer({
      server: { middlewareMode: true, port: ADMIN_PORT },
      appType: 'spa',
      root: path.resolve(process.cwd(), 'apps/admin'),
    });

    adminApp.use('/admin', (req, res, next) => {
      if (req.originalUrl === '/admin') {
        return res.redirect(301, '/admin/');
      }

      req.url = req.url.replace(/^\/admin/, '') || '/';

      adminVite.middlewares(req, res, async (err) => {
        if (err) return next(err);
        if (!res.headersSent) {
          try {
            const templatePath = path.resolve(process.cwd(), 'apps/admin/index.html');
            let template = fs.readFileSync(templatePath, 'utf-8');
            template = await adminVite.transformIndexHtml(req.originalUrl || '/admin/', template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } catch (e) {
            next(e);
          }
        }
      });
    });

    adminApp.use(adminVite.middlewares);
  } else {
    const adminDist = path.resolve(process.cwd(), 'apps/admin/dist');
    if (fs.existsSync(adminDist)) {
      adminApp.use('/admin', express.static(adminDist));
      adminApp.get(['/admin', '/admin/*'], (_req, res) => {
        res.sendFile(path.join(adminDist, 'index.html'));
      });
    }
  }

  adminApp.listen(ADMIN_PORT, () => {
    console.log(`✍️  Admin CMS Workspace active on distinct PORT ${ADMIN_PORT}`);
  });

  // =========================================================================
  // 3. READERS MAGAZINE & UNIFIED GATEWAY SERVER (Port 3000)
  // =========================================================================
  const gatewayApp = express();

  // Forward /api requests to API Server (Port 4000)
  gatewayApp.use('/api', proxyToPort(API_PORT));

  // Forward /admin requests to Admin Server (Port 3001)
  gatewayApp.use('/admin', proxyToPort(ADMIN_PORT));

  // Dynamic Real-Time Sitemap.xml
  gatewayApp.get('/sitemap.xml', (req, res) => {
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.headers.host || 'chronicle.press';
    const baseUrl = `${protocol}://${host}`;

    const publishedPosts = serverStore.getPosts({ status: 'published' });
    const now = new Date().toISOString();

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/articles', priority: '0.9', changefreq: 'daily' },
      { path: '/masthead', priority: '0.8', changefreq: 'weekly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/citations', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const post of publishedPosts) {
      const postDate = post.updatedAt || post.publishedAt || now;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/articles/${post.slug}</loc>\n`;
      xml += `    <lastmod>${postDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      if (post.featuredImage) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${post.featuredImage.replace(/&/g, '&amp;')}</image:loc>\n`;
        xml += `      <image:title>${post.title.replace(/[<>&'"]/g, '')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    const authors = serverStore.getAuthors();
    for (const author of authors) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/authors/${author.slug || author.id}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.75</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Standard Robots.txt
  gatewayApp.get('/robots.txt', (req, res) => {
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.headers.host || 'chronicle.press';
    const baseUrl = `${protocol}://${host}`;

    const robotsTxt = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  if (!isProd) {
    const readersVite = await createViteServer({
      server: { middlewareMode: true, port: GATEWAY_PORT },
      appType: 'spa',
      root: path.resolve(process.cwd(), 'apps/readers'),
    });

    gatewayApp.use(readersVite.middlewares);
  } else {
    const readersDist = path.resolve(process.cwd(), 'apps/readers/dist');
    if (fs.existsSync(readersDist)) {
      gatewayApp.use(express.static(readersDist));
      gatewayApp.get('*', (_req, res) => {
        res.sendFile(path.join(readersDist, 'index.html'));
      });
    }
  }

  gatewayApp.listen(GATEWAY_PORT, () => {
    console.log(`\n==================================================================`);
    console.log(`🏛️  CHRONICLE MULTI-PORT SERVICE CLUSTER ONLINE`);
    console.log(`------------------------------------------------------------------`);
    console.log(`📖 Readers Journal App: http://localhost:${GATEWAY_PORT}/        (PORT ${GATEWAY_PORT})`);
    console.log(`✍️  Admin CMS Workspace: http://localhost:${ADMIN_PORT}/admin/   (PORT ${ADMIN_PORT})`);
    console.log(`⚡ REST & AI API Server: http://localhost:${API_PORT}/api/health   (PORT ${API_PORT})`);
    console.log(`------------------------------------------------------------------`);
    console.log(`🔗 Unified Preview Gateway (Port 3000) routing /admin -> :3001 & /api -> :4000`);
    console.log(`==================================================================\n`);
  });
}

startMultiPortMonorepo().catch((err) => {
  console.error('[MultiPort Monorepo Error]', err);
  process.exit(1);
});
