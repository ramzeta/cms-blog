import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { mockContent } from '../data/mockData';
import { format } from 'date-fns';

const Home = () => {
  const publishedContent = mockContent.filter(content => content.status === 'published');

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Welcome to Modern CMS</h1>
      <Row className="g-4">
        {publishedContent.map(content => (
          <Col key={content.id} md={6} lg={4}>
            <Link 
              to={`/blog/${content.id}`} 
              className="text-decoration-none"
            >
              <Card className="h-100 hover:shadow-lg transition-shadow duration-200">
                {content.featuredImage && (
                  <Card.Img 
                    variant="top" 
                    src={content.featuredImage} 
                    alt={content.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title className="text-dark">{content.title}</Card.Title>
                  <div className="text-muted mb-3">
                    By {content.author.name}
                    {content.publishDate && (
                      <span className="ms-2">
                        {format(new Date(content.publishDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {content.tags.map((tag, index) => (
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

export default Home