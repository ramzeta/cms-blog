export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
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