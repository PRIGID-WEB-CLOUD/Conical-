import { Post, Comment, CommentReply, SubscriberItem, PublicationSettings, Author } from '@chronicle/shared';
import { INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_SETTINGS, INITIAL_AUTHORS } from '@chronicle/shared';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const readerApi = {
  async getPosts(category?: string, search?: string): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.posts || [];
    } catch {
      let posts = [...INITIAL_POSTS];
      if (category && category !== 'all') {
        posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
      }
      return posts;
    }
  },

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    try {
      const res = await fetch(`${API_BASE}/posts/${slug}?trackView=true`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.post;
    } catch {
      return INITIAL_POSTS.find(p => p.slug === slug || p.id === slug);
    }
  },

  async recordView(slug: string): Promise<number | undefined> {
    try {
      const res = await fetch(`${API_BASE}/posts/${slug}/view`, { method: 'POST' });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.views;
    } catch {
      return undefined;
    }
  },

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const res = await fetch(`${API_BASE}/comments?postId=${postId}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.comments || [];
    } catch {
      return INITIAL_COMMENTS.filter(c => c.postId === postId);
    }
  },

  async postComment(postId: string, content: string, authorName: string): Promise<Comment> {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, authorName }),
      });
      const data = await res.json();
      return data.comment;
    } catch {
      return {
        id: `comm-${Date.now()}`,
        postId,
        authorName,
        initials: authorName.slice(0, 2).toUpperCase() || 'RM',
        content,
        createdAt: new Date().toISOString(),
        relativeTime: 'Just now',
        likes: 0,
        status: 'approved',
        replies: [],
      };
    }
  },

  async postReply(
    commentId: string,
    content: string,
    authorName: string,
    replyToAuthor?: string
  ): Promise<{ reply: CommentReply; comment?: Comment }> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorName, replyToAuthor }),
      });
      if (!res.ok) throw new Error('Failed to post reply');
      const data = await res.json();
      return data;
    } catch {
      const fallbackReply: CommentReply = {
        id: `reply-${Date.now()}`,
        commentId,
        authorName,
        initials: authorName.slice(0, 2).toUpperCase() || 'RM',
        content,
        createdAt: new Date().toISOString(),
        relativeTime: 'Just now',
        likes: 0,
        replyToAuthor,
      };
      return { reply: fallbackReply };
    }
  },

  async toggleCommentLike(commentId: string, decrement: boolean = false): Promise<number | undefined> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.likes;
    } catch {
      return undefined;
    }
  },

  async toggleReplyLike(commentId: string, replyId: string, decrement: boolean = false): Promise<number | undefined> {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement }),
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.likes;
    } catch {
      return undefined;
    }
  },

  async subscribe(email: string): Promise<SubscriberItem> {
    try {
      const res = await fetch(`${API_BASE}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data.subscriber;
    } catch {
      return {
        id: `sub-${Date.now()}`,
        email,
        status: 'active',
        tier: 'Weekly Dispatch',
        joinedAt: 'Today',
      };
    }
  },

  async getSettings(): Promise<PublicationSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.settings;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  async getAuthors(): Promise<Author[]> {
    try {
      const res = await fetch(`${API_BASE}/authors`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.authors || [];
    } catch {
      return Object.values(INITIAL_AUTHORS);
    }
  },

  async getAuthor(identifier: string): Promise<{ author: Author; posts: Post[] } | undefined> {
    try {
      const res = await fetch(`${API_BASE}/authors/${identifier}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      const clean = identifier.toLowerCase().trim();
      const allAuthors = Object.values(INITIAL_AUTHORS);
      const author = allAuthors.find(
        (a) =>
          a.id.toLowerCase() === clean ||
          (a.slug && a.slug.toLowerCase() === clean) ||
          a.name.toLowerCase().replace(/\s+/g, '-') === clean ||
          a.name.toLowerCase() === clean
      );
      if (!author) return undefined;
      const posts = INITIAL_POSTS.filter(
        (p) =>
          p.status === 'published' &&
          (p.author.id === author.id ||
            p.author.name.toLowerCase() === author.name.toLowerCase() ||
            p.author.name.toLowerCase().replace(/\s+/g, '-') === clean)
      );
      return { author, posts };
    }
  },
};
