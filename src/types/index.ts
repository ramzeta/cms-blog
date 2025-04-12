export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  tags: string[];
  author: User;
  template: string;
  featuredImage?: string;
  metrics: {
    views: number;
    comments: Comment[];
    likes: number;
    shares: number;
    averageTimeOnPage: number; // in seconds
  };
  lastModified: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  fields: {
    name: string;
    type: 'text' | 'rich-text' | 'image' | 'date' | 'tags';
    required: boolean;
  }[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  contentByStatus: {
    status: string;
    count: number;
  }[];
  recentActivity: {
    type: string;
    user: string;
    action: string;
    date: string;
  }[];
}