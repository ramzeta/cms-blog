import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: any) => {
    await login(credentialResponse);
    navigate('/admin');
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center">
      <Card className="p-4" style={{ maxWidth: '400px' }}>
        <Card.Body className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <p className="text-muted mb-4">Sign in with your Google account to access the admin dashboard.</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              auto_select
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;