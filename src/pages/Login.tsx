import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-paper">
      <Card className="w-full max-w-md border-border shadow-lg">
        <Card.Body className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display mb-2">Admin Login</h1>
            <p className="text-theme opacity-80 mb-4">Sign in to access the dashboard</p>
            <div className="text-sm text-theme opacity-70">
              <p className="mb-1">Default credentials:</p>
              <div className="font-mono">
                <p className="mb-1">Email: <span className="text-primary">admin@example.com</span></p>
                <p className="mb-0">Password: <span className="text-primary">admin123</span></p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="font-display text-theme opacity-90 font-semibold">
                Email address
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-paper border-border text-theme"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="font-display text-theme opacity-90 font-semibold">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-paper border-border text-theme"
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-full mb-4 bg-primary hover:bg-primary-hover text-paper font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;