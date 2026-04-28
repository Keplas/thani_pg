import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI.jsx';
import toast from 'react-hot-toast';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dash = user?.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard';
  const handleLogout = () => { logout(); toast.success('Signed out successfully'); navigate('/'); };

  return (
    <div className="topbar">
      <div className="topbar-brand" onClick={() => user && navigate(dash)}>
        <div className="brand-icon">T</div>
        <div>
          <div className="brand-name">Thani</div>
          <div className="brand-sub">ALJABRI PHARMACEUTICALS</div>
        </div>
      </div>
      <div className="topbar-right">
        {user ? (
          <>
            <span className={`role-tag ${user.role === 'owner' ? 'role-owner' : 'role-pro'}`}>
              {user.role === 'owner' ? '🏪 Owner' : '👩‍⚕️ Professional'}
            </span>
            <span style={{ fontSize:14, fontWeight:500, color:'var(--grey-700)' }}>{user.name}</span>
            <Avatar name={user.name} size="sm" color={user.role === 'owner' ? 'var(--primary)' : 'var(--success)'}
              style={{ cursor:'pointer' }} onClick={() => navigate(dash)} />
            <button className="btn btn-grey btn-sm" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <NavLink to="/login"    className="btn btn-grey btn-sm">Sign In</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ sections }) {
  return (
    <div className="sidebar">
      {sections.map((sec, i) => (
        <div key={i}>
          {sec.label && <div className="sidebar-section">{sec.label}</div>}
          {sec.links.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && <span className="nav-badge">{link.badge}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AppShell({ navSections, children }) {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar sections={navSections} />
        <div className="main-area">{children}</div>
      </div>
    </div>
  );
}

import { Navigate } from 'react-router-dom';
export function RequireAuth({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard'} replace />;
  return children;
}
