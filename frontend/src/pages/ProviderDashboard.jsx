import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { providerAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    atRisk: 0,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await providerAPI.getPatients();
        setPatients(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const compliant = response.data.filter(p => p.compliance_status === 'Goal Met').length;
        const atRisk = response.data.filter(p => p.compliance_status === 'Missed').length;
        setStats({ total, compliant, atRisk });
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
        setStats({ total: 0, compliant: 0, atRisk: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Goal Met': return 'status--success';
      case 'In Progress': return 'status--warning';
      case 'Missed': return 'status--danger';
      default: return 'status--default';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading patients data...</p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <header className="provider-dashboard__header">
        <div>
          <h1 className="provider-dashboard__title">Provider Dashboard</h1>
          <p className="provider-dashboard__subtitle">
            Welcome back, Dr. {user?.first_name || 'Provider'}
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <span className="stat-card__icon">👥</span>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">Total Patients</span>
          </div>
        </Card>
        <Card className="stat-card stat-card--success">
          <span className="stat-card__icon">✅</span>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.compliant}</span>
            <span className="stat-card__label">Goals Met</span>
          </div>
        </Card>
        <Card className="stat-card stat-card--danger">
          <span className="stat-card__icon">⚠️</span>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.atRisk}</span>
            <span className="stat-card__label">Need Attention</span>
          </div>
        </Card>
      </div>

      {/* Patients List */}
      <section className="patients-section">
        <h2 className="section-title">Patient Compliance Overview</h2>
        <Card padding="none" className="patients-table-card">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Compliance Status</th>
                <th>Goals Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-name">
                      <span className="patient-avatar">
                        {patient.user.first_name[0]}{patient.user.last_name[0]}
                      </span>
                      <span>{patient.user.first_name} {patient.user.last_name}</span>
                    </div>
                  </td>
                  <td>{patient.user.email}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(patient.compliance_status)}`}>
                      {patient.compliance_status}
                    </span>
                  </td>
                  <td>{patient.goals_met}</td>
                  <td>
                    <Link to={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="small">View Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Card className="action-card">
            <span className="action-card__icon">📊</span>
            <h3 className="action-card__title">View Reports</h3>
            <p className="action-card__desc">Generate compliance and wellness reports</p>
            <Button variant="secondary" size="small">View</Button>
          </Card>
          <Card className="action-card">
            <span className="action-card__icon">📧</span>
            <h3 className="action-card__title">Send Reminders</h3>
            <p className="action-card__desc">Send bulk reminders to patients</p>
            <Button variant="secondary" size="small">Send</Button>
          </Card>
          <Card className="action-card">
            <span className="action-card__icon">📅</span>
            <h3 className="action-card__title">Schedule Checkups</h3>
            <p className="action-card__desc">Schedule preventive care checkups</p>
            <Button variant="secondary" size="small">Schedule</Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ProviderDashboard;

