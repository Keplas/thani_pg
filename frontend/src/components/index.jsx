import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── TOPBAR ──────────────────────────────────────────────────── */
export function Topbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const initials = user?.name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || '?';
  const dash = user?.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard';

  const handleLogout = () => { logout(); toast.success('Signed out'); nav('/'); };

  return (
    <div className="topbar">
      <div className="logo" onClick={() => user && nav(dash)}>
        <div className="logo-mark">T</div>
        <div>
          <div className="logo-name">Thani</div>
          <div className="logo-sub">Aljabri Pharmaceuticals</div>
        </div>
      </div>
      {user ? (
        <div className="flex items-center gap-12">
          <span className={`role-badge ${user.role==='owner'?'role-owner':'role-pro'}`}>
            {user.role === 'owner' ? '🏪 Owner' : '👩‍⚕️ Professional'}
          </span>
          <span className="font-semibold text-sm" style={{color:'var(--g600)'}}>{user.name}</span>
          <div className="avatar" style={{background:user.role==='owner'?'var(--blue)':'var(--mint)'}}
            onClick={() => nav(dash)} title="Go to dashboard">{initials}</div>
          <button className="btn btn-light btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <div className="flex gap-8">
          <NavLink to="/login"    className="btn btn-outline btn-sm">Sign In</NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
        </div>
      )}
    </div>
  );
}

/* ── SIDEBAR ─────────────────────────────────────────────────── */
export function Sidebar({ sections }) {
  return (
    <div className="sidebar">
      {sections.map((s, i) => (
        <div key={i}>
          {s.label && <div className="sidebar-section">{s.label}</div>}
          {s.links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => `nav-link${isActive?' active':''}`}>
              <span className="nav-icon">{l.icon}</span>
              <span>{l.label}</span>
              {l.badge && <span className="nav-badge">{l.badge}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── APP SHELL ───────────────────────────────────────────────── */
export function AppShell({ nav, children }) {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar sections={nav} />
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
}

/* ── REQUIRE AUTH ────────────────────────────────────────────── */
export function RequireAuth({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role==='owner'?'/owner/dashboard':'/pro/dashboard'} replace />;
  return children;
}

/* ── METRIC CARD ─────────────────────────────────────────────── */
export function MetricCard({ icon, label, value, sub, color = 'blue' }) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

/* ── JOB CARD ────────────────────────────────────────────────── */
export function JobCard({ job, footer }) {
  const typeColor = {'full-time':'blue','part-time':'navy','freelance':'amber','locum':'amber'};
  return (
    <div className="job-card">
      <div className="flex gap-12 mb-16">
        <div className="job-icon">🏥</div>
        <div className="flex-1">
          <div className="h4">{job.title}</div>
          <div className="text-sm text-muted mt-4">{job.owner_name || job.ownerName}</div>
          {job.city && <div style={{fontSize:12,color:'var(--g400)',marginTop:3}}>📍 {job.city}</div>}
        </div>
      </div>
      <p style={{fontSize:13,color:'var(--g500)',lineHeight:1.5,marginBottom:12,
        display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
        {job.description}
      </p>
      <div className="flex gap-6 flex-wrap mb-16">
        <span className={`chip chip-${typeColor[job.job_type]||'grey'}`}>{job.job_type}</span>
        {job.specializations?.slice(0,2).map(s=><span key={s} className="chip chip-grey">{s}</span>)}
        {job.experience_min>0 && <span className="chip chip-grey">{job.experience_min}+ yrs</span>}
      </div>
      <div className="flex items-center justify-between">
        <div>
          {job.pay_min>0
            ? <div className="pay-text">SAR {job.pay_min}{job.pay_max?`–${job.pay_max}`:'+'}
                <span className="pay-unit"> /{job.pay_type}</span></div>
            : <span className="chip chip-grey">Pay negotiable</span>}
          {job.match_score>0 &&
            <div className="match-pill mt-4">🎯 {job.match_score}% match</div>}
        </div>
        {footer}
      </div>
    </div>
  );
}

/* ── SPINNER ─────────────────────────────────────────────────── */
export function Spinner() {
  return <div className="spinner-wrap"><div className="spinner"/></div>;
}

/* ── EMPTY STATE ─────────────────────────────────────────────── */
export function Empty({ icon='📭', title='Nothing here', desc='', action }) {
  return (
    <div className="empty fade-up">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc mt-8">{desc}</div>}
      {action && <div className="mt-20">{action}</div>}
    </div>
  );
}
