import React, { useState } from 'react';
import { Navbar, Nav, Dropdown, Modal, Form, Button } from 'react-bootstrap';
import { Bell, User, Mail, Key, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TopNav = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...user,
      name: profileData.name,
      email: profileData.email
    });
    setShowProfileModal(false);
  };

  return (
    <>
      <Navbar className="top-nav px-4">
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

          <Nav.Link href="#" className="position-relative me-3">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              2
            </span>
          </Nav.Link>

          <Dropdown>
            <Dropdown.Toggle variant="link" className="text-theme d-flex align-items-center">
              <User size={20} className="me-2" />
              {user?.name || 'User'}
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => setShowProfileModal(true)}>Profile</Dropdown.Item>
              <Dropdown.Item href="#">Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>

      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary bg-opacity-10 rounded-full mb-2">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <Button variant="link" className="text-primary">Change Photo</Button>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <User size={18} className="me-2" />
                  Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <Mail size={18} className="me-2" />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </Form.Group>

              <hr className="my-4" />

              <h6 className="mb-3 d-flex align-items-center">
                <Key size={18} className="me-2" />
                Change Password
              </h6>

              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </Form.Group>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TopNav;