import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/channels - Get all channels and their ENV configuration status
router.get('/', (_req: Request, res: Response) => {
  const { appId, appSecret } = serverStore.getMetaCredentials();
  const hasMetaApp = Boolean(appId && appSecret);

  const envConfig = {
    meta_app: hasMetaApp,
    instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_USER_ID || hasMetaApp),
    'instagram-channel': !!(process.env.INSTAGRAM_CHANNEL_TOKEN || hasMetaApp),
    facebook: !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ID || hasMetaApp),
    'facebook-group': !!(process.env.FACEBOOK_GROUP_ACCESS_TOKEN || hasMetaApp),
    'x-twitter': !!(process.env.X_API_KEY || process.env.X_ACCESS_TOKEN),
    linkedin: !!(process.env.LINKEDIN_OAUTH_TOKEN || process.env.LINKEDIN_ORG_ID),
    wordpress: !!(process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_SITE_URL),
    ghost: !!(process.env.GHOST_ADMIN_API_KEY || process.env.GHOST_ADMIN_URL),
    substack: !!(process.env.SUBSTACK_RSS_FEED_URL || process.env.SUBSTACK_PUBLICATION_URL),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CHANNEL_ID),
    youtube: !!(process.env.YOUTUBE_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_TOKEN),
    blogger: !!(process.env.BLOGGER_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_TOKEN),
    'whatsapp-channel': !!(process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_PHONE_ID || hasMetaApp),
  };

  res.json({
    envConfig,
    metaConfig: serverStore.getMetaConfigStatus()
  });
});

// GET /api/channels/meta-config - Retrieve Meta App config status
router.get('/meta-config', (_req: Request, res: Response) => {
  res.json({
    metaConfig: serverStore.getMetaConfigStatus()
  });
});

// POST /api/channels/meta-config - Set or update Meta App ID and Secret
router.post('/meta-config', (req: Request, res: Response) => {
  const { appId, appSecret } = req.body;
  if (!appId || !appSecret) {
    return res.status(400).json({ error: 'Both appId and appSecret are required' });
  }
  serverStore.setMetaConfig(String(appId), String(appSecret));
  res.json({
    success: true,
    metaConfig: serverStore.getMetaConfigStatus()
  });
});

// GET /api/channels/syndications - Get syndication history logs
router.get('/syndications', (_req: Request, res: Response) => {
  const logs = serverStore.getSyndications();
  res.json({ syndications: logs });
});

// POST /api/channels/syndications/:id/repost - Re-syndicate / repost a failed dispatch
router.post('/syndications/:id/repost', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = await serverStore.repostSyndication(id);
  if (!updated) {
    return res.status(404).json({ error: 'Syndication log not found' });
  }
  res.json({ success: true, syndication: updated });
});

// DELETE /api/channels/syndications/:id - Remove / delete a syndication log
router.delete('/syndications/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ok = serverStore.deleteSyndication(id);
  if (!ok) {
    return res.status(404).json({ error: 'Syndication log not found' });
  }
  res.json({ success: true, id });
});

// POST /api/channels/:channelId/sync-metrics - Fetch/Sync engagement metrics from social API to database
router.post('/:channelId/sync-metrics', (req: Request, res: Response) => {
  const channelId = String(req.params.channelId);
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }
  const result = serverStore.syncSocialMetrics(postId, channelId);
  if (!result) {
    return res.status(404).json({ error: 'Post or Channel configuration mismatch' });
  }
  res.json({ success: true, ...result });
});

