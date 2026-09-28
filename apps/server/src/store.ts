import {
  Post,
  Comment,
  SubscriberItem,
  PublicationSettings,
  DashboardAnalytics,
  ActivityItem,
  Product,
  AdminUser,
  MediaAsset,
  Author
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
  private posts: Post[] = [...INITIAL_POSTS];
  private comments: Comment[] = [...INITIAL_COMMENTS];
  private subscribers: SubscriberItem[] = [...INITIAL_SUBSCRIBERS];
  private settings: PublicationSettings = { ...INITIAL_SETTINGS };
  private analytics: DashboardAnalytics = { ...INITIAL_ANALYTICS };
  private activities: ActivityItem[] = [...INITIAL_ACTIVITIES];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private media: MediaAsset[] = [...INITIAL_MEDIA];
  private authors: Author[] = Object.values(INITIAL_AUTHORS);
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
      this.analytics.totalViews = (this.analytics.totalViews || 0) + 1;
      return post;
    }
    return undefined;
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

  replyToComment(commentId: string, replyContent: string): Comment | null {
    const comm = this.comments.find(c => c.id === commentId);
    if (!comm) return null;
    comm.reply = replyContent;
    comm.repliedAt = new Date().toISOString();
    return comm;
  }

  deleteComment(commentId: string): boolean {
    const idx = this.comments.findIndex(c => c.id === commentId);
    if (idx >= 0) {
      this.comments.splice(idx, 1);
      return true;
    }
    return false;
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
