import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { mockRoles } from '../data/mockData';

const Roles = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Role Management</h1>
        <Button variant="primary">Create Role</Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRoles.map(role => (
                <tr key={role.id}>
                  <td className="fw-medium">{role.name}</td>
                  <td>
                    {role.permissions.map((permission, index) => (
                      <Badge 
                        key={index} 
                        bg="info" 
                        className="me-2 mb-1"
                        style={{ textTransform: 'capitalize' }}
                      >
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <Button variant="link" className="text-primary p-0 me-3">Edit</Button>
                    <Button variant="link" className="text-danger p-0">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Roles;