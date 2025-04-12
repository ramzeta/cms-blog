import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { mockTemplates } from '../data/mockData';

const Templates = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Content Templates</h1>
        <Button variant="primary">Create Template</Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Description</th>
                <th>Fields</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTemplates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.description}</td>
                  <td>{template.fields.length} fields</td>
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

export default Templates;