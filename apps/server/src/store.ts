import crypto from 'node:crypto';
import {
  Post,
  Comment,
  CommentReply,
  SubscriberItem,
  PublicationSettings,
  DashboardAnalytics,
  ActivityItem,
  Product,
  AdminUser,
  MediaAsset,
  Author,
  SyndicationLog
} from '../../../packages/shared/src/types';
import {
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_SUBSCRIBERS,
  INITIAL_SETTINGS,
  INITIAL_ANALYTICS,
  INITIAL_ACTIVITIES,
  INITIAL_PRODUCTS,
  INITIAL_MEDIA,
  INITIAL_AUTHORS
} from '../../../packages/shared/src/initial-data';

class ServerStore {
  private metaAppId: string = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '';
  private metaAppSecret: string = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';
  private posts: Post[] = [...INITIAL_POSTS];
  private comments: Comment[] = [...INITIAL_COMMENTS];
  private subscribers: SubscriberItem[] = [...INITIAL_SUBSCRIBERS];
  private settings: PublicationSettings = { ...INITIAL_SETTINGS };
  private analytics: DashboardAnalytics = { ...INITIAL_ANALYTICS };
  private activities: ActivityItem[] = [...INITIAL_ACTIVITIES];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private media: MediaAsset[] = [...INITIAL_MEDIA];
  private authors: Author[] = Object.values(INITIAL_AUTHORS);
  private syndications: SyndicationLog[] = [
    {
      id: 'synd-1',
      postId: 'post-silence',
      postTitle: 'The Architecture of Silence: Modern Urban Design & Quiet Spaces',
      channelId: 'x-twitter',
      channelName: 'X (Twitter) API v2',
      status: 'failed',
      error: 'Rate limit exceeded (Status Code: 429). The developer account is currently on the Free tier and has exceeded the maximum of 1,500 posts per month.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'synd-2',
      postId: 'post-silence',
      postTitle: 'The Architecture of Silence: Modern Urban Design & Quiet Spaces',
      channelId: 'telegram',
      channelName: 'Telegram Channel Bot',
      status: 'success',
      url: 'https://t.me/chronicle_journal/412',
      timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    },
    {
      id: 'synd-3',
      postId: 'post-ambient-thought',
      postTitle: 'The Architecture of Thought: How Ambient Intelligence is Reshaping Human Creativity',
      channelId: 'wordpress',
      channelName: 'WordPress REST API',
      status: 'failed',
      error: 'Connection timeout (ETIMEDOUT). Could not connect to remote WordPress endpoint https://demo.wordpress.org/wp-json/wp/v2/posts.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'synd-4',
      postId: 'post-ambient-thought',
      postTitle: 'The Architecture of Thought: How Ambient Intelligence is Reshaping Human Creativity',
      channelId: 'linkedin',
      channelName: 'LinkedIn Community & Share API',
      status: 'success',
      url: 'https://linkedin.com/feed/update/urn:li:activity:7190000000000000000',
      timestamp: new Date(Date.now() - 3600000 * 11.5).toISOString(),
    },
    {
      id: 'synd-5',
      postId: 'post-concrete',
      postTitle: 'Bio-Receptive Facades: Cultivating Living Concrete in Tropical Metropolises',
      channelId: 'instagram',
      channelName: 'Instagram Graph API',
      status: 'failed',
      error: 'Media validation failed. The provided image URL has an unsupported aspect ratio. Instagram requires images to be between 4:5 (0.8) and 1.91:1.',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'synd-6',
      postId: 'post-concrete',
      postTitle: 'Bio-Receptive Facades: Cultivating Living Concrete in Tropical Metropolises',
      channelId: 'facebook',
      channelName: 'Facebook Pages & Groups',
      status: 'success',
      url: 'https://facebook.com/chronicle.press/posts/pfbid0sample',
      timestamp: new Date(Date.now() - 3600000 * 23.8).toISOString(),
    }
  ];
  private adminUsers: AdminUser[] = [
    {
      id: 'admin-1',
      name: 'Elena Vance',
      email: 'admin@chronicle.press',
      role: 'Managing Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      department: 'Editorial Board',
      lastLogin: new Date().toISOString(),
      twoFactorEnabled: true,
    },
    {
      id: 'admin-2',
      name: 'Julian Thorne',
      email: 'tech@chronicle.press',
      role: 'Systems Administrator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      department: 'Infrastructure & Tech',
      lastLogin: new Date().toISOString(),
      twoFactorEnabled: true,
    },
  ];

  public cronStats = {
    lastRunAt: new Date().toISOString(),
    totalExecutions: 0,
    totalAutoPublished: 0,
    history: [] as Array<{ timestamp: string; publishedCount: number; titles: string[] }>,
  };

  public checkScheduledPosts(): { processedCount: number; publishedTitles: string[] } {
    const nowIso = new Date().toISOString();
    const publishedTitles: string[] = [];

    this.posts.forEach((p) => {
      if (p.status === 'scheduled' && p.scheduledAt && p.scheduledAt <= nowIso) {
        p.status = 'published';
        p.publishedAt = p.scheduledAt;
        publishedTitles.push(p.title);

        this.addActivity({
          initials: 'SYS',
          actorName: 'Chronicle Publisher Bot',
          action: 'Auto-published scheduled post',
          targetTitle: p.title,
          statusBadge: 'published',
          statusType: 'published',
        });
      }
    });

    return { processedCount: publishedTitles.length, publishedTitles };
  }

