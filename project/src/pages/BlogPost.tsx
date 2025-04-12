import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { content } from '../services/api';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  body: string;
  author_name: string;
  tags: string[];
  featured_image?: string;
  publish_date: string;
}

const AdBanner = ({ position }: { position: 'left' | 'right' }) => (
  <div className="hidden lg:block w-[160px] fixed top-1/2 -translate-y-1/2" style={{ [position]: '2rem' }}>
    <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
      <img 
        src={`https://images.unsplash.com/photo-1558389186-438424b00a6b?w=300&h=600&fit=crop`}
        alt={`Advertisement ${position}`}
        className="w-full h-[600px] object-cover"
      />
      <div className="p-2 text-center text-sm text-gray-600">
        Advertisement
      </div>
    </div>
  </div>
);

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!id) return;
      const data = await content.getById(id);
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link to="/" className="text-primary hover:underline">
          <ArrowLeft className="inline mr-2" size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <AdBanner position="left" />
      <AdBanner position="right" />
      
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2" size={20} />
          Back to Home
        </Link>
        
        <Card className="border-0 shadow-lg">
          {post.featured_image && (
            <div className="h-[400px] overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <Card.Body className="p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <span className="mr-4">By {post.author_name}</span>
                {post.publish_date && (
                  <span>{format(new Date(post.publish_date), 'MMMM dd, yyyy')}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;