import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isPatient, isProvider } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const patientLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
    { path: '/goals', label: 'My Goals', icon: '🎯' },
    { path: '/reminders', label: 'Reminders', icon: '🔔' },
  ];

  const providerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/patients', label: 'My Patients', icon: '👥' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const links = isProvider ? providerLinks : patientLinks;

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">🏥</span>
            <span className="sidebar__brand-text">eHealth</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__link-icon">{link.icon}</span>
              <span className="sidebar__link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="sidebar__user-role">
                {user?.role === 'provider' ? 'Healthcare Provider' : 'Patient'}
              </span>
            </div>
          </div>
          <button onClick={handleLogoutClick} className="sidebar__logout">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
};

export default Sidebar;
