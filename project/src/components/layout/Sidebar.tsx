import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Palette, 
  Shield 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="p-4">
        <h4 className="mb-4 font-weight-bold">Modern CMS</h4>
        <nav>
          <NavLink to="/admin" end className="sidebar-link mb-2">
            <LayoutDashboard size={20} className="sidebar-icon" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className="sidebar-link mb-2">
            <Users size={20} className="sidebar-icon" />
            Users
          </NavLink>
          <NavLink to="/admin/contents" className="sidebar-link mb-2">
            <FileText size={20} className="sidebar-icon" />
            Contents
          </NavLink>
          <NavLink to="/admin/templates" className="sidebar-link mb-2">
            <Palette size={20} className="sidebar-icon" />
            Templates
          </NavLink>
          <NavLink to="/admin/roles" className="sidebar-link mb-2">
            <Shield size={20} className="sidebar-icon" />
            Roles
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;