import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { content } from '../services/api';
import { format } from 'date-fns';

interface Content {
  id: string;
  title: string;
  body: string;
  status: string;
  author_name: string;
  tags: string[];
  featured_image?: string;
  publish_date: string;
  created_at: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Content[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await content.getAll();
      // Filter only published content
      const publishedPosts = data.filter((post: Content) => post.status === 'published');
      setPosts(publishedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
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

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-5">
        <h2 className="mb-4">Welcome to Modern CMS</h2>
        <p className="text-muted">No published posts yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Welcome to Modern CMS</h1>
      <Row className="g-4">
        {posts.map(post => (
          <Col key={post.id} md={6} lg={4}>
            <Link 
              to={`/blog/${post.id}`} 
              className="text-decoration-none"
            >
              <Card className="h-100 hover:shadow-lg transition-shadow duration-200">
                {post.featured_image && (
                  <Card.Img 
                    variant="top" 
                    src={post.featured_image} 
                    alt={post.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title className="text-dark">{post.title}</Card.Title>
                  <div className="text-muted mb-3">
                    By {post.author_name}
                    {post.publish_date && (
                      <span className="ms-2">
                        {format(new Date(post.publish_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="me-2 px-2 py-1 bg-light rounded-pill text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;