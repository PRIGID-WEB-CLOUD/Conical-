import { createApiApp } from './index.js';
import { store } from './store.js';
import { Readable } from 'node:stream';
import http from 'node:http';

let appInstance: any = null;

function getApp() {
  if (!appInstance) {
    appInstance = createApiApp();
  }
  return appInstance;
}

// Bridges standard Fetch API Request/Response into Express (req, res)
function handleWithExpress(app: any, webReq: Request): Promise<Response> {
  return new Promise(async (resolve, reject) => {
    try {
      const url = new URL(webReq.url);
      const bodyBuffer = webReq.body ? Buffer.from(await webReq.arrayBuffer()) : Buffer.alloc(0);

      const reqStream = new Readable({
        read() {
          if (bodyBuffer.length > 0) {
            this.push(bodyBuffer);
          }
          this.push(null);
        }
      });

      const headers: Record<string, string> = {};
      for (const [key, val] of webReq.headers.entries()) {
        headers[key.toLowerCase()] = val;
      }

      const req = Object.assign(reqStream, {
        url: url.pathname + url.search,
        method: webReq.method,
        headers,
        rawHeaders: [],
        httpVersion: '1.1',
        connection: { remoteAddress: '127.0.0.1' },
        socket: { remoteAddress: '127.0.0.1', encrypted: true, destroy() {} }
      });

      const resHeaders = new Headers();
      const chunks: Buffer[] = [];
      let statusCode = 200;

      const res = new http.ServerResponse(req as any);

      res.writeHead = function (code: any, reason?: any, headersArg?: any) {
        statusCode = typeof code === 'number' ? code : 200;
        const h = typeof reason === 'object' ? reason : headersArg;
        if (h) {
          for (const [k, v] of Object.entries(h)) {
            if (Array.isArray(v)) {
              v.forEach((val) => resHeaders.append(k, String(val)));
            } else if (v != null) {
              resHeaders.set(k, String(v));
            }
          }
        }
        return this;
      };

      res.setHeader = function (name: string, value: any) {
        if (Array.isArray(value)) {
          resHeaders.delete(name);
          value.forEach((val) => resHeaders.append(name, String(val)));
        } else {
          resHeaders.set(name, String(value));
        }
        return this;
      };

      (res as any).getHeader = function (name: string) {
        return resHeaders.get(name) || undefined;
      };

      (res as any).write = function (chunk: any) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      };

      (res as any).end = function (chunk?: any) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const resBody = Buffer.concat(chunks);
        resolve(
          new Response(resBody, {
            status: statusCode,
            headers: resHeaders
          })
        );
        return res;
      };

      app(req, res);
    } catch (err) {
      reject(err);
    }
  });
}

const worker = {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // 1. Sync Cloudflare environment variables into process.env
    if (env && typeof env === 'object') {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string' && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    const url = new URL(request.url);

    // 2. Route API requests to Express
    if (url.pathname.startsWith('/api')) {
      const app = getApp();
      return handleWithExpress(app, request);
    }

    // 3. Static asset fallback (if Cloudflare Workers Static Assets binding is attached)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    // Default redirect or info
    return new Response(
      JSON.stringify({
        name: 'Chronicle API Server',
        status: 'online',
        endpoints: ['/api/health', '/api/posts', '/api/channels', '/api/settings', '/api/comments']
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },

  // 4. Cloudflare Cron Trigger support for scheduled publishing
  async scheduled(event: any, env: any, ctx: any): Promise<void> {
    if (env && typeof env === 'object') {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string' && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    store.runCronJob();
  }
};

export default worker;
