import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { mockContent } from '../data/mockData';
import { format } from 'date-fns';

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
  const post = mockContent.find(content => content.id === id);

  if (!post) {
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
          {post.featuredImage && (
            <div className="h-[400px] overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <Card.Body className="p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <span className="mr-4">By {post.author.name}</span>
                {post.publishDate && (
                  <span>{format(new Date(post.publishDate), 'MMMM dd, yyyy')}</span>
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