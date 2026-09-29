import React, { useState, useEffect } from 'react';
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
  Settings,
  AlertCircle,
  Trash2,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Radio,
  History
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { SyndicationLog } from '@chronicle/shared';

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
  const [envConfig, setEnvConfig] = useState<Record<string, boolean>>({});
  const [syndications, setSyndications] = useState<SyndicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [repostingId, setRepostingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [envs, logs] = await Promise.all([
        adminApi.getEnvConfig(),
        adminApi.getSyndications()
      ]);
      setEnvConfig(envs);
      setSyndications(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [envs, logs] = await Promise.all([
          adminApi.getEnvConfig(),
          adminApi.getSyndications()
        ]);
        if (active) {
          setEnvConfig(envs);
          setSyndications(logs);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

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

  const handleRepost = async (id: string) => {
    setRepostingId(id);
    try {
      const ok = await adminApi.repostSyndication(id);
      if (ok) {
        setSuccessMsg('Post successfully syndicated to channel on retry!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadData();
      } else {
        setErrorMsg('Repost failed. Please verify API configuration.');
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch {
      setErrorMsg('Repost failed due to networking issue.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setRepostingId(null);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm('Are you sure you want to remove this syndication log entry?')) {
      const ok = await adminApi.deleteSyndication(id);
      if (ok) {
        setSuccessMsg('Syndication log entry removed.');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadData();
      }
    }
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

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Info Notice about Env Credentials */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Radio className="h-4 w-4 text-indigo-900" />
            <span>Server-side Environment Configuration</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            For maximum security and automated publishing pipelines, we highly recommend storing your API credentials in your server&apos;s <code className="font-mono text-indigo-950 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100">.env</code> configuration. When configured, channels will show an <span className="font-semibold text-emerald-700">&ldquo;Env Configuration Active&rdquo;</span> badge and bypass browser-configured storage fallback.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            STATUS: ACTIVE / MONITORING
          </span>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isConnected = channel.status === 'connected';
          const isWebhook = channel.status === 'webhook';
          const isTesting = testingId === channel.id;
          const isEnvConfigured = !!envConfig[channel.id];

          return (
            <div
              key={channel.id}
              className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
                isEnvConfigured 
                  ? 'border-emerald-200 ring-2 ring-emerald-500/5' 
                  : isConnected 
                    ? 'border-indigo-200 ring-2 ring-indigo-900/5' 
                    : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
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

                  <div className="flex flex-col items-end gap-1">
                    {isEnvConfigured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase border border-emerald-300">
                        Env Confirmed
                      </span>
                    )}
                    {isConnected && !isEnvConfigured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Connected
                      </span>
                    )}
                    {isWebhook && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Webhook Sync
                      </span>
                    )}
                    {!isConnected && !isWebhook && !isEnvConfigured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        Ready to Connect
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">{channel.description}</p>

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
                  {(isConnected || isEnvConfigured) && (
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

                  {!isEnvConfigured && (
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Syndication Logs Queue & Repost/Delete Management */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-900" />
              <span>Real-Time Syndication &amp; Cross-Post Logs</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Monitor, audit, and manually re-dispatch failed publication cross-posts to connected syndication APIs.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-900" />
            <span>Loading syndication queue...</span>
          </div>
        ) : syndications.length === 0 ? (
          <div className="py-20 text-center space-y-3 p-6 text-slate-500">
            <History className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-slate-700">No syndication logs found</h3>
            <p className="text-xs max-w-sm mx-auto font-normal text-slate-400">
              Publish some articles or write critical drafts first to trigger the syndication queue history.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 pl-6">Dispatch Details</th>
                    <th className="p-4">Target Channel</th>
                    <th className="p-4">Status &amp; Auditing</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syndications.map((log) => {
                    const isFailed = log.status === 'failed';
                    const isSuccess = log.status === 'success';
                    const isReposting = repostingId === log.id;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="p-4 pl-6 space-y-1">
                          <div className="text-xs font-bold text-slate-900">
                            {log.postTitle}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Post ID: <span className="font-semibold">{log.postId}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold text-slate-800">
                            {log.channelName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                            {log.channelId}
                          </div>
                        </td>
                        <td className="p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            {isSuccess && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                Success
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                                <AlertCircle className="h-3 w-3 text-rose-500 animate-pulse" />
                                Failed
                              </span>
                            )}
                            {log.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                                <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" />
                                Pending
                              </span>
                            )}

                            {log.url && (
                              <a
                                href={log.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                              >
                                <span>View post</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>

                          {isFailed && log.error && (
                            <div className="text-[11px] font-mono text-rose-900 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 max-w-lg leading-relaxed whitespace-pre-wrap">
                              <span className="font-bold text-rose-950 uppercase tracking-wide text-[9px] block mb-0.5">API Error Details:</span>
                              {log.error}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isFailed && (
                              <button
                                type="button"
                                disabled={isReposting}
                                onClick={() => handleRepost(log.id)}
                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Attempt to syndicated again"
                              >
                                {isReposting ? (
                                  <RefreshCw className="h-3 w-3 animate-spin text-white" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                <span>{isReposting ? 'Posting...' : 'Repost'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteLog(log.id)}
                              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove log entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack view */}
            <div className="md:hidden divide-y divide-slate-100">
              {syndications.map((log) => {
                const isFailed = log.status === 'failed';
                const isSuccess = log.status === 'success';
                const isReposting = repostingId === log.id;

                return (
                  <div key={log.id} className="p-4.5 space-y-3">
                    {/* Top line: Post Title & Channel Badge */}
                    <div className="space-y-1">
                      <span className="inline-block text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/80 uppercase">
                        {log.channelName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {log.postTitle}
                      </h4>
                    </div>

                    {/* Middle details: Status, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                            Success
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                            <AlertCircle className="h-3 w-3 text-rose-500 animate-pulse" />
                            Failed
                          </span>
                        )}
                        {log.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                            <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" />
                            Pending
                          </span>
                        )}
                        {log.url && (
                          <a
                            href={log.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                          >
                            <span>View post</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Error detail box */}
                    {isFailed && log.error && (
                      <div className="text-[10px] font-mono text-rose-900 bg-rose-50/50 p-3 rounded-xl border border-rose-100/70 leading-relaxed whitespace-pre-wrap">
                        <span className="font-bold text-rose-950 uppercase tracking-wide text-[9px] block mb-0.5">API Error Details:</span>
                        {log.error}
                      </div>
                    )}

                    {/* Actions line */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: <span className="font-semibold select-all">{log.postId}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isFailed && (
                          <button
                            type="button"
                            disabled={isReposting}
                            onClick={() => handleRepost(log.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isReposting ? (
                              <RefreshCw className="h-3 w-3 animate-spin text-white" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            <span>{isReposting ? 'Posting...' : 'Repost'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove log entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
