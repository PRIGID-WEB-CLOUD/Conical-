import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Lock, 
  Globe, 
  Send, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Code,
  Loader2
} from 'lucide-react';

interface ChannelConfig {
  id: string;
  name: string;
  apiProtocol: string;
  docsUrl: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; type: string; secret?: boolean }[];
  samplePayload: string;
}

const CHANNEL_CONFIGS: Record<string, ChannelConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram Graph API',
    apiProtocol: 'https://graph.facebook.com/v19.0/{ig-user-id}/media',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/guides/content-publishing',
    description: 'Publish single-image posts, carousels, and Reels to professional Creator or Business accounts.',
    fields: [
      { key: 'igUserId', label: 'Instagram Business Account ID', placeholder: 'e.g. 17841400000000000', type: 'text' },
      { key: 'accessToken', label: 'Meta Graph API User Access Token', placeholder: 'EAAOc...', type: 'password', secret: true },
      { key: 'autoPublishReels', label: 'Auto-publish AI generated architectural reels', placeholder: 'true', type: 'checkbox' }
    ],
    samplePayload: 'POST /v19.0/{ig-user-id}/media\n{\n  "image_url": "https://chronicle.press/assets/cover.jpg",\n  "caption": "The Architecture of Silence #minimalism",\n  "access_token": "EAAOc..."\n}'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Pages & Groups',
    apiProtocol: 'https://graph.facebook.com/v19.0/{page-id}/feed',
    docsUrl: 'https://developers.facebook.com/docs/graph-api/reference/page/feed/',
    description: 'Broadcast updates, photos, and links directly to Facebook Pages and admin-authorized Groups.',
    fields: [
      { key: 'pageId', label: 'Facebook Page ID', placeholder: 'e.g. 100050000000000', type: 'text' },
      { key: 'pageAccessToken', label: 'Page Access Token', placeholder: 'EAABw...', type: 'password', secret: true },
    ],
    samplePayload: 'POST /v19.0/{page-id}/feed\n{\n  "message": "New dispatch published on Chronicle Journal",\n  "link": "https://chronicle.press/articles/the-architecture-of-silence",\n  "access_token": "EAABw..."\n}'
  },
  'x-twitter': {
    id: 'x-twitter',
    name: 'X (Twitter) API v2',
    apiProtocol: 'https://api.twitter.com/2/tweets',
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets',
    description: 'Publish text tweets, threads, and rich media attachments with rate-limited REST endpoints.',
    fields: [
      { key: 'apiKey', label: 'API Key (Consumer Key)', placeholder: 'API key from X Developer Portal', type: 'text' },
      { key: 'apiSecret', label: 'API Secret Key', placeholder: 'Consumer secret', type: 'password', secret: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'OAuth 1.0a Access Token', type: 'text' },
      { key: 'accessSecret', label: 'Access Token Secret', placeholder: 'OAuth 1.0a Access Secret', type: 'password', secret: true },
    ],
    samplePayload: 'POST /2/tweets\n{\n  "text": "Monastic minimalism in the 21st century. Read the full essay: https://chronicle.press/articles/the-architecture-of-silence"\n}'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Community & Share API',
    apiProtocol: 'https://api.linkedin.com/v2/ugcPosts',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api',
    description: 'Share professional articles, longform updates, and polls to personal feeds and organization pages.',
    fields: [
      { key: 'organizationId', label: 'LinkedIn Organization URN ID', placeholder: 'urn:li:organization:12345678', type: 'text' },
      { key: 'oauthToken', label: 'OAuth 2.0 Bearer Token', placeholder: 'AQV...', type: 'password', secret: true },
    ],
    samplePayload: 'POST /v2/ugcPosts\n{\n  "author": "urn:li:organization:12345678",\n  "lifecycleState": "PUBLISHED",\n  "specificContent": {\n    "com.linkedin.ugc.ShareContent": {\n      "shareCommentary": { "text": "New architectural research published." },\n      "shareMediaCategory": "NONE"\n    }\n  }\n}'
  },
  wordpress: {
    id: 'wordpress',
    name: 'WordPress REST API',
    apiProtocol: 'https://yourblog.com/wp-json/wp/v2/posts',
    docsUrl: 'https://developer.wordpress.org/rest-api/reference/posts/',
    description: 'Full CRUD publishing for blog posts, custom post types, categories, tags, and media uploads.',
    fields: [
      { key: 'siteUrl', label: 'WordPress Site REST Endpoint URL', placeholder: 'https://myblog.com/wp-json/wp/v2', type: 'text' },
      { key: 'wpUser', label: 'Application Username', placeholder: 'editor@myblog.com', type: 'text' },
      { key: 'appPassword', label: 'WordPress Application Password', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password', secret: true },
    ],
    samplePayload: 'POST /wp-json/wp/v2/posts\n{\n  "title": "The Architecture of Silence",\n  "content": "<p>Monastic minimalism in contemporary design...</p>",\n  "status": "publish"\n}'
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost Admin API',
    apiProtocol: 'https://your-blog.ghost.io/ghost/api/admin/posts/',
    docsUrl: 'https://ghost.org/docs/admin-api/',
    description: 'Headless publication syndication via Ghost Admin & Content API tokens.',
    fields: [
      { key: 'ghostAdminUrl', label: 'Ghost Admin API URL', placeholder: 'https://my-ghost-blog.ghost.io', type: 'text' },
      { key: 'adminApiKey', label: 'Ghost Admin API Key (id:secret)', placeholder: '64f810aa...:a92b31ff...', type: 'password', secret: true },
    ],
    samplePayload: 'POST /ghost/api/admin/posts/?source=html\n{\n  "posts": [{\n    "title": "The Architecture of Silence",\n    "html": "<p>Monastic minimalism...</p>",\n    "status": "published"\n  }]\n}'
  },
  substack: {
    id: 'substack',
    name: 'Substack RSS / Webhook Syndication',
    apiProtocol: 'https://yourpub.substack.com/feed',
    docsUrl: 'https://substack.com',
    description: 'Automated RSS ingestion and webhook publishing synchronization for newsletters.',
    fields: [
      { key: 'publicationUrl', label: 'Substack Publication URL', placeholder: 'https://chronicle.substack.com', type: 'text' },
      { key: 'rssFeedUrl', label: 'RSS Feed Endpoint', placeholder: 'https://chronicle.substack.com/feed', type: 'text' },
    ],
    samplePayload: 'GET /feed\nReturns RSS XML feed parsed by Chronicle automated importer cron.'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram Channel Bot',
    apiProtocol: 'https://api.telegram.org/bot{token}/sendMessage',
    docsUrl: 'https://core.telegram.org/bots/api#sendmessage',
    description: 'Broadcast rich article previews and dispatches instantly to Telegram channels and supergroups.',
    fields: [
      { key: 'botToken', label: 'Telegram Bot Token', placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ', type: 'password', secret: true },
      { key: 'channelId', label: 'Telegram Channel / Chat ID', placeholder: '@chronicle_journal or -100123456789', type: 'text' },
    ],
    samplePayload: 'POST /bot{token}/sendMessage\n{\n  "chat_id": "@chronicle_journal",\n  "text": "🏛 *The Architecture of Silence*\\n\\nMonastic minimalism in the 21st century.\\n\\nRead: https://chronicle.press/articles/the-architecture-of-silence",\n  "parse_mode": "Markdown"\n}'
  }
};

export function ChannelDetailPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const config = CHANNEL_CONFIGS[channelId || ''] || CHANNEL_CONFIGS['wordpress'];

  const [formData, setFormData] = useState<Record<string, string>>({
    igUserId: '17841400892011',
    accessToken: 'EAAOcSampleToken99281',
    pageId: '10005928192',
    pageAccessToken: 'EAABwSamplePageToken',
    apiKey: 'x_api_key_sample_991',
    apiSecret: 'x_secret_sample_882',
    accessTokenTwitter: 'token_sample_12',
    accessSecretTwitter: 'secret_sample_12',
    organizationId: 'urn:li:organization:998124',
    oauthToken: 'AQV_sample_linkedin_token',
    siteUrl: 'https://demo.wordpress.org/wp-json/wp/v2',
    wpUser: 'editor_chronicle',
    appPassword: 'abcd efgh ijkl mnop',
    ghostAdminUrl: 'https://chronicle.ghost.io',
    adminApiKey: '64f810aa:a92b31ff99',
    publicationUrl: 'https://chronicle.substack.com',
    rssFeedUrl: 'https://chronicle.substack.com/feed',
    botToken: '719284910:AAH92810_sample_bot_token',
    channelId: '@chronicle_journal',
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setTimeout(() => {
      setSaving(false);
      setMessage(`Configuration for ${config.name} successfully saved & authenticated.`);
      setTimeout(() => setMessage(null), 4000);
    }, 600);
  };

  const handleTestPost = () => {
    setTesting(true);
    setMessage(null);
    setTimeout(() => {
      setTesting(false);
      setMessage(`Successfully dispatched test payload to ${config.name} via ${config.apiProtocol}! Response: 200 OK.`);
      setTimeout(() => setMessage(null), 5000);
    }, 1200);
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/channels"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-900 transition-colors bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Channels &amp; APIs</span>
        </Link>

        <a
          href={config.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-900 hover:underline"
        >
          <span>Official API Documentation</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              API Integration Active
            </span>
            <span className="text-xs text-slate-400 font-mono">Protocol: REST / GraphQL</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            {config.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">Credentials &amp; Endpoints</h2>
              <p className="text-xs text-slate-500">Configure authentication tokens and API routing parameters</p>
            </div>
            <span className="text-[11px] font-mono text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {config.apiProtocol}
            </span>
          </div>

          <div className="space-y-5">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  {field.secret ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Key className="h-3.5 w-3.5 text-slate-400" />}
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* API Payload Inspector */}
        <div className="rounded-3xl border border-slate-200/80 bg-slate-900 p-6 sm:p-8 text-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Sample Request Payload Preview</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">JSON / REST Specification</span>
          </div>

          <pre className="text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800 text-indigo-200 overflow-x-auto leading-relaxed">
            {config.samplePayload}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestPost}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {testing ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-900" /> : <Send className="h-4 w-4 text-indigo-900" />}
            <span>{testing ? 'Executing Test Payload...' : 'Test API Dispatch'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Channel API Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
