import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div>
      <Navbar bg="white" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">Modern CMS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
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