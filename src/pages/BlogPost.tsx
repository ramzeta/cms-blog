import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { content, interactions } from '../services/api';
import { format } from 'date-fns';
import useFingerprint from '../hooks/useFingerprint';
import InteractionButtons from '../components/InteractionButtons';
import SEOHead from '../components/SEOHead';

interface Post {
  id: string;
  title: string;
  body: string;
  author_name: string;
  tags: string[];
  featured_image?: string;
  publish_date: string;
  created_at: string;
  updated_at: string;
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
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const fingerprint = useFingerprint();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Invalid post ID');
        setLoading(false);
        return;
      }

      try {
        const data = await content.getById(id);
        
        if (!data) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        // Ensure tags is an array
        const tags = data.tags ? (
          typeof data.tags === 'string' ? data.tags.split(',') : data.tags
        ) : [];

        setPost({
          ...data,
          tags: tags.filter(Boolean) // Remove empty tags
        });

        // Record view if we have a fingerprint
        if (fingerprint) {
          await recordView();
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, fingerprint]);

  const recordView = async () => {
    if (!id || !fingerprint) return;
    
    try {
      await interactions.recordInteraction({
        contentId: id,
        fingerprint,
        action: 'view'
      });
    } catch (err) {
      console.error('Error recording view:', err);
      // Don't show error to user for view recording
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">
          {error || 'Post not found'}
        </h2>
        <Link to="/" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2" size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.body.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={post.featured_image}
        author={post.author_name}
        publishedTime={post.publish_date || post.created_at}
        keywords={post.tags}
      />
      
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
                  onError={(e) => {
                    // Fallback image if the featured image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=400&fit=crop';
                  }}
                />
              </div>
            )}
            
            <Card.Body className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <span className="mr-4">By {post.author_name}</span>
                  {(post.publish_date || post.created_at) && (
                    <span>
                      {format(new Date(post.publish_date || post.created_at), 'MMMM dd, yyyy')}
                    </span>
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
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
                )}
              </div>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              <div className="mt-8 pt-6 border-t">
                <InteractionButtons
                  contentId={id || ''}
                  initialLikes={0}
                  initialComments={0}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BlogPost;