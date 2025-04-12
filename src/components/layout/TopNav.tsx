import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { Bell, User } from 'lucide-react';

const TopNav = () => {
  return (
    <Navbar className="top-nav px-4">
      <Nav className="ms-auto d-flex align-items-center">
        <Nav.Link href="#" className="position-relative me-3">
          <Bell size={20} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            2
          </span>
        </Nav.Link>
        <Dropdown>
          <Dropdown.Toggle variant="link" className="text-dark d-flex align-items-center">
            <User size={20} className="me-2" />
            John Admin
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item href="#">Profile</Dropdown.Item>
            <Dropdown.Item href="#">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default TopNav;