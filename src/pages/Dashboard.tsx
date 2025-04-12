import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { mockDashboardMetrics } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const contentData = {
    labels: ['Published', 'Draft', 'Archived'],
    datasets: [{
      data: mockDashboardMetrics.contentByStatus.map(item => item.count),
      backgroundColor: ['#3b82f6', '#f59e0b', '#6b7280'],
    }]
  };

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Users</h6>
              <h3>{mockDashboardMetrics.totalUsers}</h3>
              <p className="text-success mb-0">
                {mockDashboardMetrics.activeUsers} active users
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Content</h6>
              <h3>{mockDashboardMetrics.totalContent}</h3>
              <p className="text-primary mb-0">
                {mockDashboardMetrics.publishedContent} published
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Content Status</h6>
              <div style={{ height: '150px' }}>
                <Doughnut data={contentData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Recent Activity</h5>
              <div className="activity-timeline">
                {mockDashboardMetrics.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item mb-3">
                    <p className="mb-1">
                      <strong>{activity.user}</strong> {activity.action}
                    </p>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(activity.date))} ago
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-primary">Create New Content</button>
                <button className="btn btn-outline-primary">Add New User</button>
                <button className="btn btn-outline-primary">Manage Templates</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;