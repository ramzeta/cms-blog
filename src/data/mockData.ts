import { User, Content, Template, Role, DashboardMetrics, Comment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-10T15:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Editor',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'active',
    lastLogin: '2024-03-09T12:45:00Z'
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Great article! Very informative.',
    author: mockUsers[1],
    createdAt: '2024-03-09T14:30:00Z'
  },
  {
    id: '2',
    content: 'Thanks for sharing this knowledge.',
    author: mockUsers[0],
    createdAt: '2024-03-09T15:45:00Z'
  }
];

export const mockContent: Content[] = [
  {
    id: '1',
    title: 'Getting Started with Our CMS',
    body: '<h1>Welcome to Modern CMS</h1><p>This is a sample article showing the capabilities of our content management system.</p>',
    status: 'published',
    publishDate: '2024-03-01T10:00:00Z',
    tags: ['guide', 'cms'],
    author: mockUsers[0],
    template: 'article',
    featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    metrics: {
      views: 1250,
      comments: mockComments,
      likes: 45,
      shares: 23,
      averageTimeOnPage: 180
    },
    lastModified: '2024-03-05T08:30:00Z'
  },
  {
    id: '2',
    title: 'Best Practices for Content Creation',
    body: '<h1>Content Creation Guide</h1><p>Learn how to create engaging content that resonates with your audience.</p>',
    status: 'draft',
    publishDate: '',
    tags: ['content', 'guide'],
    author: mockUsers[1],
    template: 'article',
    metrics: {
      views: 0,
      comments: [],
      likes: 0,
      shares: 0,
      averageTimeOnPage: 0
    },
    lastModified: '2024-03-08T16:45:00Z'
  },
  {
    id: '3',
    title: 'Advanced SEO Techniques',
    body: '<h1>SEO Mastery</h1><p>Discover advanced SEO techniques to improve your content visibility.</p>',
    status: 'published',
    publishDate: '2024-03-07T09:00:00Z',
    tags: ['seo', 'marketing'],
    author: mockUsers[0],
    template: 'article',
    featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a',
    metrics: {
      views: 876,
      comments: [mockComments[0]],
      likes: 32,
      shares: 15,
      averageTimeOnPage: 240
    },
    lastModified: '2024-03-07T14:20:00Z'
  }
];

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Article',
    description: 'Standard article template with title, content, and featured image',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'content', type: 'rich-text', required: true },
      { name: 'featuredImage', type: 'image', required: false },
      { name: 'publishDate', type: 'date', required: true },
      { name: 'tags', type: 'tags', required: false }
    ]
  }
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    permissions: ['manage_users', 'manage_content', 'manage_templates', 'manage_roles']
  },
  {
    id: '2',
    name: 'Editor',
    permissions: ['create_content', 'edit_content', 'publish_content']
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalUsers: 15,
  activeUsers: 12,
  totalContent: 45,
  publishedContent: 32,
  draftContent: 13,
  contentByStatus: [
    { status: 'published', count: 32 },
    { status: 'draft', count: 13 },
    { status: 'archived', count: 0 }
  ],
  recentActivity: [
    {
      type: 'content',
      user: 'Sarah Editor',
      action: 'published article',
      date: '2024-03-10T14:30:00Z'
    },
    {
      type: 'user',
      user: 'John Admin',
      action: 'created new user',
      date: '2024-03-10T12:15:00Z'
    }
  ]
};