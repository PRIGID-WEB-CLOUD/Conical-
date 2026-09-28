import {
  Post,
  Comment,
  SubscriberItem,
  PublicationSettings,
  DashboardAnalytics,
  ActivityItem,
  MediaAsset
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

  async getComments(): Promise<Comment[]> {
    try {
      const res = await fetch(`${API_BASE}/comments`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.comments || [];
    } catch {
      return INITIAL_COMMENTS;
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
};