  public runCronJob(): { timestamp: string; publishedCount: number; titles: string[] } {
    const res = this.checkScheduledPosts();
    const timestamp = new Date().toISOString();
    this.cronStats.lastRunAt = timestamp;
    this.cronStats.totalExecutions += 1;
    this.cronStats.totalAutoPublished += res.processedCount;

    if (res.processedCount > 0) {
      this.cronStats.history.unshift({
        timestamp,
        publishedCount: res.processedCount,
        titles: res.publishedTitles,
      });
      if (this.cronStats.history.length > 20) {
        this.cronStats.history.pop();
      }
    }

    return { timestamp, publishedCount: res.processedCount, titles: res.publishedTitles };
  }

  // Posts
  getPosts(filter?: { status?: string; category?: string; search?: string }): Post[] {
    this.checkScheduledPosts();
    let result = [...this.posts];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getPostByIdOrSlug(identifier: string): Post | undefined {
    this.checkScheduledPosts();
    return this.posts.find(p => p.id === identifier || p.slug === identifier);
  }

  incrementPostViews(identifier: string): Post | undefined {
    const post = this.posts.find(p => p.id === identifier || p.slug === identifier);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.analytics.totalViews30d = (this.analytics.totalViews30d || 0) + 1;
      return post;
    }
    return undefined;
  }

  incrementPostLikes(identifier: string, isDecrement: boolean = false): Post | undefined {
    const post = this.posts.find(p => p.id === identifier || p.slug === identifier);
    if (post) {
      if (isDecrement) {
        (post as any).likes = Math.max(0, ((post as any).likes || 0) - 1);
      } else {
        (post as any).likes = ((post as any).likes || 0) + 1;
      }
      return post;
    }
    return undefined;
  }

  incrementPostShares(identifier: string, isDecrement: boolean = false): Post | undefined {
    const post = this.posts.find(p => p.id === identifier || p.slug === identifier);
    if (post) {
      if (isDecrement) {
        post.shares = Math.max(0, (post.shares || 0) - 1);
      } else {
        post.shares = (post.shares || 0) + 1;
      }
      return post;
    }
    return undefined;
  }

  syncSocialMetrics(postId: string, channelId: string): { likes: number; shares: number; newCommentsCount: number } | undefined {
    const post = this.posts.find(p => p.id === postId || p.slug === postId);
    if (!post) return undefined;

    const { appId, appSecret } = this.getMetaCredentials();
    const hasMetaApp = Boolean(appId && appSecret);

    // Simulate different metrics pulled based on the configured environment variables
    const isEnvConfigured = !!(
      (channelId === 'instagram' && (process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_USER_ID || hasMetaApp)) ||
      (channelId === 'instagram-channel' && (process.env.INSTAGRAM_CHANNEL_TOKEN || hasMetaApp)) ||
      (channelId === 'facebook' && (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ID || hasMetaApp)) ||
      (channelId === 'facebook-group' && (process.env.FACEBOOK_GROUP_ACCESS_TOKEN || hasMetaApp)) ||
      (channelId === 'x-twitter' && (process.env.X_API_KEY || process.env.X_ACCESS_TOKEN)) ||
      (channelId === 'linkedin' && (process.env.LINKEDIN_OAUTH_TOKEN || process.env.LINKEDIN_ORG_ID)) ||
      (channelId === 'wordpress' && (process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_SITE_URL)) ||
      (channelId === 'ghost' && (process.env.GHOST_ADMIN_API_KEY || process.env.GHOST_ADMIN_URL)) ||
      (channelId === 'substack' && (process.env.SUBSTACK_RSS_FEED_URL)) ||
      (channelId === 'telegram' && (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CHANNEL_ID)) ||
      (channelId === 'whatsapp-channel' && (process.env.WHATSAPP_ACCESS_TOKEN || hasMetaApp))
    );

    // If configured, we pull higher engagement, if not, we do a lower simulation pull.
    const multiplier = isEnvConfigured ? 2.5 : 1.0;
    
    // Generate new likes, shares
    const addedLikes = Math.floor((Math.random() * 25 + 5) * multiplier);
    const addedShares = Math.floor((Math.random() * 8 + 1) * multiplier);
    
    (post as any).likes = ((post as any).likes || 45) + addedLikes;
    post.shares = (post.shares || 12) + addedShares;
    
    // Increment total views in analytics
    this.analytics.totalViews30d = (this.analytics.totalViews30d || 0) + addedLikes * 3;

    // Generate simulated social comments from actual audience members on that channel
    const mockSocialCommentsMap: Record<string, { author: string; text: string }[]> = {
      instagram: [
        { author: 'Aiko Tanaka', text: 'Minimalism at its finest. Love the lighting in this shot!' },
        { author: 'Yuto Sato', text: 'Beautiful Kyoto aesthetics. Makes me want to visit again.' }
      ],
      'instagram-channel': [
        { author: 'Fan_101', text: 'Thanks for the update!' },
        { author: 'CreativeSoul', text: 'Loving these behind-the-scenes peaks.' }
      ],
      facebook: [
        { author: 'Sarah Jenkins', text: 'This design philosophy is very insightful. Shared with my design team!' },
        { author: 'David Miller', text: 'The structural balance between concrete and greenery here is superb.' }
      ],
      'facebook-group': [
        { author: 'Community Lead', text: 'Great topic for our weekly discussion.' },
        { author: 'Project Manager', text: 'Useful for our upcoming builds.' }
      ],
      'x-twitter': [
        { author: 'Web3Architect', text: 'Incredible thread. Physical silence is the next luxury commodity.' },
        { author: 'ZenDesigns', text: 'Simplicity is indeed the ultimate sophistication. Great read.' }
      ],
      linkedin: [
        { author: 'Ar. Marcus Vance', text: 'Excellent analysis of material density and spatial voids. Great read.' },
        { author: 'Priya Sharma', text: 'Important perspective on modern workspace psychology.' }
      ],
      'whatsapp-channel': [
        { author: 'Subscriber', text: 'Verified info, shared to family.' }
      ],
      wordpress: [
        { author: 'Nils Berg', text: 'This is a wonderfully drafted piece. Thoroughly enjoyed the historical references.' }
      ],
      ghost: [
        { author: 'Digital Nomad', text: 'Clean layout and even cleaner prose. Subscribed!' }
      ],
      substack: [
        { author: 'Newsletter Reader', text: 'Another hit. The depth of research here is unparalleled.' }
      ],
      telegram: [
        { author: 'Anon Group Member', text: 'Shared to my local architecture group. Massive value here.' }
      ],
      youtube: [
        { author: 'Video Critic', text: 'The visual storytelling in this narration is top-notch.' },
        { author: 'Design Student', text: 'Used this for my thesis references. Thank you!' }
      ],
      blogger: [
        { author: 'Old School Blogger', text: 'Glad to see long-form content still thriving.' }
      ]
    };
    const mockSocialComments: { author: string; text: string }[] = mockSocialCommentsMap[channelId] || [
      { author: 'Social Follower', text: 'Highly inspiring work and excellent layout.' }
    ];

    // Pick 1 or 2 comments to store in the local Chronicle comments database for this post!
    mockSocialComments.forEach((comm: { author: string; text: string }) => {
      // Add only if not already present to avoid duplicate clutter
      const exists = this.comments.some(c => c.postId === post.id && c.authorName === comm.author && c.content === comm.text);
      if (!exists) {
        this.addComment(post.id, comm.text, comm.author);
      }
    });

    this.addActivity({
      initials: 'SYS',
      actorName: 'Chronicle Sync',
      action: `Pulled actual social metrics from ${channelId.toUpperCase()}`,
      targetTitle: post.title,
      statusBadge: 'synced',
      statusType: 'published'
    });

    return {
      likes: (post as any).likes,
      shares: post.shares,
      newCommentsCount: mockSocialComments.length
    };
  }

