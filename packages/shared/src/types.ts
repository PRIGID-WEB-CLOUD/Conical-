export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  alt: string;
  caption?: string;
  category: 'Architecture' | 'Editorial' | 'Photography' | 'Design Systems' | 'Culture' | 'Technology';
  dimensions?: string;
  sizeBytes?: number;
  sizeFormatted?: string;
  mimeType: string;
  uploadedAt: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  archiveCount: number;
  slug?: string;
  location?: string;
  joinedYear?: number | string;
  website?: string;
  specialties?: string[];
  education?: string;
  twitter?: string;
  linkedin?: string;
  featuredQuote?: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  authorName: string;
  authorAvatar?: string;
  initials: string;
  content: string;
  createdAt: string;
  relativeTime: string;
  likes: number;
  replyToAuthor?: string;
  isStaff?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar?: string;
  initials: string;
  content: string;
  createdAt: string;
  relativeTime: string;
  likes: number;
  status?: 'approved' | 'pending' | 'flagged';
  reply?: string;
  repliedAt?: string;
  replies?: CommentReply[];
}

export interface SubscriberItem {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  tier: 'Weekly Dispatch' | 'Patron' | 'Complimentary';
  joinedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  imageCaption?: string;
  author: Author;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string;
  isEditorsPick?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  updatedAt: string;
  readingTimeMinutes: number;
  views: number;
  shares: number;
  readCompletionRate?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    canonicalUrl?: string;
  };
}

export interface ActivityItem {
  id: string;
  initials: string;
  actorName: string;
  action: string;
  targetTitle: string;
  timeAgo: string;
  categoryBadge?: string;
  statusBadge: string;
  statusType: 'published' | 'draft' | 'moderated' | 'system';
}

export interface DashboardAnalytics {
  totalViews30d: number;
  viewsGrowth: number;
  activeSubscribers: number;
  subscribersGrowth: number;
  newSubscribersThisWeek: number;
  engagementRate: number;
  engagementGrowth: number;
  avgTimeOnPage: string;
  trafficTrends: {
    week: { label: string; views: number }[];
    month: { label: string; views: number }[];
    year: { label: string; views: number }[];
  };
  topSpotlightPostId: string;
}

export interface PublicationSettings {
  publicationName: string;
  tagline: string;
  primaryLanguage: string;
  timezone: string;
  brandLogoMark: string;
  brandLogoFileName: string;
  authorProfile: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    twitterHandle: string;
    website: string;
  };
  appearance: {
    primaryColor: string;
    readingTheme: 'editorial-light' | 'sepia' | 'dark';
    fontHeading: string;
    showTableOfContents: boolean;
  };
  seoAndIntegrations: {
    googleAnalyticsId: string;
    siteUrl: string;
    twitterHandle: string;
    rssFeedEnabled: boolean;
  };
  notifications: {
    emailOnComment: boolean;
    weeklyDigest: boolean;
    breakingDraftAlerts: boolean;
  };
  environment: {
    stage: string;
    cmsCore: string;
    database: string;
    storageUsed: string;
  };
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: 'Print Journals' | 'Monographs & Books' | 'Print Subscriptions' | 'Limited Editions';
  price: number;
  format: string;
  pages?: number;
  weight?: string;
  coverImage: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
  sku: string;
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AdminRole = 
  | 'Managing Editor' 
  | 'Senior Editor' 
  | 'Systems Administrator' 
  | 'Editorial Fellow';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  department?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

export interface SyndicationLog {
  id: string;
  postId: string;
  postTitle: string;
  channelId: string;
  channelName: string;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  timestamp: string;
  url?: string;
}
