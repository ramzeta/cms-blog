import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Search, Plus, Eye, MessageSquare, ThumbsUp, Share2, Clock, Edit2, Trash2 } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { content } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

interface Content {
  id: string;
  title: string;
  body: string;
  status: string;
  author_name: string;
  tags: string[];
  featured_image?: string;
  created_at: string;
  updated_at: string;
}

interface ContentFormData {
  title: string;
  body: string;
  status: string;
  template: string;
  featured_image?: string;
  tags: string[];
}

const Contents = () => {
  const { user } = useAuth();
  const [contentList, setContentList] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    body: '',
    status: 'draft',
    template: 'article',
    tags: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await content.getAll();
      setContentList(data);
    } catch (err) {
      setError('Failed to fetch content');
    }
  };

  const handleShowModal = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        body: content.body,
        status: content.status,
        template: 'article',
        featured_image: content.featured_image,
        tags: content.tags
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: '',
        body: '',
        status: 'draft',
        template: 'article',
        tags: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContent) {
        await content.update(editingContent.id, formData);
      } else {
        await content.create(formData);
      }
      fetchContent();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save content');
    }
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await content.delete(contentId);
        fetchContent();
      } catch (err) {
        setError('Failed to delete content');
      }
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === 'Enter' && input.value) {
      e.preventDefault();
      const newTag = input.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      input.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredContent = contentList
    .filter(content => 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(content => 
      statusFilter === 'all' ? true : content.status === statusFilter
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Content Management</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} className="me-2" />
          Create Content
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
            </Form.Select>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map(content => (
                <tr key={content.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {content.featured_image && (
                        <img
                          src={content.featured_image}
                          alt={content.title}
                          className="rounded me-3"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      )}
                      <div>{content.title}</div>
                    </div>
                  </td>
                  <td>{content.author_name}</td>
                  <td>
                    <Badge bg={content.status === 'published' ? 'success' : 'warning'}>
                      {content.status}
                    </Badge>
                  </td>
                  <td>
                    {content.tags.map((tag, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1">
                        #{tag}
                      </Badge>
                    ))}
                  </td>
                  <td>{formatDistanceToNow(new Date(content.updated_at))} ago</td>
                  <td>
                    <Button
                      variant="link"
                      className="text-primary p-0 me-3"
                      onClick={() => handleShowModal(content)}
                    >
                      <Edit2 size={18} />
                    </Button>
                    {(user?.role === 'admin' || content.author_name === user?.name) && (
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingContent ? 'Edit Content' : 'Create New Content'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <div className="border rounded">
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.body}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setFormData({ ...formData, body: data });
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo'
                    ]
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Featured Image URL</Form.Label>
              <Form.Control
                type="url"
                value={formData.featured_image || ''}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <div className="mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    bg="primary"
                    className="me-2 mb-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Form.Control
                type="text"
                placeholder="Type a tag and press Enter"
                onKeyDown={handleTagInput}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingContent ? 'Update' : 'Create'} Content
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Contents;