// GET /api/channels/:channelId/auth-url - Construct dynamic OAuth2 authorize URL
router.get('/:channelId/auth-url', (req: Request, res: Response) => {
  const channelId = String(req.params.channelId);
  const origin = req.headers.referer || req.headers.origin || 'https://ais-dev-6k4td64rydv7fzi3tlpvdl-57519113824.europe-west3.run.app';
  // Clean up trailing slash
  const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const redirectUri = `${cleanOrigin}/api/channels/${channelId}/callback`;

  if (channelId === 'youtube' || channelId === 'blogger') {
    const clientId = process.env.GOOGLE_CLIENT_ID || '667446834836-mock.apps.googleusercontent.com';
    const scopes = channelId === 'youtube'
      ? 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile'
      : 'https://www.googleapis.com/auth/blogger https://www.googleapis.com/auth/userinfo.profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
    return res.json({ url: authUrl });
  }

  if (channelId === 'x-twitter') {
    const clientId = process.env.X_CLIENT_ID || 'XTWITTER_MOCK_CLIENT_ID';
    const scopes = 'tweet.read tweet.write users.read offline.access';
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=state&code_challenge=challenge&code_challenge_method=plain`;
    return res.json({ url: authUrl });
  }

  if (channelId === 'linkedin') {
    const clientId = process.env.LINKEDIN_CLIENT_ID || 'LINKEDIN_MOCK_CLIENT_ID';
    const scopes = 'w_member_social openid profile email';
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=state`;
    return res.json({ url: authUrl });
  }
  
  const { appId: metaAppId } = serverStore.getMetaCredentials();
  const clientId = channelId === 'instagram' 
    ? (metaAppId || process.env.INSTAGRAM_CLIENT_ID || '123456789') 
    : (metaAppId || process.env.FACEBOOK_CLIENT_ID || '987654321');

  const scopes = channelId === 'instagram'
    ? 'instagram_basic,instagram_content_publish'
    : 'public_profile,email,pages_show_list,pages_manage_posts,publish_to_groups';

  const providerAuthUrl = channelId === 'instagram'
    ? 'https://api.instagram.com/oauth/authorize'
    : 'https://www.facebook.com/v19.0/dialog/oauth';

  const authUrl = `${providerAuthUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
  
  res.json({ url: authUrl });
});

// GET /api/channels/:channelId/callback - OAuth2 callback receiver and cross-origin notifier
router.get(['/:channelId/callback', '/:channelId/callback/'], async (req: Request, res: Response) => {
  const channelId = String(req.params.channelId);
  const code = req.query.code as string | undefined;

  if (code) {
    const origin = req.headers.referer || req.headers.origin || 'https://ais-dev-6k4td64rydv7fzi3tlpvdl-57519113824.europe-west3.run.app';
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const redirectUri = `${cleanOrigin}/api/channels/${channelId}/callback`;

    // Attempt real Meta token exchange if Meta App ID and Secret are configured
    const isMetaChannel = ['instagram', 'instagram-channel', 'facebook', 'facebook-group', 'whatsapp-channel'].includes(channelId);
    let exchangedToken: string | null = null;
    if (isMetaChannel) {
      const exchangeResult = await serverStore.exchangeMetaOAuthCode(code, redirectUri);
      if (exchangeResult?.accessToken) {
        exchangedToken = exchangeResult.accessToken;
      }
    }

    const tokenToStore = exchangedToken || `oauth_token_${code.substring(0, 15)}`;

    if (channelId === 'instagram' || channelId === 'instagram-channel') {
      process.env.INSTAGRAM_ACCESS_TOKEN = tokenToStore;
      if (channelId === 'instagram-channel') process.env.INSTAGRAM_CHANNEL_TOKEN = tokenToStore;
    } else if (channelId === 'facebook' || channelId === 'facebook-group') {
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN = tokenToStore;
      if (channelId === 'facebook-group') process.env.FACEBOOK_GROUP_ACCESS_TOKEN = tokenToStore;
    } else if (channelId === 'youtube') {
      process.env.YOUTUBE_ACCESS_TOKEN = tokenToStore;
      process.env.GOOGLE_OAUTH_TOKEN = tokenToStore;
    } else if (channelId === 'blogger') {
      process.env.BLOGGER_ACCESS_TOKEN = tokenToStore;
      process.env.GOOGLE_OAUTH_TOKEN = tokenToStore;
    } else if (channelId === 'x-twitter') {
      process.env.X_ACCESS_TOKEN = tokenToStore;
    } else if (channelId === 'linkedin') {
      process.env.LINKEDIN_OAUTH_TOKEN = tokenToStore;
    } else if (channelId === 'whatsapp-channel') {
      process.env.WHATSAPP_ACCESS_TOKEN = tokenToStore;
    }
  }

  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #fafafa;">
        <h2 style="color: #1e1b4b;">Connecting Authorization...</h2>
        <p style="color: #64748b;">Please wait, closing automatically.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', channelId: '${channelId}' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

export default router;
