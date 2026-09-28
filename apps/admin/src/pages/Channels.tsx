import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Globe, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Settings
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  category: 'Social Media' | 'Blogging & CMS' | 'Community & Chat';
  description: string;
  apiName: string;
  status: 'connected' | 'available' | 'webhook';
  icon: any;
  docsUrl: string;
  capabilities: string[];
}

const CHANNELS_DATA: Channel[] = [
  {
    id: 'instagram',
    name: 'Instagram (Graph API)',
    category: 'Social Media',
    description: 'Publish single-image posts, carousels, and Reels to professional Creator or Business accounts.',
    apiName: 'Instagram Graph API v19.0',
    status: 'connected',
    icon: Instagram,
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
    capabilities: ['Single Images', 'Carousels', 'Reels', 'Captions & Hashtags']
  },
  {
    id: 'facebook',
    name: 'Facebook Pages & Groups',
    category: 'Social Media',
    description: 'Broadcast updates, photos, and links directly to Facebook Pages and admin-authorized Groups.',
    apiName: 'Facebook Graph API',
    status: 'connected',
    icon: Facebook,
    docsUrl: 'https://developers.facebook.com/docs/graph-api',
    capabilities: ['Page Posts', 'Group Announcements', 'Link Share Cards']
  },
  {
    id: 'x-twitter',
    name: 'X (Twitter) v2',
    category: 'Social Media',
    description: 'Publish text tweets, threads, and rich media attachments with rate-limited REST endpoints.',
    apiName: 'X API v2 (Tweets Endpoint)',
    status: 'connected',
    icon: Twitter,
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api',
    capabilities: ['Posts & Threads', 'Media Uploads', 'Polls']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Network & Pages',
    category: 'Social Media',
    description: 'Share professional articles, longform updates, and polls to personal feeds and organization pages.',
    apiName: 'LinkedIn Share & Community API',
    status: 'connected',
    icon: Linkedin,
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
    capabilities: ['Organization Posts', 'Personal Feed Articles', 'Rich Media']
  },
  {
    id: 'wordpress',
    name: 'WordPress CMS',
    category: 'Blogging & CMS',
    description: 'Full CRUD publishing for blog posts, custom post types, categories, tags, and media uploads.',
    apiName: 'WordPress REST API / XML-RPC',
    status: 'connected',
    icon: Globe,
    docsUrl: 'https://developer.wordpress.org/rest-api/',
    capabilities: ['Full Post CRUD', 'Media Uploads', 'Categories & Tags']
  },
  {
    id: 'ghost',
    name: 'Ghost Publishing Platform',
    category: 'Blogging & CMS',
    description: 'Headless publication syndication via Ghost Admin & Content API tokens.',
    apiName: 'Ghost Admin API',
    status: 'available',
    icon: Cpu,
    docsUrl: 'https://ghost.org/docs/admin-api/',
    capabilities: ['Scheduled Posts', 'Newsletters', 'Tag Management']
  },
  {
    id: 'substack',
    name: 'Substack Syndication',
    category: 'Blogging & CMS',
    description: 'Automated RSS ingestion and webhook publishing synchronization for newsletters.',
    apiName: 'Substack RSS / Webhook Feeds',
    status: 'webhook',
    icon: Sparkles,
    docsUrl: 'https://substack.com',
    capabilities: ['RSS Feed Sync', 'Automated Email Triggers']
  },
  {
    id: 'telegram',
    name: 'Telegram Channel Bot',
    category: 'Community & Chat',
    description: 'Broadcast rich article previews and dispatches instantly to Telegram channels and supergroups.',
    apiName: 'Telegram Bot API (sendMessage)',
    status: 'available',
    icon: Send,
    docsUrl: 'https://core.telegram.org/bots/api',
    capabilities: ['Channel Broadcasts', 'Markdown Previews', 'Inline Buttons']
  }
];

export function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(CHANNELS_DATA);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'connected' ? 'available' : 'connected';
          setSuccessMsg(`Channel "${c.name}" status updated to ${nextStatus.toUpperCase()}.`);
          setTimeout(() => setSuccessMsg(null), 3000);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleTestSync = (channel: Channel) => {
    setTestingId(channel.id);
    setTimeout(() => {
      setTestingId(null);
      setSuccessMsg(`Successfully executed test payload on ${channel.name} via ${channel.apiName}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cross-Platform Syndication &amp; APIs
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Share2 className="h-7 w-7 text-indigo-900" />
            <span>Social Media &amp; Blog Channels</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure official platform APIs for Instagram, X, LinkedIn, Facebook, WordPress, Ghost, and Telegram syndication.
          </p>
        </div>

        <a
          href="/CHANNELS.md"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>View CHANNELS.md Docs</span>
        </a>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isConnected = channel.status === 'connected';
          const isWebhook = channel.status === 'webhook';
          const isTesting = testingId === channel.id;

          return (
            <div
              key={channel.id}
              className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
                isConnected ? 'border-indigo-200 ring-2 ring-indigo-900/5' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-950">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 text-base">{channel.name}</h3>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                        {channel.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    )}
                    {isWebhook && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Webhook Sync
                      </span>
                    )}
                    {!isConnected && !isWebhook && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        Ready to Connect
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{channel.description}</p>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Target API Protocol</div>
                  <div className="text-xs font-mono font-bold text-indigo-950 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    {channel.apiName}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Supported Capabilities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {channel.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-lg bg-indigo-50/60 border border-indigo-100/60 px-2.5 py-0.5 text-[10px] font-medium text-indigo-900"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/channels/${channel.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-indigo-950 hover:text-white text-slate-800 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Configure API</span>
                </Link>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestSync(channel)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-indigo-900" />}
                      <span>{isTesting ? 'Syncing...' : 'Test'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleConnection(channel.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      isConnected
                        ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-indigo-950 text-white hover:bg-indigo-900'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
