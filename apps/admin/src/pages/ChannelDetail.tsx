import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  MessageSquare, 
  Repeat, 
  Send, 
  MoreHorizontal, 
  CheckCircle,
  CheckCircle2,
  Bookmark,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send as TelegramIcon,
  Globe,
  Cpu,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Users,
  Trash2,
  Edit2,
  User,
  ShieldAlert,
  Flame,
  MessageSquareShare,
  Lock,
  Unlock,
  KeyRound,
  Info,
  Layout,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { Post, Comment } from '@chronicle/shared';

export function ChannelDetailPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const id = channelId || 'instagram';

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  // Simulated engagement counts mapping to post views / shares
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [reposts, setReposts] = useState(38);
  const [hasReposted, setHasReposted] = useState(false);

  // Facebook-specific layout toggle (Page Feed vs Group Thread)
  const [metaSubChannel, setMetaSubChannel] = useState<'page' | 'group'>('page');

  // Connection State for OAuth2
  const [isChannelConnected, setIsChannelConnected] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('Managing Editor (You)');
  const [showComments, setShowComments] = useState(true);

  // Threaded replies, editing and liking comment states
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [localLikedComments, setLocalLikedComments] = useState<Record<string, { count: number; liked: boolean }>>({});

  // 1. Fetch posts & channel connection status on mount
  useEffect(() => {
    let active = true;
    
    // Fetch posts
    adminApi.getPosts().then((fetched) => {
      if (active) {
        setPosts(fetched);
        if (fetched.length > 0) {
          setSelectedPost(fetched[0]);
        }
        setLoadingPosts(false);
      }
    }).catch(() => {
      if (active) setLoadingPosts(false);
    });

    // Check if channel is authenticated via env config on start
    adminApi.getEnvConfig().then((config) => {
      if (active) {
        setIsChannelConnected(!!config[id as keyof typeof config]);
      }
    });

    // Listen for OAUTH_AUTH_SUCCESS from our callback popup
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.channelId === id) {
        setIsChannelConnected(true);
        setSyncSuccessMsg(`Meta OAuth2 authenticated successfully! Channel is now fully operational.`);
        setTimeout(() => setSyncSuccessMsg(null), 6000);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      active = false;
      window.removeEventListener('message', handleMessage);
    };
  }, [id]);

  // 2. Fetch comments and calculate engagement when selectedPost or id changes
  useEffect(() => {
    if (!selectedPost) return;

    let active = true;
    
    const fetchCommentsAndStats = async () => {
      const views = selectedPost.views || 350;
      const baseLikes = Math.round(views * 0.15) || 45;
      const baseShares = selectedPost.shares || Math.round(views * 0.04) || 12;

      try {
        const fetchedComments = await adminApi.getComments(selectedPost.id);
        if (active) {
          const postComments = fetchedComments.filter(c => c.postId === selectedPost.id);
          setComments(postComments);
          
          // Initialize comment like counts
          const likedState: Record<string, { count: number; liked: boolean }> = {};
          postComments.forEach((c) => {
            likedState[c.id] = { count: c.likes || 0, liked: false };
          });
          setLocalLikedComments(likedState);

          setLikes(baseLikes);
          setHasLiked(false);
          setReposts(baseShares);
          setHasReposted(false);
          setLoadingComments(false);
        }
      } catch {
        if (active) {
          setLikes(baseLikes);
          setHasLiked(false);
          setReposts(baseShares);
          setHasReposted(false);
          setLoadingComments(false);
        }
      }
    };

    fetchCommentsAndStats();

    return () => {
      active = false;
    };
  }, [selectedPost]);

  // Handle OAuth2 Connection triggers
  const handleConnectOAuth2 = async () => {
    try {
      const url = await adminApi.getMetaAuthUrl(id);
      if (url) {
        const authWindow = window.open(
          url,
          'meta_oauth_popup',
          'width=650,height=750,scrollbars=yes,status=yes'
        );
        if (!authWindow) {
          alert('Popup blocked. Please allow popups for this dashboard to connect Meta OAuth2.');
        }
      } else {
        alert('Failed to construct Meta OAuth2 authorization URL.');
      }
    } catch (e) {
      console.error('Meta OAuth2 failed', e);
    }
  };

  // Handle liking
  const handleLike = async () => {
    if (!selectedPost) return;
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    
    try {
      await adminApi.likePost(selectedPost.id, !nextLiked);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle reposting / sharing
  const handleRepost = async () => {
    if (!selectedPost) return;
    const nextReposted = !hasReposted;
    setHasReposted(nextReposted);
    setReposts((prev) => (nextReposted ? prev + 1 : Math.max(0, prev - 1)));
    
    try {
      await adminApi.sharePost(selectedPost.id, !nextReposted);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Comment to Backend
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentText.trim()) return;

    const newText = newCommentText.trim();
    const name = authorName.trim() || 'Anonymous Reader';

    // Optimistically insert locally
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      postId: selectedPost.id,
      content: newText,
      authorName: name,
      createdAt: new Date().toISOString(),
      relativeTime: 'Just now',
      likes: 0,
      initials: name.substring(0, 2).toUpperCase(),
      status: 'approved'
    };
    setComments((prev) => [tempComment, ...prev]);
    setLocalLikedComments((prev) => ({ ...prev, [tempComment.id]: { count: 0, liked: false } }));
    setNewCommentText('');

    try {
      const saved = await adminApi.addComment(selectedPost.id, newText, name);
      // Replace optimistic temp with real item
      setComments((prev) => prev.map(c => c.id === tempComment.id ? saved : c));
      setLocalLikedComments((prev) => {
        const next = { ...prev };
        delete next[tempComment.id];
        next[saved.id] = { count: 0, liked: false };
        return next;
      });
    } catch (e) {
      console.error('Failed to post comment to backend', e);
    }
  };

  // Reply to Comment
  const handleReplyToComment = async (commentId: string) => {
    if (!replyText.trim()) return;
    const replyStr = replyText.trim();

    // Optimistically update locally
    setComments((prev) => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, reply: replyStr, repliedAt: new Date().toISOString() };
      }
      return c;
    }));
    setReplyingCommentId(null);
    setReplyText('');

    try {
      await adminApi.replyToComment(commentId, replyStr);
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Comment
  const handleEditComment = async (commentId: string) => {
    if (!editingText.trim()) return;
    const editStr = editingText.trim();

    setComments((prev) => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, content: editStr };
      }
      return c;
    }));
    setEditingCommentId(null);
    setEditingText('');

    try {
      await adminApi.updateComment(commentId, editStr);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to permanently delete this comment from the server database?')) {
      setComments((prev) => prev.filter(c => c.id !== commentId));
      try {
        await adminApi.deleteComment(commentId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Like / Unlike comment
  const handleLikeComment = async (commentId: string) => {
    const commentState = localLikedComments[commentId] || { count: 0, liked: false };
    const nextLiked = !commentState.liked;
    const nextCount = nextLiked ? commentState.count + 1 : Math.max(0, commentState.count - 1);

    setLocalLikedComments((prev) => ({
      ...prev,
      [commentId]: { count: nextCount, liked: nextLiked }
    }));

    try {
      await adminApi.likeComment(commentId, !nextLiked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncSocialMetrics = async () => {
    if (!selectedPost) return;
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const data = await adminApi.syncSocialMetrics(id, selectedPost.id);
      if (data && data.success) {
        setLikes(data.likes);
        setReposts(data.shares);
        setSyncSuccessMsg(`Successfully synced live social data! Fetched ${data.newCommentsCount} actual user comments and updated database metrics.`);
        
        // Refresh comments list
        const fetchedComments = await adminApi.getComments(selectedPost.id);
        const postComments = fetchedComments.filter(c => c.postId === selectedPost.id);
        setComments(postComments);
        
        // Refresh like states
        const likedState: Record<string, { count: number; liked: boolean }> = {};
        postComments.forEach((c) => {
          likedState[c.id] = { count: c.likes || 0, liked: false };
        });
        setLocalLikedComments(likedState);
        
        setTimeout(() => setSyncSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Channel details data mapping
  const channelMeta = {
    instagram: { name: 'Instagram', color: 'from-pink-500 via-purple-600 to-indigo-700', icon: Instagram },
    facebook: { name: 'Facebook Pages & Groups', color: 'from-blue-600 to-indigo-900', icon: Facebook },
    'x-twitter': { name: 'X / Twitter', color: 'from-slate-900 to-slate-950', icon: Twitter },
    linkedin: { name: 'LinkedIn Network', color: 'from-blue-700 to-sky-900', icon: Linkedin },
    wordpress: { name: 'WordPress CMS', color: 'from-blue-500 to-indigo-800', icon: Globe },
    ghost: { name: 'Ghost Publishing', color: 'from-slate-800 to-slate-900', icon: Cpu },
    substack: { name: 'Substack Newsletter', color: 'from-amber-600 to-orange-800', icon: Sparkles },
    telegram: { name: 'Telegram Channel', color: 'from-sky-500 to-blue-700', icon: TelegramIcon },
    youtube: { name: 'YouTube Channel', color: 'from-red-600 to-red-800', icon: Youtube },
    blogger: { name: 'Blogger platform', color: 'from-orange-500 to-amber-700', icon: Globe },
  }[id] || { name: 'Social Channel', color: 'from-slate-900 to-indigo-950', icon: Instagram };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          to="/channels"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-900 transition-colors bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Channels</span>
        </Link>

        {/* Post Selector dropdown - Only rendered if connected */}
        {isChannelConnected && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Preview App Post:</label>
              {loadingPosts ? (
                <span className="text-xs text-slate-400 animate-pulse">Loading posts...</span>
              ) : (
                <select
                  value={selectedPost?.id || ''}
                  onChange={(e) => {
                    const found = posts.find(p => p.id === e.target.value);
                    if (found) {
                      setLoadingComments(true);
                      setSelectedPost(found);
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-900/10 cursor-pointer w-full sm:w-64"
                >
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              )}
            </div>

            {selectedPost && (
              <button
                onClick={handleSyncSocialMetrics}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 disabled:opacity-50 text-white px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm w-full sm:w-auto shrink-0"
                title="Pull actual metrics directly from social networks"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Live Metrics'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className={`rounded-3xl bg-linear-to-r ${channelMeta.color} p-8 text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <KeyRound className="h-3 w-3" />
              Dynamic {id === 'youtube' || id === 'blogger' ? 'Google' : 'Channel'} Integration
            </span>

            {/* Glowing Active badge based on real OAuth connectivity! */}
            {isChannelConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400 px-3 py-1 text-xs font-bold text-white shadow-sm uppercase animate-pulse">
                <Unlock className="h-3 w-3 text-emerald-300" />
                Connected & Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-400 px-3 py-1 text-xs font-bold text-white shadow-sm uppercase">
                <Lock className="h-3 w-3 text-rose-300" />
                Locked (Unauthorized)
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <channelMeta.icon className="h-7 w-7 shrink-0" />
              <span>{channelMeta.name} Feed Analyzer</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-normal max-w-2xl leading-relaxed">
              Experience high-fidelity layout simulations. Pull live metrics, track detailed response trees, and moderate engagement directly from the Chronicle command center.
            </p>
          </div>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Main Post Preview & Simulator / Connected Check */}
      {!isChannelConnected ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
            <Lock className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Connection Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-md mx-auto">
              Please authorize your **{channelMeta.name}** account to unlock the interactive simulator, real-time metric syncing, and official threaded moderation tools.
            </p>
          </div>

          {(id === 'facebook' || id === 'instagram' || id === 'youtube' || id === 'blogger' || id === 'x-twitter' || id === 'linkedin') ? (
            <div className="max-w-xs mx-auto">
              <button
                onClick={handleConnectOAuth2}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-4 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Unlock className="h-4 w-4" />
                <span>
                  {id === 'youtube' || id === 'blogger' ? 'Connect Google Credentials' : 
                   id === 'x-twitter' ? 'Connect X Credentials' :
                   id === 'linkedin' ? 'Connect LinkedIn Credentials' :
                   'Connect Meta Credentials'}
                </span>
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Info className="h-4 w-4 text-indigo-950" />
                <span>Manual Token Setup Required</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                This channel operates via secure server-side environment variables. Please configure your API tokens (e.g. `X_API_KEY`, `TELEGRAM_BOT_TOKEN`, etc.) in the dashboard settings to activate this layout simulator.
              </p>
            </div>
          )}
        </div>
      ) : selectedPost ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Social Simulator Preview (Col-Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-indigo-900" />
                <span>{channelMeta.name} Layout Mockup</span>
              </div>

              {/* Layout Variations for specific channels */}
              {id === 'facebook' && (
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
                  <button onClick={() => setMetaSubChannel('page')} className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${metaSubChannel === 'page' ? 'bg-white text-indigo-950 shadow-3xs' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Globe className="h-3 w-3" />
                    <span>Page Feed</span>
                  </button>
                  <button onClick={() => setMetaSubChannel('group')} className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${metaSubChannel === 'group' ? 'bg-white text-indigo-950 shadow-3xs' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Users className="h-3 w-3" />
                    <span>Group</span>
                  </button>
                </div>
              )}
            </div>

            {/* --- LAYOUTS START --- */}

            {/* 1. INSTAGRAM */}
            {id === 'instagram' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="h-full w-full rounded-full bg-white p-[2px]">
                        <img src={selectedPost.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={selectedPost.author?.name} className="h-full w-full rounded-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{selectedPost.author?.name.toLowerCase().replace(/\s+/g, '_') || 'chronicle_press'}</span>
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                      </div>
                      <div className="text-[10px] text-slate-400">Chronicle Journal • Editorial</div>
                    </div>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
                <div className="aspect-square bg-slate-100"><img src={selectedPost.featuredImage} alt={selectedPost.title} className="h-full w-full object-cover" /></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={handleLike} className="active:scale-125 transition-transform cursor-pointer"><Heart className={`h-6 w-6 ${hasLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} /></button>
                      <button onClick={() => setShowComments(!showComments)}><MessageCircle className="h-6 w-6 text-slate-700" /></button>
                      <button onClick={handleRepost}><Share2 className={`h-6 w-6 ${hasReposted ? 'text-indigo-600' : 'text-slate-700'}`} /></button>
                    </div>
                    <Bookmark className="h-6 w-6 text-slate-700" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">{likes.toLocaleString()} likes</div>
                  <div className="text-xs leading-relaxed text-slate-800">
                    <span className="font-bold mr-1.5">{selectedPost.author?.name.toLowerCase().replace(/\s+/g, '_') || 'chronicle_press'}</span>
                    <strong>{selectedPost.title}</strong> — {selectedPost.excerpt}
                  </div>
                </div>
              </div>
            )}

            {/* 2. FACEBOOK PAGE */}
            {id === 'facebook' && metaSubChannel === 'page' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="p-4 flex items-start gap-2.5">
                  <img src={selectedPost.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="Author Avatar" className="h-9 w-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">Chronicle Press <CheckCircle className="h-3 w-3 text-blue-500 fill-blue-500" /></h4>
                    <span className="text-[10px] text-slate-400">Sponsored • RSS Dispatch</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </div>
                <p className="px-4 pb-3 text-xs text-slate-800 leading-relaxed">{selectedPost.excerpt}</p>
                <div className="border-y border-slate-100 bg-slate-50 cursor-pointer">
                  <img src={selectedPost.featuredImage} alt="Post Cover" className="w-full h-48 object-cover" />
                  <div className="p-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">CHRONICLE.PRESS</span>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5">{selectedPost.title}</h5>
                  </div>
                </div>
                <div className="px-4 py-2 flex items-center justify-around border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <button onClick={handleLike} className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 ${hasLiked ? 'text-blue-600' : ''}`}><ThumbsUp className="h-4 w-4" /> <span>Like</span></button>
                  <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50"><MessageSquare className="h-4 w-4" /> <span>Comment</span></button>
                  <button onClick={handleRepost} className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 ${hasReposted ? 'text-indigo-600' : ''}`}><Share2 className="h-4 w-4" /> <span>Share</span></button>
                </div>
              </div>
            )}

            {/* 3. LINKEDIN */}
            {id === 'linkedin' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md p-4 space-y-4">
                <div className="flex items-start gap-2.5">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Author" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900">Julian Thorne</h4>
                    <p className="text-[10px] text-slate-500">Editor-in-Chief at Chronicle Press • 2h</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5"><Globe className="h-3 w-3" /> <span>Public</span></div>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  Thrilled to share our latest architectural deep-dive: <strong>{selectedPost.title}</strong>. Exploring how silence and minimalism redefine the modern urban experience.
                </p>
                <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50 cursor-pointer">
                  <img src={selectedPost.featuredImage} alt="LinkedIn Attachment" className="w-full h-44 object-cover" />
                  <div className="p-3"><h5 className="text-xs font-bold text-slate-900 leading-tight">{selectedPost.title} — Chronicle Press</h5><span className="text-[10px] text-slate-500">chronicle.press • 8 min read</span></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 border-b border-slate-100 pb-2.5">
                  <span className="h-4 w-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">👍</span>
                  <span>{likes + 120} • {comments.length} comments</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 px-2">
                  <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-blue-600 ${hasLiked ? 'text-blue-600' : ''}`}><ThumbsUp className="h-5 w-5" /> <span>Like</span></button>
                  <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-blue-600"><MessageSquare className="h-5 w-5" /> <span>Comment</span></button>
                  <button onClick={handleRepost} className={`flex items-center gap-1.5 hover:text-blue-600 ${hasReposted ? 'text-blue-600' : ''}`}><Repeat className="h-5 w-5" /> <span>Repost</span></button>
                  <button className="flex items-center gap-1.5 hover:text-blue-600"><Send className="h-5 w-5" /> <span>Send</span></button>
                </div>
              </div>
            )}

            {/* 4. TELEGRAM */}
            {id === 'telegram' && (
              <div className="rounded-3xl border border-slate-200 bg-[#74a5d4]/10 shadow-md overflow-hidden">
                <div className="bg-white p-3 border-b border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">C</div>
                    <div><h4 className="text-xs font-bold text-slate-900">Chronicle Journal Channel</h4><span className="text-[10px] text-slate-400">12,402 subscribers</span></div>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
                <div className="p-4 space-y-4 max-w-[85%]">
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm space-y-2.5 border border-slate-100 relative">
                    <div className="rounded-xl overflow-hidden cursor-pointer"><img src={selectedPost.featuredImage} alt="Telegram Post" className="w-full h-40 object-cover" /></div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      🏛 <b>{selectedPost.title}</b><br/><br/>{selectedPost.excerpt}<br/><br/>
                      <a href="#" className="text-sky-600 font-bold hover:underline">Read complete essay on Chronicle →</a>
                    </p>
                    <div className="flex items-center justify-end gap-1.5 text-[9px] text-slate-400 font-medium"><span>14:02</span> <CheckCircle className="h-3 w-3" /></div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 ml-2">
                    <button onClick={handleLike} className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${hasLiked ? 'text-rose-500' : ''}`}><Heart className={`h-4 w-4 ${hasLiked ? 'fill-rose-500' : ''}`} /> <span>{likes}</span></button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 hover:text-sky-600 transition-colors"><MessageCircle className="h-4 w-4" /> <span>{comments.length}</span></button>
                    <button onClick={handleRepost} className={`flex items-center gap-1 hover:text-sky-600 transition-colors ${hasReposted ? 'text-sky-600' : ''}`}><Share2 className="h-4 w-4" /> <span>Share</span></button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SUBSTACK */}
            {id === 'substack' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="bg-orange-500/5 p-6 text-center border-b border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 mx-auto mb-3 flex items-center justify-center text-orange-600 font-serif text-2xl font-bold">C</div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">Chronicle Press Substack</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Newsletter Dispatch</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2"><h2 className="text-xl font-bold text-slate-900 font-serif leading-tight">{selectedPost.title}</h2><p className="text-xs text-slate-500">BY JULIAN THORNE • {new Date().toLocaleDateString()}</p></div>
                  <img src={selectedPost.featuredImage} alt="Substack Cover" className="w-full h-56 rounded-xl object-cover" />
                  <p className="text-sm text-slate-800 leading-relaxed font-serif">{selectedPost.excerpt}...</p>
                  <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">Read on Substack</button>
                </div>
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-5">
                    <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-orange-600 font-bold ${hasLiked ? 'text-orange-600' : ''}`}><Heart className={`h-5 w-5 ${hasLiked ? 'fill-orange-600' : ''}`} /> <span>{likes}</span></button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-orange-600 font-bold"><MessageCircle className="h-5 w-5" /> <span>{comments.length}</span></button>
                  </div>
                  <button onClick={handleRepost} className={`hover:text-orange-600 font-bold ${hasReposted ? 'text-orange-600' : ''}`}><Share2 className="h-5 w-5" /></button>
                </div>
              </div>
            )}

            {/* 6. YOUTUBE */}
            {id === 'youtube' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="aspect-video bg-black relative flex items-center justify-center">
                  <img src={selectedPost.featuredImage} alt="Video Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]" />
                  <div className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"><Flame className="h-8 w-8 text-white fill-white" /></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 w-1/3" />
                </div>
                <div className="p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{selectedPost.title} — Architectural Narrative</h4>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-100 overflow-hidden"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Channel Avatar" className="h-full w-full object-cover" /></div>
                      <div><div className="text-xs font-bold text-slate-900 flex items-center gap-1">Chronicle Official <CheckCircle2 className="h-3 w-3 text-slate-500" /></div><div className="text-[10px] text-slate-400">142K subscribers</div></div>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-[11px] font-bold hover:bg-slate-800 transition-colors">Subscribe</button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <div className="flex items-center bg-slate-100 rounded-full overflow-hidden shrink-0"><button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200 hover:bg-slate-200 transition-colors ${hasLiked ? 'text-indigo-900' : ''}`}><ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-indigo-950' : ''}`} /> <span className="text-[10px] font-bold">{likes}</span></button><button className="px-3 py-1.5 hover:bg-slate-200 transition-colors"><Repeat className="h-4 w-4 rotate-180 text-slate-400" /></button></div>
                    <button onClick={handleRepost} className={`flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full font-bold text-[10px] hover:bg-slate-200 shrink-0 ${hasReposted ? 'text-indigo-900 bg-indigo-50 border border-indigo-100' : ''}`}><Share2 className="h-4 w-4" /> <span>Share</span></button>
                    <button className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full font-bold text-[10px] hover:bg-slate-200 shrink-0"><Cpu className="h-4 w-4" /> <span>Remix</span></button>
                  </div>
                  <div className="bg-slate-100/80 rounded-xl p-3 text-[11px] text-slate-800 font-medium leading-relaxed">
                    <b>{selectedPost.views.toLocaleString()} views • 2 hours ago</b><br/>{selectedPost.excerpt} <span className="text-slate-500">...more</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. WORDPRESS / GHOST (CMS Style) */}
            {(id === 'wordpress' || id === 'ghost') && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Layout className="h-5 w-5 text-indigo-900" /> <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{id === 'wordpress' ? 'WordPress Content Hub' : 'Ghost Publishing'}</span></div>
                  <div className="flex items-center gap-2"><div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase">Published</div><ExternalLink className="h-4 w-4 text-slate-400 cursor-pointer" /></div>
                </div>
                <div className="p-8 space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-3"><h1 className="text-2xl font-bold text-slate-900 font-serif leading-tight">{selectedPost.title}</h1><div className="flex items-center gap-3 text-xs text-slate-500 font-medium pb-2 border-b border-slate-100"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="CMS Author" className="h-6 w-6 rounded-full" /> <span>By Julian Thorne</span> <span>•</span> <span>6 min read</span></div></div>
                  <img src={selectedPost.featuredImage} alt="CMS Post Header" className="w-full h-64 rounded-2xl object-cover shadow-sm" />
                  <div className="prose prose-slate max-w-none"><p className="text-base text-slate-700 leading-relaxed font-serif first-letter:text-4xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-1 first-letter:float-left">{selectedPost.content.substring(0, 350)}...</p></div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-indigo-900 ${hasLiked ? 'text-indigo-900' : ''}`}><Heart className="h-4 w-4" /> <span>{likes}</span></button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-indigo-900"><MessageSquare className="h-4 w-4" /> <span>{comments.length} Comments</span></button>
                  </div>
                  <button onClick={handleRepost} className={`text-slate-500 hover:text-indigo-900 ${hasReposted ? 'text-indigo-900' : ''}`}><Share2 className="h-5 w-5" /></button>
                </div>
              </div>
            )}

            {/* 8. BLOGGER / DEFAULT FALLBACK */}
            {(id === 'blogger' || (id !== 'instagram' && id !== 'facebook' && id !== 'linkedin' && id !== 'telegram' && id !== 'substack' && id !== 'youtube' && id !== 'wordpress' && id !== 'ghost' && id !== 'x-twitter')) && (
               <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
                 <div className="bg-amber-600 p-3 flex items-center gap-2"><div className="w-8 h-8 bg-white rounded-md flex items-center justify-center font-bold text-amber-600 text-xl">B</div><h4 className="text-white text-xs font-bold uppercase tracking-widest tracking-widest">Blogger Platform</h4></div>
                 <div className="p-6 space-y-4">
                   <h2 className="text-xl font-bold text-slate-900 leading-tight border-b border-slate-100 pb-3">{selectedPost.title}</h2>
                   <div className="aspect-video rounded-xl overflow-hidden shadow-xs"><img src={selectedPost.featuredImage} alt="Blogger Post Image" className="w-full h-full object-cover" /></div>
                   <p className="text-sm text-slate-700 leading-relaxed">{selectedPost.excerpt}</p>
                   <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-4">
                        <button onClick={handleLike} className={`text-xs font-bold flex items-center gap-1 hover:text-amber-700 ${hasLiked ? 'text-amber-700' : 'text-slate-500'}`}><ThumbsUp className="h-4 w-4" /> <span>Like</span></button>
                        <button onClick={() => setShowComments(!showComments)} className="text-xs font-bold flex items-center gap-1 text-slate-500 hover:text-amber-700"><MessageCircle className="h-4 w-4" /> <span>{comments.length}</span></button>
                     </div>
                     <button onClick={handleRepost} className={`text-slate-500 hover:text-amber-700 ${hasReposted ? 'text-amber-700' : ''}`}><Share2 className="h-4 w-4" /></button>
                   </div>
                 </div>
               </div>
            )}

            {/* 9. X-TWITTER */}
            {id === 'x-twitter' && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-md p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <img src={selectedPost.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="Twitter Profile" className="h-10 w-10 rounded-full object-cover shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-0.5">Chronicle Press <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500" /></h4>
                      <span className="text-[10px] text-slate-400">@chronicle_press • 2h</span>
                    </div>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed"><b>{selectedPost.title}</b> — {selectedPost.excerpt} <span className="text-indigo-600 block hover:underline cursor-pointer">chronicle.press/articles/{selectedPost.slug}</span></p>
                <div className="rounded-2xl border border-slate-100 overflow-hidden"><img src={selectedPost.featuredImage} alt="Twitter Card" className="w-full h-44 object-cover" /></div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500 text-xs">
                  <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-blue-500"><MessageCircle className="h-4.5 w-4.5" /> <span>{comments.length}</span></button>
                  <button onClick={handleRepost} className={`flex items-center gap-1.5 hover:text-emerald-500 ${hasReposted ? 'text-emerald-500' : ''}`}><Repeat className="h-4.5 w-4.5" /> <span>{reposts}</span></button>
                  <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-rose-500 ${hasLiked ? 'text-rose-500' : ''}`}><Heart className={`h-4.5 w-4.5 ${hasLiked ? 'fill-rose-500' : ''}`} /> <span>{likes}</span></button>
                  <Bookmark className="h-4.5 w-4.5 hover:text-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* Threaded Discussion Dialogue (Col-Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* OAuth2 Connection Prompt */}
            {(id === 'facebook' || id === 'instagram' || id === 'youtube' || id === 'blogger' || id === 'x-twitter' || id === 'linkedin') && (
              <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-950 shrink-0"><KeyRound className="h-5 w-5" /></div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-slate-900">
                      {id === 'youtube' || id === 'blogger' ? 'Authorize Google OAuth2' : 
                       id === 'x-twitter' ? 'Authorize X OAuth2' :
                       id === 'linkedin' ? 'Authorize LinkedIn OAuth2' :
                       'Authorize Meta OAuth2'}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Connect your account securely with direct popup authorization scopes.</p>
                  </div>
                </div>
                <div className="pt-1.5">
                  {isChannelConnected ? (
                    <div className="flex items-center justify-between text-xs bg-white border border-slate-200 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> <span>OAuth2 Connected</span></div>
                      <button onClick={handleConnectOAuth2} className="text-[10px] text-indigo-900 font-bold underline hover:text-indigo-950 cursor-pointer">Re-authorize</button>
                    </div>
                  ) : (
                    <button onClick={handleConnectOAuth2} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-3.5 shadow-sm hover:shadow transition-all cursor-pointer">
                      <Unlock className="h-4 w-4" /> 
                      <span>
                        {id === 'youtube' || id === 'blogger' ? 'Connect Google Credentials' : 
                         id === 'x-twitter' ? 'Connect X Credentials' :
                         id === 'linkedin' ? 'Connect LinkedIn Credentials' :
                         'Connect Meta Credentials'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 space-y-6">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2"><span>Threaded Dialogue</span><span className="rounded-full bg-indigo-100 text-indigo-900 font-mono text-[10px] px-2 py-0.5 font-bold">{comments.length}</span></h3>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">Secure nested replies, editing controls, deletion, and liking. Fully persists inside server-side storage.</p>
              </div>

              {showComments && (
                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="text-center py-6 text-xs text-slate-400"><RefreshCw className="h-4 w-4 animate-spin mx-auto text-indigo-900 mb-2" /> <span>Fetching live comments...</span></div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white p-4"><span>No active threads yet. Post a new remark below!</span></div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {comments.map((comment) => {
                        const commentLikeState = localLikedComments[comment.id] || { count: comment.likes || 0, liked: false };
                        const isReplying = replyingCommentId === comment.id;
                        const isEditing = editingCommentId === comment.id;
                        return (
                          <div key={comment.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex gap-3 text-xs items-start bg-white border border-slate-150 p-3 rounded-2xl shadow-3xs">
                              <div className="h-7 w-7 rounded-full bg-[#1e1b4b] text-[10px] font-bold text-white flex items-center justify-center shrink-0 mt-0.5">{comment.authorName.substring(0, 2).toUpperCase()}</div>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5"><span className="font-bold text-slate-900">{comment.authorName}</span><span className="text-[9px] text-slate-400">{comment.relativeTime || 'Recent'}</span></div>
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <button onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.content); }} className="text-slate-400 hover:text-indigo-900 cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </div>
                                {isEditing ? (
                                  <div className="space-y-2"><textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none" rows={2} /><div className="flex gap-1.5 justify-end"><button onClick={() => setEditingCommentId(null)} className="px-2 py-1 text-[9px] font-bold rounded-lg border border-slate-200 cursor-pointer">Cancel</button><button onClick={() => handleEditComment(comment.id)} className="px-2 py-1 text-[9px] font-bold rounded-lg bg-indigo-950 text-white cursor-pointer">Save</button></div></div>
                                ) : (
                                  <p className="text-slate-700 font-normal leading-relaxed">{comment.content}</p>
                                )}
                                <div className="flex items-center gap-3.5 pt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  <button onClick={() => handleLikeComment(comment.id)} className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${commentLikeState.liked ? 'text-indigo-900' : 'hover:text-slate-800'}`}><ThumbsUp className="h-3 w-3" /> <span>{commentLikeState.count} Likes</span></button>
                                  <button onClick={() => { setReplyingCommentId(isReplying ? null : comment.id); setReplyText(''); }} className="hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"><MessageSquare className="h-3 w-3" /> <span>Reply</span></button>
                                </div>
                              </div>
                            </div>
                            {comment.reply && (
                              <div className="pl-6 flex gap-3 text-xs items-start">
                                <div className="h-5 w-5 rounded-full bg-indigo-950 text-[8px] font-bold text-white flex items-center justify-center shrink-0 mt-0.5">ME</div>
                                <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-2xl flex-1 space-y-1">
                                  <div className="flex items-center gap-1.5"><span className="font-bold text-slate-900">Managing Editor</span><span className="text-[8px] text-indigo-700 font-bold uppercase tracking-wider bg-indigo-100 px-1 rounded">Reply</span></div>
                                  <p className="text-slate-700 font-normal leading-relaxed text-[11px]">{comment.reply}</p>
                                </div>
                              </div>
                            )}
                            {isReplying && (
                              <div className="pl-6 space-y-1.5"><input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write editorial reply..." className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:outline-none" /><div className="flex justify-end gap-1.5"><button onClick={() => setReplyingCommentId(null)} className="px-2 py-1 text-[9px] font-bold rounded-lg border border-slate-200 cursor-pointer">Cancel</button><button onClick={() => handleReplyToComment(comment.id)} className="px-2 py-1 text-[9px] font-bold rounded-lg bg-indigo-950 text-white cursor-pointer">Post Reply</button></div></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <form onSubmit={handleAddComment} className="space-y-2 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5"><span className="text-[10px] text-slate-400 uppercase font-semibold">Post as:</span><input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded focus:outline-none" /></div>
                    <div className="flex gap-2"><input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Write comment remarks..." className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 transition-all font-normal" /><button type="submit" disabled={!newCommentText.trim()} className="rounded-xl bg-[#1e1b4b] hover:bg-indigo-950 disabled:opacity-40 text-white p-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer"><Send className="h-4 w-4" /></button></div>
                  </form>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3.5 text-xs text-slate-500 font-normal shadow-2xs">
              <span className="font-bold text-slate-950 block flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-amber-600" /> <span>API Integrity Summary</span></span>
              <p className="leading-relaxed">All operations for **{channelMeta.name}** route through validated environment credentials. Chronicle uses resumable upload patterns and REST synchronization for maximum reliability.</p>
              {isChannelConnected && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-mono leading-relaxed space-y-1 text-slate-700">
                  <div>Status: <span className="text-emerald-800 font-bold uppercase">Authorized</span></div>
                  <div>Last Sync: <span className="font-bold">{new Date().toLocaleTimeString()}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 font-serif">No articles published yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Please publish or write drafts in the Article manager first to populate social feed simulations.</p>
        </div>
      )}
    </main>
  );
}
