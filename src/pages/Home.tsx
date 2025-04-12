import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Form, InputGroup, Button, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { content, search, settings } from '../services/api';
import { format } from 'date-fns';
import { Search as SearchIcon, Loader2, Key } from 'lucide-react';

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
  generated?: boolean;
  source?: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Content[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [aiProvider, setAiProvider] = useState<'ollama' | 'openai'>('openai');
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      await settings.saveApiKey(apiKey);
      setShowApiKeyModal(false);
      setApiKey('');
    } catch (err: any) {
      setError(err.message || 'Failed to save API key');
    } finally {
      setSavingKey(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await content.getAll();
      // Ensure data is an array before filtering
      const publishedPosts = Array.isArray(data) ? data.filter((post: Content) => post.status === 'published') : [];
      setPosts(publishedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');

    try {
      const { results, generated } = await search.query(searchTerm, {
        generate: true,
        ai: aiProvider
      });

      if (results.length > 0) {
        setPosts(results);
      } else {
        setError('No results found');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      if (err.message?.includes('OpenAI API key not configured')) {
        setShowApiKeyModal(true);
      }
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setPosts([]);
    } finally {
      setSearching(false);
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

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Modern CMS</h1>
        <p className="text-xl text-muted mb-6">Discover amazing content</p>

        <Form onSubmit={handleSearch}>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder="Search articles or ask a question..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={searching || !searchTerm.trim()}
                >
                  {searching ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <SearchIcon size={20} />
                  )}
                </Button>
              </InputGroup>
              <div className="mt-2">
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setShowAiSettings(!showAiSettings)}
                >
                  AI Settings
                </Button>
              </div>
            </div>
          </div>

          {showAiSettings && (
            <div className="mt-3 p-3 border rounded bg-light">
              <Form.Group>
                <Form.Label>AI Provider</Form.Label>
                <Form.Select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as 'ollama' | 'openai')}
                >
                  <option value="openai">OpenAI</option>
                  <option value="ollama">Ollama (Local)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {aiProvider === 'openai' ? (
                    <Button
                      variant="link"
                      className="p-0 text-primary"
                      onClick={() => setShowApiKeyModal(true)}
                    >
                      <Key size={16} className="me-1" />
                      Configure OpenAI API Key
                    </Button>
                  ) : (
                    'Ollama requires a local server to be running.'
                  )}
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Form>
      </div>

      {error && (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      )}

      {posts.length === 0 && !error ? (
        <div className="text-center py-5">
          <p className="text-muted">No published posts yet. Check back soon!</p>
        </div>
      ) : (
        <Row className="g-4">
          {posts.map(post => (
            <Col key={post.id} md={6} lg={4}>
              <Link 
                to={post.generated ? '#' : `/blog/${post.id}`}
                className="text-decoration-none"
                onClick={post.generated ? (e) => e.preventDefault() : undefined}
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
                    <Card.Title className="text-dark">
                      {post.title}
                      {post.generated && (
                        <Badge bg="info" className="ms-2">AI Generated</Badge>
                      )}
                    </Card.Title>
                    <div className="text-muted mb-3">
                      {post.generated ? (
                        <span>Generated by {post.source}</span>
                      ) : (
                        <>
                          By {post.author_name}
                          {post.publish_date && (
                            <span className="ms-2">
                              {format(new Date(post.publish_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {post.generated ? (
                      <div 
                        className="prose"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                      />
                    ) : (
                      <div className="mt-2">
                        {post.tags?.map((tag, index) => (
                          <span 
                            key={index}
                            className="me-2 px-2 py-1 bg-light rounded-pill text-muted"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showApiKeyModal} onHide={() => setShowApiKeyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configure OpenAI API Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveApiKey}>
            <Form.Group className="mb-3">
              <Form.Label>OpenAI API Key</Form.Label>
              <Form.Control
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                required
              />
              <Form.Text className="text-muted">
                Your API key will be securely stored on the server.
                Get your API key from the{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  OpenAI dashboard
                </a>.
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowApiKeyModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={savingKey || !apiKey.trim()}
              >
                {savingKey ? 'Saving...' : 'Save API Key'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;