import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
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
import {
  Users,
  FileText,
  Activity,
  PlusCircle,
  UserPlus,
  Palette
} from 'lucide-react';

// Registro de módulos para ChartJS
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
  // Datos para el gráfico de estado de contenido (Doughnut)
  const contentData = {
    labels: ['Published', 'Draft', 'Archived'],
    datasets: [{
      data: mockDashboardMetrics.contentByStatus.map(item => item.count),
      backgroundColor: ['#3b82f6', '#f59e0b', '#6b7280'],
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-color)',
          font: {
            family: "'Crimson Pro', Georgia, serif",
            size: 14
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'var(--card-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-theme">
      <h1 className="mb-4 text-theme">Dashboard</h1>
      
      {/* Métricas principales */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 bg-card border-theme">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 bg-primary bg-opacity-10 me-3">
                  <Users size={24} className="text-primary" />
                </div>
                <h6 className="mb-0 text-theme fw-bold">Total Users</h6>
              </div>
              <h3 className="mb-2 text-theme">{mockDashboardMetrics.totalUsers}</h3>
              <p className="text-theme opacity-75 mb-0 fw-medium">
                {mockDashboardMetrics.activeUsers} active users
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 bg-card border-theme">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 bg-secondary bg-opacity-10 me-3">
                  <FileText size={24} className="text-secondary" />
                </div>
                <h6 className="mb-0 text-theme fw-bold">Total Content</h6>
              </div>
              <h3 className="mb-2 text-theme">{mockDashboardMetrics.totalContent}</h3>
              <p className="text-theme opacity-75 mb-0 fw-medium">
                {mockDashboardMetrics.publishedContent} published
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 bg-card border-theme">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 bg-info bg-opacity-10 me-3">
                  <Activity size={24} className="text-info" />
                </div>
                <h6 className="mb-0 text-theme fw-bold">Content Status</h6>
              </div>
              <div style={{ height: '150px' }}>
                <Doughnut 
                  data={contentData} 
                  options={chartOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actividad reciente y acciones rápidas */}
      <Row className="g-4">
        <Col md={8}>
          <Card className="bg-card border-theme">
            <Card.Body>
              <h5 className="mb-4 text-theme fw-bold">Recent Activity</h5>
              <div className="activity-timeline">
                {mockDashboardMetrics.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item mb-3">
                    <p className="mb-1">
                      <strong className="text-theme">{activity.user}</strong>{' '}
                      <span className="text-theme opacity-75">{activity.action}</span>
                    </p>
                    <small className="text-theme opacity-50">
                      {formatDistanceToNow(new Date(activity.date))} ago
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-card border-theme">
            <Card.Body>
              <h5 className="mb-4 text-theme fw-bold">Quick Actions</h5>
              <div className="d-grid gap-3 quick-actions">
                <Button 
                  variant="primary" 
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <PlusCircle size={20} />
                  Create New Content
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <UserPlus size={20} />
                  Add New User
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <Palette size={20} />
                  Manage Templates
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