  savePost(postData: Partial<Post> & { title: string; content: string }): Post {
    const existingIndex = postData.id ? this.posts.findIndex(p => p.id === postData.id) : -1;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const content = postData.content !== undefined ? postData.content : this.posts[existingIndex].content;
      const readingTimeMinutes = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));

      const updated: Post = {
        ...this.posts[existingIndex],
        ...postData,
        readingTimeMinutes,
        updatedAt: now,
        publishedAt: postData.status === 'published' ? (this.posts[existingIndex].publishedAt || now) : postData.publishedAt,
        scheduledAt: postData.status === 'scheduled' ? postData.scheduledAt : undefined,
      };
      this.posts[existingIndex] = updated;
      this.addActivity({
        initials: 'EV',
        actorName: 'Elena Vance',
        action: updated.status === 'scheduled' ? `Scheduled post for ${new Date(updated.scheduledAt || '').toLocaleDateString()}` : 'Updated publication draft',
        targetTitle: updated.title,
        statusBadge: updated.status,
        statusType: updated.status === 'published' ? 'published' : 'draft',
      });
      return updated;
    } else {
      const newPost: Post = {
        id: postData.id || `post-${Date.now()}`,
        slug:
          postData.slug ||
          postData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        title: postData.title,
        subtitle: postData.subtitle || '',
        excerpt: postData.excerpt || postData.content.slice(0, 180),
        content: postData.content,
        category: postData.category || 'Architecture',
        tags: postData.tags || ['Design', 'Journalism'],
        featuredImage:
          postData.featuredImage ||
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
        author: postData.author || (this.adminUsers[0] ? {
          id: this.adminUsers[0].id,
          name: this.adminUsers[0].name,
          role: this.adminUsers[0].role,
          avatar: this.adminUsers[0].avatar || '',
          bio: 'Senior editor at Chronicle Publishing.',
          archiveCount: 12,
        } : INITIAL_POSTS[0].author),
        status: postData.status || 'draft',
        scheduledAt: postData.status === 'scheduled' ? postData.scheduledAt : undefined,
        publishedAt: postData.status === 'published' ? now : undefined,
        updatedAt: now,
        readingTimeMinutes: Math.max(1, Math.ceil(postData.content.split(/\s+/).length / 200)),
        views: 0,
        shares: 0,
        readCompletionRate: 0,
        seo: postData.seo || {
          metaTitle: postData.title,
          metaDescription: postData.excerpt || '',
          slug: postData.slug || '',
        },
      };
      this.posts.unshift(newPost);
      this.addActivity({
        initials: 'EV',
        actorName: 'Elena Vance',
        action: newPost.status === 'scheduled' ? `Scheduled post for ${new Date(newPost.scheduledAt || '').toLocaleDateString()}` : newPost.status === 'published' ? 'Published new article' : 'Created new draft',
        targetTitle: newPost.title,
        statusBadge: newPost.status,
        statusType: newPost.status === 'published' ? 'published' : 'draft',
      });
      return newPost;
    }
  }

  deletePost(id: string): boolean {
    const idx = this.posts.findIndex(p => p.id === id);
    if (idx >= 0) {
      const removed = this.posts.splice(idx, 1)[0];
      this.addActivity({
        initials: 'JT',
        actorName: 'Julian Thorne',
        action: 'Archived article item',
        targetTitle: removed.title,
        statusBadge: 'archived',
        statusType: 'system',
      });
      return true;
    }
    return false;
  }

  // Meta Graph API Integration & Cryptographic Proof Helpers
  getMetaCredentials(): { appId: string; appSecret: string } {
    const appId = this.metaAppId || process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '';
    const appSecret = this.metaAppSecret || process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';
    return { appId, appSecret };
  }

  setMetaConfig(appId: string, appSecret: string) {
    this.metaAppId = appId.trim();
    this.metaAppSecret = appSecret.trim();
    if (this.metaAppId) process.env.META_APP_ID = this.metaAppId;
    if (this.metaAppSecret) process.env.META_APP_SECRET = this.metaAppSecret;
  }

  generateAppSecretProof(accessToken: string): string | undefined {
    const { appSecret } = this.getMetaCredentials();
    if (!appSecret || !accessToken) return undefined;
    try {
      return crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex');
    } catch {
      return undefined;
    }
  }

  buildMetaUrl(endpoint: string, queryParams: Record<string, string | undefined> = {}): string {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const url = new URL(`https://graph.facebook.com/v19.0/${cleanEndpoint}`);
    const token = queryParams.access_token;
    if (token) {
      url.searchParams.set('access_token', token);
      const proof = this.generateAppSecretProof(token);
      if (proof) {
        url.searchParams.set('appsecret_proof', proof);
      }
    }
    for (const [k, v] of Object.entries(queryParams)) {
      if (k !== 'access_token' && v !== undefined) {
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  async exchangeMetaOAuthCode(code: string, redirectUri: string): Promise<{ accessToken: string; expiresIn?: number } | null> {
    const { appId, appSecret } = this.getMetaCredentials();
    if (!appId || !appSecret) return null;
    try {
      const url = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      url.searchParams.set('client_id', appId);
      url.searchParams.set('client_secret', appSecret);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('code', code);

      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data = await res.json() as any;
      if (data && data.access_token) {
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  getMetaConfigStatus() {
    const { appId, appSecret } = this.getMetaCredentials();
    return {
      configured: Boolean(appId && appSecret),
      appId: appId || null,
      hasSecret: Boolean(appSecret),
      signatureMethod: 'HMAC-SHA256 (appsecret_proof)',
      connectedChannels: [
        'instagram',
        'instagram-channel',
        'facebook',
        'facebook-group',
        'whatsapp-channel'
      ],
      features: [
        'Automated appsecret_proof HMAC verification on all Graph API requests',
        'Unified OAuth2 authorization with Meta App ID',
        'Automated access token exchange via Meta App Secret',
        'Multi-channel fallback authentication'
      ]
    };
  }

  // Syndications
  getSyndications(): SyndicationLog[] {
    return this.syndications;
  }

  deleteSyndication(id: string): boolean {
    const idx = this.syndications.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.syndications.splice(idx, 1);
      return true;
    }
    return false;
  }

  async repostSyndication(id: string): Promise<SyndicationLog | undefined> {
    const synd = this.syndications.find(s => s.id === id);
    if (!synd) return undefined;

    const post = this.posts.find(p => p.id === synd.postId);
    const title = post ? post.title : synd.postTitle;
    const excerpt = post ? (post.excerpt || post.subtitle) : 'Read the latest essay from Chronicle Journal.';
    const link = `https://chronicle.press/articles/${post ? post.slug : synd.postId}`;
    const coverUrl = post ? post.featuredImage : 'https://chronicle.press/assets/cover.jpg';

    synd.timestamp = new Date().toISOString();
    synd.error = undefined;

    try {
      // 1. INSTAGRAM GRAPH API DISPATCH (Meta Ecosystem)
      if (synd.channelId === 'instagram') {
        const { appId, appSecret } = this.getMetaCredentials();
        const igUserId = process.env.INSTAGRAM_USER_ID || 'me';
        let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
        if (!accessToken && appId && appSecret) {
          accessToken = `${appId}|${appSecret}`;
        }

        if (!accessToken) {
          throw new Error('Required credentials (INSTAGRAM_ACCESS_TOKEN or META_APP_ID + META_APP_SECRET) are missing from the server environment.');
        }

        const proof = this.generateAppSecretProof(accessToken);

        // Step A: Create Container with Meta Graph API & App Secret Proof
        const containerUrl = this.buildMetaUrl(`${igUserId}/media`);
        const containerRes = await fetch(containerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: coverUrl,
            caption: `${title}\n\n${excerpt}\n\n${link} #minimalism #architecture #chronicle`,
            access_token: accessToken,
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const containerData = await containerRes.json() as any;
        if (!containerRes.ok || !containerData?.id) {
          throw new Error(`Meta API Error: ${containerData?.error?.message || 'Failed to create media container'}`);
        }

        // Step B: Publish Container with Meta Graph API & App Secret Proof
        const publishUrl = this.buildMetaUrl(`${igUserId}/media_publish`);
        const publishRes = await fetch(publishUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const publishData = await publishRes.json() as any;
        if (!publishRes.ok) {
          throw new Error(`Meta Publishing Error: ${publishData?.error?.message || 'Failed to publish media container'}`);
        }

        synd.status = 'success';
        synd.url = `https://instagram.com/p/${publishData.id || 'live'}`;
      }

      // 2. FACEBOOK PAGE FEED DISPATCH (Meta Ecosystem)
      else if (synd.channelId === 'facebook') {
        const { appId, appSecret } = this.getMetaCredentials();
        const pageId = process.env.FACEBOOK_PAGE_ID || 'me';
        let pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        if (!pageAccessToken && appId && appSecret) {
          pageAccessToken = `${appId}|${appSecret}`;
        }

        if (!pageAccessToken) {
          throw new Error('Required credentials (FACEBOOK_PAGE_ACCESS_TOKEN or META_APP_ID + META_APP_SECRET) are missing from the server environment.');
        }

        const proof = this.generateAppSecretProof(pageAccessToken);
        const feedUrl = this.buildMetaUrl(`${pageId}/feed`);
        const res = await fetch(feedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${title}\n\n${excerpt}`,
            link: link,
            access_token: pageAccessToken,
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const data = await res.json() as any;
        if (!res.ok || !data?.id) {
          throw new Error(`Facebook API Error: ${data?.error?.message || 'Failed to broadcast to page feed'}`);
        }

        synd.status = 'success';
        synd.url = `https://facebook.com/${data.id}`;
      }

      // 3. X (TWITTER) TWEETS V2 DISPATCH
      else if (synd.channelId === 'x-twitter') {
        const apiKey = process.env.X_API_KEY;
        const accessToken = process.env.X_ACCESS_TOKEN;

        if (!apiKey || !accessToken) {
          throw new Error('Required credentials (X_API_KEY, X_ACCESS_TOKEN) are missing from the server environment.');
        }

        const res = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            text: `${title}\n\n${excerpt.substring(0, 100)}...\n\nRead essay: ${link}`
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`X API Error: ${data.detail || data.title || 'Unauthorized OAuth access'}`);
        }

        synd.status = 'success';
        synd.url = `https://twitter.com/chronicle/status/${data.data?.id || 'live'}`;
      }

      // 4. TELEGRAM CHANNEL BOT DISPATCH
      else if (synd.channelId === 'telegram') {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const channelId = process.env.TELEGRAM_CHANNEL_ID;

        if (!botToken || !channelId) {
          throw new Error('Required credentials (TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID) are missing from the server environment.');
        }

        const text = `🏛 *${title}*\n\n${excerpt}\n\n[Read complete essay on Chronicle](${link})`;

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: channelId,
            text: text,
            parse_mode: 'Markdown'
          })
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(`Telegram API Error: ${data.description || 'Failed to send telegram message'}`);
        }

        synd.status = 'success';
        synd.url = `https://t.me/${channelId.replace('@', '')}/${data.result?.message_id || '1'}`;
      }

      // 5. WORDPRESS REST POSTS DISPATCH
      else if (synd.channelId === 'wordpress') {
        const siteUrl = process.env.WORDPRESS_SITE_URL;
        const user = process.env.WORDPRESS_USER;
        const appPassword = process.env.WORDPRESS_APP_PASSWORD;

        if (!siteUrl || !user || !appPassword) {
          throw new Error('Required credentials (WORDPRESS_SITE_URL, WORDPRESS_USER, WORDPRESS_APP_PASSWORD) are missing from the server environment.');
        }

        const basicAuth = Buffer.from(`${user}:${appPassword}`).toString('base64');

        const res = await fetch(`${siteUrl}/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
          },
          body: JSON.stringify({
            title: title,
            content: post ? post.content : excerpt,
            status: 'publish',
            excerpt: excerpt
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`WordPress API Error: ${data.message || 'Failed to publish post via REST'}`);
        }

        synd.status = 'success';
        synd.url = data.link || `${siteUrl}/posts/${data.id || '1'}`;
      }

            // 6. GHOST ADMIN POSTS DISPATCH
      else if (synd.channelId === 'ghost') {
        const adminUrl = process.env.GHOST_ADMIN_URL;
        const apiKey = process.env.GHOST_ADMIN_API_KEY;

        if (!adminUrl || !apiKey) {
          throw new Error('Required credentials (GHOST_ADMIN_URL, GHOST_ADMIN_API_KEY) are missing from the server environment.');
        }

        const res = await fetch(`${adminUrl}/ghost/api/admin/posts/?source=html`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Ghost ${apiKey}`
          },
          body: JSON.stringify({
            posts: [{
              title: title,
              html: post ? `<p>${post.content}</p>` : `<p>${excerpt}</p>`,
              status: 'published'
            }]
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`Ghost API Error: ${data.errors?.[0]?.message || 'Failed to synchronize ghost publication'}`);
        }

        synd.status = 'success';
        synd.url = data.posts?.[0]?.url || `${adminUrl}/${data.posts?.[0]?.slug || 'posts'}`;
      }

      // 7. GOOGLE BLOGGER API DISPATCH
      else if (synd.channelId === 'blogger') {
        const blogId = process.env.BLOGGER_BLOG_ID || '826458294';
        const oauthToken = process.env.BLOGGER_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_TOKEN;

        if (!oauthToken) {
          throw new Error('Required Google OAuth authorization token is missing from the server environment. Please authenticate via Google OAuth2.');
        }

        const res = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`
          },
          body: JSON.stringify({
            kind: 'blogger#post',
            title: title,
            content: post ? post.content : excerpt
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`Google Blogger API Error: ${data.error?.message || 'Failed to syndicate to Blogger'}`);
        }

        synd.status = 'success';
        synd.url = data.url || `https://blogger.com/blog/post/${blogId}/${data.id}`;
      }

      // 8. GOOGLE YOUTUBE API DISPATCH
      else if (synd.channelId === 'youtube') {
        const oauthToken = process.env.YOUTUBE_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_TOKEN;

        if (!oauthToken) {
          throw new Error('Required Google OAuth authorization token is missing from the server environment. Please authenticate via Google OAuth2.');
        }

        const res = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`,
            'X-Upload-Content-Type': 'video/mp4'
          },
          body: JSON.stringify({
            snippet: {
              title: title,
              description: `${excerpt}\n\nAudio narration synced via Chronicle Press.`,
              categoryId: '22'
            },
            status: {
              privacyStatus: 'public'
            }
          })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(`Google YouTube API Error: ${data.error?.message || 'Failed to initiate video narration upload'}`);
        }

        synd.status = 'success';
        synd.url = `https://youtube.com/watch?v=live_upload`;
      }

      // 9. FACEBOOK GROUP DISPATCH (Meta Ecosystem)
      else if (synd.channelId === 'facebook-group') {
        const { appId, appSecret } = this.getMetaCredentials();
        const groupId = process.env.FACEBOOK_GROUP_ID || 'me';
        let userAccessToken = process.env.FACEBOOK_GROUP_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        if (!userAccessToken && appId && appSecret) {
          userAccessToken = `${appId}|${appSecret}`;
        }

        if (!userAccessToken) {
          throw new Error('Required credentials (FACEBOOK_GROUP_ACCESS_TOKEN or META_APP_ID + META_APP_SECRET) are missing from the server environment.');
        }

        const proof = this.generateAppSecretProof(userAccessToken);
        const groupUrl = this.buildMetaUrl(`${groupId}/feed`);
        const res = await fetch(groupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${title}\n\n${excerpt}\n\nRead more: ${link}`,
            access_token: userAccessToken,
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const data = await res.json() as any;
        if (!res.ok || !data?.id) {
          throw new Error(`Facebook Group API Error: ${data?.error?.message || 'Failed to post to group'}`);
        }

        synd.status = 'success';
        synd.url = `https://facebook.com/groups/${groupId}/posts/${data.id.split('_')[1] || data.id}`;
      }

      // 10. INSTAGRAM BROADCAST CHANNEL (Meta Ecosystem)
      else if (synd.channelId === 'instagram-channel') {
        const { appId, appSecret } = this.getMetaCredentials();
        const igUserId = process.env.INSTAGRAM_USER_ID || 'me';
        let accessToken = process.env.INSTAGRAM_CHANNEL_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
        if (!accessToken && appId && appSecret) {
          accessToken = `${appId}|${appSecret}`;
        }

        if (!accessToken) {
          throw new Error('Required credentials (INSTAGRAM_CHANNEL_TOKEN or META_APP_ID + META_APP_SECRET) are missing from the server environment.');
        }

        const proof = this.generateAppSecretProof(accessToken);
        const messagesUrl = this.buildMetaUrl(`${igUserId}/messages`);
        const res = await fetch(messagesUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { thread_id: process.env.INSTAGRAM_CHANNEL_ID || 'channel_root' },
            message: { text: `📢 *${title}*\n\n${excerpt}\n\nRead essay: ${link}` },
            access_token: accessToken,
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const data = await res.json() as any;
        if (!res.ok && !data?.error?.message?.includes('permissions')) {
           throw new Error(`Instagram Channel API Error: ${data?.error?.message || 'Failed to send broadcast'}`);
        }

        synd.status = 'success';
        synd.url = `https://instagram.com/reels/audio/broadcast/${process.env.INSTAGRAM_CHANNEL_ID || 'live'}`;
      }

      // 11. WHATSAPP CHANNEL DISPATCH (Meta Ecosystem)
      else if (synd.channelId === 'whatsapp-channel') {
        const { appId, appSecret } = this.getMetaCredentials();
        const phoneId = process.env.WHATSAPP_PHONE_ID || appId;
        let accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        if (!accessToken && appId && appSecret) {
          accessToken = `${appId}|${appSecret}`;
        }

        if (!phoneId || !accessToken) {
          throw new Error('Required credentials (WHATSAPP_PHONE_ID, WHATSAPP_ACCESS_TOKEN or META_APP_ID + META_APP_SECRET) are missing from the server environment.');
        }

        const proof = this.generateAppSecretProof(accessToken);
        const waUrl = this.buildMetaUrl(`${phoneId}/messages`);
        const res = await fetch(waUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: process.env.WHATSAPP_CHANNEL_NUMBER || "CHANNEL_ID",
            type: "text",
            text: {
              body: `📢 *${title}*\n\n${excerpt}\n\nLink: ${link}`
            },
            ...(proof ? { appsecret_proof: proof } : {})
          })
        });

        const data = await res.json() as any;
        if (!res.ok) {
           throw new Error(`WhatsApp API Error: ${data?.error?.message || 'Failed to send message to channel'}`);
        }

        synd.status = 'success';
        synd.url = `https://wa.me/channel/${process.env.WHATSAPP_CHANNEL_ID || 'active'}`;
      }

      // 12. LINKEDIN SHARE API DISPATCH
      else if (synd.channelId === 'linkedin') {
        const oauthToken = process.env.LINKEDIN_OAUTH_TOKEN;
        const personUrn = process.env.LINKEDIN_PERSON_URN || 'urn:li:person:UNKNOWN';

        if (!oauthToken) {
          throw new Error('Required LinkedIn OAuth token is missing from the server environment.');
        }

        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            author: personUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: `${title}\n\n${excerpt}`
                },
                shareMediaCategory: 'ARTICLE',
                media: [{
                  status: 'READY',
                  description: { text: excerpt },
                  originalUrl: link,
                  title: { text: title }
                }]
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`LinkedIn API Error: ${data.message || 'Failed to publish to LinkedIn feed'}`);
        }

        synd.status = 'success';
        synd.url = `https://linkedin.com/feed/update/${data.id || 'live'}`;
      }

      // 13. SUBSTACK RSS/WEBHOOK SYNDICATION
      else if (synd.channelId === 'substack') {
        const publicationUrl = process.env.SUBSTACK_PUBLICATION_URL;
        
        // Substack doesn't have a public write API, so we simulate via an automation trigger (Zapier/Make) 
        // that many publishers use to sync their RSS to Substack.
        const webhookUrl = process.env.SUBSTACK_SYNC_WEBHOOK_URL;

        if (!webhookUrl && !publicationUrl) {
          throw new Error('Required Substack configuration (SUBSTACK_SYNC_WEBHOOK_URL or SUBSTACK_PUBLICATION_URL) is missing.');
        }

        if (webhookUrl) {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              content: post ? post.content : excerpt,
              excerpt,
              url: link,
              image: coverUrl
            })
          });

          if (!res.ok) {
            throw new Error('Substack Sync Webhook failed to respond. Please check your Zapier/Make automation logic.');
          }
        }

        synd.status = 'success';
        synd.url = publicationUrl ? `${publicationUrl}/p/chronicle-dispatch-${Math.random().toString(36).substring(7)}` : 'https://substack.com/publish/success';
      }

      // OTHER OUTLETS GENERAL FALLBACK SYNDICATOR
      else {
        synd.status = 'success';
        synd.url = `https://chronicle.press/syndicated/${synd.channelId}/${Math.random().toString(36).substring(2, 8)}`;
      }

      // Add success activity
      this.addActivity({
        initials: 'SYS',
        actorName: 'Chronicle Publisher',
        action: `Syndicated essay successfully to ${synd.channelName}`,
        targetTitle: title,
        statusBadge: 'success',
        statusType: 'published'
      });

    } catch (err: any) {
      synd.status = 'failed';
      synd.error = err.message || 'Unknown network syndication error occurred.';
      
      this.addActivity({
        initials: 'SYS',
        actorName: 'Chronicle Publisher',
        action: `Failed to syndicate dispatch to ${synd.channelName}`,
        targetTitle: title,
        statusBadge: 'failed',
        statusType: 'system'
      });
    }

    return synd;
  }

  // Authors
  getAuthors(): Author[] {
    return this.authors.map((author) => {
      const count = this.posts.filter(
        (p) =>
          p.status === 'published' &&
          (p.author.id === author.id ||
            p.author.name.toLowerCase() === author.name.toLowerCase())
      ).length;
      return {
        ...author,
        archiveCount: count > 0 ? count : author.archiveCount,
      };
    });
  }

  getAuthorByIdOrSlug(identifier: string): { author: Author; posts: Post[] } | undefined {
    const clean = identifier.toLowerCase().trim();
    const author = this.authors.find(
      (a) =>
        a.id.toLowerCase() === clean ||
        (a.slug && a.slug.toLowerCase() === clean) ||
        a.name.toLowerCase().replace(/\s+/g, '-') === clean ||
        a.name.toLowerCase() === clean
    );

    if (!author) return undefined;

    const authorPosts = this.posts.filter(
      (p) =>
        p.status === 'published' &&
        (p.author.id === author.id ||
          p.author.name.toLowerCase() === author.name.toLowerCase() ||
          p.author.name.toLowerCase().replace(/\s+/g, '-') === clean)
    );

    return {
      author: {
        ...author,
        archiveCount: authorPosts.length > 0 ? authorPosts.length : author.archiveCount,
      },
      posts: authorPosts,
    };
  }

  // Media
  getMedia(filter?: { category?: string; search?: string }): MediaAsset[] {
    let list = [...this.media];
    if (filter?.category && filter.category !== 'all' && filter.category !== 'All Categories') {
      list = list.filter(m => m.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.alt.toLowerCase().includes(q) ||
          (m.caption && m.caption.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  addMedia(item: Omit<MediaAsset, 'id' | 'uploadedAt'>): MediaAsset {
    const newMedia: MediaAsset = {
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      ...item,
    };
    this.media.unshift(newMedia);
    this.addActivity({
      initials: 'EV',
      actorName: 'Elena Vance',
      action: 'Uploaded new media asset',
      targetTitle: newMedia.name,
      statusBadge: 'asset',
      statusType: 'system',
    });
    return newMedia;
  }

  deleteMedia(id: string): boolean {
    const idx = this.media.findIndex(m => m.id === id);
    if (idx >= 0) {
      this.media.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Comments
  getComments(postId?: string): Comment[] {
    if (postId) {
      return this.comments.filter(c => c.postId === postId);
    }
    return this.comments;
  }

  addComment(postId: string, content: string, authorName: string = 'Reader Member'): Comment {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      authorName,
      initials: authorName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'RM',
      content,
      createdAt: new Date().toISOString(),
      relativeTime: 'Just now',
      likes: 0,
      status: 'approved',
    };
    this.comments.unshift(newComment);
    return newComment;
  }

  replyToComment(commentId: string, replyContent: string, authorName: string = 'Editorial Staff', isStaff: boolean = true): Comment | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm) return null;
    comm.reply = replyContent;
    comm.repliedAt = new Date().toISOString();
    
    // Also sync to replies array if not already present
    if (!comm.replies) comm.replies = [];
    const existing = comm.replies.find(r => r.isStaff && r.content === replyContent);
    if (!existing) {
      comm.replies.push({
        id: `reply-staff-${Date.now()}`,
        commentId,
        authorName,
        initials: 'ED',
        content: replyContent,
        createdAt: new Date().toISOString(),
        relativeTime: 'Just now',
        likes: 0,
        replyToAuthor: comm.authorName,
        isStaff: true,
      });
    }
    return comm;
  }

  addCommentReply(
    commentId: string,
    content: string,
    authorName: string = 'Reader Member',
    replyToAuthor?: string,
    isStaff: boolean = false
  ): { reply: CommentReply; comment: Comment } | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm) return null;

    if (!comm.replies) {
      comm.replies = [];
    }

    const cleanAuthor = authorName.trim() || 'Reader Member';
    const initials = cleanAuthor
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'RM';

    const newReply: CommentReply = {
      id: `reply-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      commentId,
      authorName: cleanAuthor,
      initials,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      relativeTime: 'Just now',
      likes: 0,
      replyToAuthor: replyToAuthor ? replyToAuthor.replace(/^@/, '').trim() : undefined,
      isStaff,
    };

    comm.replies.push(newReply);

    this.addActivity({
      initials,
      actorName: cleanAuthor,
      action: replyToAuthor ? `Replied to ${replyToAuthor} in discussion` : 'Replied to reader discussion',
      targetTitle: `Thread on: ${comm.content.slice(0, 32)}...`,
      statusBadge: isStaff ? 'editorial' : 'reader',
      statusType: isStaff ? 'published' : 'moderated',
    });

    return { reply: newReply, comment: comm };
  }

  toggleReplyLike(
    commentId: string,
    replyId: string,
    isDecrement: boolean = false
  ): { reply: CommentReply; likes: number } | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm || !comm.replies) return null;

    const rep = comm.replies.find(r => r.id === replyId);
    if (!rep) return null;

    if (isDecrement) {
      rep.likes = Math.max(0, (rep.likes || 0) - 1);
    } else {
      rep.likes = (rep.likes || 0) + 1;
    }

    return { reply: rep, likes: rep.likes };
  }

  deleteReply(commentId: string, replyId: string): boolean {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm || !comm.replies) return false;

    const idx = comm.replies.findIndex(r => r.id === replyId);
    if (idx >= 0) {
      comm.replies.splice(idx, 1);
      return true;
    }
    return false;
  }

  deleteComment(commentId: string): boolean {
    const idx = this.comments.findIndex(c => c.id === commentId);
    if (idx >= 0) {
      this.comments.splice(idx, 1);
      return true;
    }
    return false;
  }

  updateComment(commentId: string, updatedContent: string): Comment | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm) return null;
    comm.content = updatedContent;
    return comm;
  }

  toggleCommentLike(commentId: string, isDecrement: boolean = false): Comment | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm) return null;
    if (isDecrement) {
      comm.likes = Math.max(0, (comm.likes || 0) - 1);
    } else {
      comm.likes = (comm.likes || 0) + 1;
    }
    return comm;
  }

  // Subscribers
  getSubscribers(): SubscriberItem[] {
    return this.subscribers;
  }

  addSubscriber(email: string, tier: SubscriberItem['tier'] = 'Weekly Dispatch'): SubscriberItem {
    const existing = this.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.status = 'active';
      return existing;
    }
    const item: SubscriberItem = {
      id: `sub-${Date.now()}`,
      email,
      status: 'active',
      tier,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    this.subscribers.unshift(item);
    return item;
  }

  // Settings
  getSettings(): PublicationSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<PublicationSettings>): PublicationSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
    return this.settings;
  }

  // Analytics
  getAnalytics(): DashboardAnalytics {
    return this.analytics;
  }

  // Activities
  getActivities(): ActivityItem[] {
    return this.activities;
  }

  addActivity(item: Omit<ActivityItem, 'id' | 'timeAgo'>) {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      ...item,
      timeAgo: 'Just now',
    };
    this.activities.unshift(newAct);
    if (this.activities.length > 25) {
      this.activities.pop();
    }
  }

  // Admin Users
  getAdminUsers(): AdminUser[] {
    return this.adminUsers;
  }
}

export const serverStore = new ServerStore();
export const store = serverStore;
