import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const AdminLayout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 min-vh-100 bg-light">
        <TopNav />
        <Container fluid className="px-4 py-3">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;