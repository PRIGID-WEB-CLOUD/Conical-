import {
  Post,
  Comment,
  CommentReply,
  SubscriberItem,
  PublicationSettings,
  DashboardAnalytics,
  ActivityItem,
  MediaAsset,
  SyndicationLog
} from '@chronicle/shared';
import {
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_SUBSCRIBERS,
  INITIAL_SETTINGS,
  INITIAL_ANALYTICS,
  INITIAL_ACTIVITIES,
  INITIAL_MEDIA
} from '@chronicle/shared';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const adminApi = {
  async getPosts(filter?: { status?: string; category?: string; search?: string }): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.status) params.append('status', filter.status);
      if (filter?.category) params.append('category', filter.category);
      if (filter?.search) params.append('search', filter.search);

      const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.posts || [];
    } catch {
      return INITIAL_POSTS;
    }
  },

  async getPostById(id: string): Promise<Post | undefined> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.post;
    } catch {
      return INITIAL_POSTS.find(p => p.id === id || p.slug === id);
    }
  },

  async savePost(postData: Partial<Post> & { title: string; content: string }): Promise<Post> {
    try {
      const method = postData.id ? 'PUT' : 'POST';
      const url = postData.id ? `${API_BASE}/posts/${postData.id}` : `${API_BASE}/posts`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!res.ok) throw new Error('Failed to save post');
      const data = await res.json();
      return data.post;
    } catch {
      return {
        ...INITIAL_POSTS[0],
        ...postData,
      } as Post;
    }
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async getMedia(filter?: { category?: string; search?: string }): Promise<MediaAsset[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.category && filter.category !== 'All Categories') params.append('category', filter.category);
      if (filter?.search) params.append('search', filter.search);

      const res = await fetch(`${API_BASE}/media?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.media || [];
    } catch {
      return INITIAL_MEDIA;
    }
  },

  async uploadMedia(data: Partial<MediaAsset> & { name: string; url: string }): Promise<MediaAsset> {
    try {
      const res = await fetch(`${API_BASE}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('API error');
      const resJson = await res.json();
      return resJson.asset;
    } catch {
      return {
        id: `media-${Date.now()}`,
        name: data.name,
        url: data.url,
        alt: data.alt || data.name,
        caption: data.caption || '',
        category: (data.category as any) || 'Editorial',
        dimensions: data.dimensions || '1400x900',
        sizeFormatted: data.sizeFormatted || '420 KB',
        mimeType: data.mimeType || 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      };
    }
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/media/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async getComments(postId?: string): Promise<Comment[]> {
    try {
      const url = postId ? `${API_BASE}/comments?postId=${postId}` : `${API_BASE}/comments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.comments || [];
    } catch {
      return INITIAL_COMMENTS;
    }
  },

  async addComment(postId: string, content: string, authorName: string): Promise<Comment> {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, authorName }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.comment;
    } catch {
      return {
        id: Date.now().toString(),
        postId,
        content,
        authorName,
        createdAt: new Date().toISOString(),
        relativeTime: 'Just now',
        likes: 0,
        initials: authorName.substring(0, 2).toUpperCase(),
      };
    }
  },

  async replyToComment(id: string, reply: string): Promise<Comment> {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.comment;
    } catch {
      return INITIAL_COMMENTS[0];
    }
  },

  async deleteComment(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async postReply(
    commentId: string,
    content: string,
    authorName: string = 'Editorial Staff',
    replyToAuthor?: string,
    isStaff: boolean = true
  ): Promise<{ reply: CommentReply; comment?: Comment }> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorName, replyToAuthor, isStaff }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      const fallbackReply: CommentReply = {
        id: `reply-${Date.now()}`,
        commentId,
        authorName,
        initials: 'ED',
        content,
        createdAt: new Date().toISOString(),
        relativeTime: 'Just now',
        likes: 0,
        replyToAuthor,
        isStaff,
      };
      return { reply: fallbackReply };
    }
  },

  async deleteReply(commentId: string, replyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  async toggleReplyLike(commentId: string, replyId: string, decrement?: boolean): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.likes || 0;
    } catch {
      return 0;
    }
  },

  async getSubscribers(): Promise<SubscriberItem[]> {
    try {
      const res = await fetch(`${API_BASE}/subscribers`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.subscribers || [];
    } catch {
      return INITIAL_SUBSCRIBERS;
    }
  },

  async getSettings(): Promise<{ settings: PublicationSettings; analytics: DashboardAnalytics; activities: ActivityItem[] }> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return {
        settings: INITIAL_SETTINGS,
        analytics: INITIAL_ANALYTICS,
        activities: INITIAL_ACTIVITIES,
      };
    }
  },

  async updateSettings(newSettings: Partial<PublicationSettings>): Promise<PublicationSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      return data.settings;
    } catch {
      return { ...INITIAL_SETTINGS, ...newSettings };
    }
  },

  async aiEditorialAssist(task: string, title: string, content: string): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/ai/editorial-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, title, content }),
      });
      const data = await res.json();
      return data.result || 'Analysis complete.';
    } catch {
      return '• Recommendation: Maintain typographic cadence and strong introductory assertion.';
    }
  },

  async getCronStatus(): Promise<{
    status: string;
    scheduler: string;
    intervalSeconds: number;
    queuedScheduledCount: number;
    queuedPosts: Array<{ id: string; title: string; scheduledAt?: string; category: string; author: string }>;
    stats: {
      lastRunAt: string;
      totalExecutions: number;
      totalAutoPublished: number;
      history: Array<{ timestamp: string; publishedCount: number; titles: string[] }>;
    };
  }> {
    try {
      const res = await fetch(`${API_BASE}/cron/status`);
      if (!res.ok) throw new Error('Cron status error');
      return await res.json();
    } catch {
      return {
        status: 'active',
        scheduler: 'Chronicle Publisher Automated Cron Engine',
        intervalSeconds: 5,
        queuedScheduledCount: 0,
        queuedPosts: [],
        stats: { lastRunAt: new Date().toISOString(), totalExecutions: 42, totalAutoPublished: 3, history: [] },
      };
    }
  },

  async triggerCron(): Promise<{ success: boolean; message: string; result?: { timestamp: string; publishedCount: number; titles: string[] } }> {
    try {
      const res = await fetch(`${API_BASE}/cron/trigger`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: true, message: 'Cron execution completed. 0 scheduled posts pending.' };
    }
  },

  async getEnvConfig(): Promise<Record<string, boolean>> {
    try {
      const res = await fetch(`${API_BASE}/channels`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.envConfig || {};
    } catch {
      return {};
    }
  },

  async getSyndications(): Promise<SyndicationLog[]> {
    try {
      const res = await fetch(`${API_BASE}/channels/syndications`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.syndications || [];
    } catch {
      return [];
    }
  },

  async repostSyndication(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/channels/syndications/${id}/repost`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteSyndication(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/channels/syndications/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async likePost(id: string, decrement?: boolean): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      const data = await res.json();
      return data.likes || 0;
    } catch {
      return 0;
    }
  },

  async sharePost(id: string, decrement?: boolean): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      const data = await res.json();
      return data.shares || 0;
    } catch {
      return 0;
    }
  },

  async updateComment(id: string, content: string): Promise<Comment | null> {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      return data.comment;
    } catch {
      return null;
    }
  },

  async likeComment(id: string, decrement?: boolean): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      const data = await res.json();
      return data.likes || 0;
    } catch {
      return 0;
    }
  },

  async syncSocialMetrics(channelId: string, postId: string): Promise<{ likes: number; shares: number; newCommentsCount: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/channels/${channelId}/sync-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getMetaAuthUrl(channelId: string): Promise<string | null> {
    try {
      const res = await fetch(`${API_BASE}/channels/${channelId}/auth-url`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  },

  async getMetaConfig(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/channels/meta-config`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.metaConfig;
    } catch {
      return null;
    }
  },

  async updateMetaConfig(appId: string, appSecret: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/channels/meta-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, appSecret }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.metaConfig;
    } catch {
      return null;
    }
  },
};
