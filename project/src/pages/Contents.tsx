import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Plus, Eye, MessageSquare, ThumbsUp, Share2, Clock } from 'lucide-react';
import { mockContent } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';

const Contents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContent = mockContent
    .filter(content => 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(content => 
      statusFilter === 'all' ? true : content.status === statusFilter
    );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const formatMetric = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Content Management</h1>
        <Button variant="primary" className="d-flex align-items-center">
          <Plus size={20} className="me-2" />
          Create Content
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-3 mb-4">
            <InputGroup>
              <InputGroup.Text>
                <Search size={20} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Form.Select
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Form.Select>
          </div>

          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Content</th>
                <th>Status</th>
                <th>Metrics</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map(content => (
                <tr key={content.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {content.featuredImage && (
                        <img
                          src={content.featuredImage}
                          alt={content.title}
                          className="rounded me-3"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <h6 className="mb-1">{content.title}</h6>
                        <div className="d-flex gap-2">
                          {content.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-light text-dark"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(content.status)}>
                      {content.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center" title="Views">
                        <Eye size={16} className="me-1" />
                        {formatMetric(content.metrics.views)}
                      </div>
                      <div className="d-flex align-items-center" title="Comments">
                        <MessageSquare size={16} className="me-1" />
                        {content.metrics.comments.length}
                      </div>
                      <div className="d-flex align-items-center" title="Likes">
                        <ThumbsUp size={16} className="me-1" />
                        {formatMetric(content.metrics.likes)}
                      </div>
                      <div className="d-flex align-items-center" title="Shares">
                        <Share2 size={16} className="me-1" />
                        {content.metrics.shares}
                      </div>
                      <div className="d-flex align-items-center" title="Average Time on Page">
                        <Clock size={16} className="me-1" />
                        {formatTime(content.metrics.averageTimeOnPage)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-muted">
                      {formatDistanceToNow(new Date(content.lastModified))} ago
                    </div>
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

export default Contents;