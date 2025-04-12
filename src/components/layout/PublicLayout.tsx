import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <Navbar bg="white" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">Modern CMS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center">
              <Button
                variant={theme === 'light' ? 'light' : 'dark'}
                className="d-flex align-items-center me-3 rounded-circle p-2"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                style={{ width: '40px', height: '40px', border: '1px solid var(--border-color)' }}
              >
                {theme === 'light' ? (
                  <Moon size={20} className="text-theme" />
                ) : (
                  <Sun size={20} className="text-theme" />
                )}
              </Button>
              <Nav.Link as={Link} to="/login">Admin Login</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="py-4">
        <Outlet />
      </Container>
    </div>
  );
};

export default PublicLayout;