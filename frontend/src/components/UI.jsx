// Reusable UI components

export function Spinner() {
  return <div className="spinner-wrap"><div className="spinner" /></div>;
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function Alert({ type = 'info', children, onClose }) {
  const icons = { error:'❌', success:'✅', info:'ℹ️', warning:'⚠️' };
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span style={{ flex:1 }}>{children}</span>
      {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', opacity:0.6, fontSize:16 }}>✕</button>}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, color = 'var(--primary)', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {trend && <div className={`stat-trend ${trend.up ? 'trend-up' : 'trend-down'}`}>{trend.up ? '↑' : '↓'} {trend.text}</div>}
    </div>
  );
}

export function Avatar({ name, size = 'md', color = 'var(--primary)', style: sx }) {
  const initials = (name || '?').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className={`avatar avatar-${size}`} style={{ background: color, ...sx }}>
      {initials}
    </div>
  );
}

export function JobTypeBadge({ type }) {
  const map = { 'full-time':'primary', 'part-time':'navy', 'freelance':'warning', locum:'warning' };
  return <span className={`badge badge-${map[type] || 'grey'}`}>{type}</span>;
}

export function StatusBadge({ status }) {
  const map = { pending:'warning', shortlisted:'primary', hired:'success', rejected:'danger', active:'success', paused:'warning', closed:'grey' };
  const icons = { pending:'🕐', shortlisted:'⭐', hired:'✅', rejected:'✗', active:'🟢', paused:'⏸', closed:'🔒' };
  return <span className={`badge badge-${map[status] || 'grey'}`}>{icons[status]} {status}</span>;
}

export function Stars({ rating, count }) {
  const r = Math.round(rating || 0);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      <span className="stars">{'★'.repeat(r)}{'☆'.repeat(5-r)}</span>
      {count !== undefined && <span style={{ fontSize:12, color:'var(--grey-500)' }}>{Number(rating||0).toFixed(1)} ({count})</span>}
    </span>
  );
}

export function PillToggle({ options, selected = [], onToggle, colorActive = 'active' }) {
  return (
    <div className="pills-wrap">
      {options.map(opt => (
        <button key={opt} type="button"
          className={`pill ${selected.includes(opt) ? colorActive : ''}`}
          onClick={() => onToggle(opt)}>
          {selected.includes(opt) ? '✓ ' : ''}{opt}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export function SectionCard({ title, action, children, bodyStyle }) {
  return (
    <div className="card" style={{ marginBottom:20 }}>
      {(title || action) && (
        <div className="card-header">
          <span className="card-title">{title}</span>
          {action}
        </div>
      )}
      <div className="card-body" style={bodyStyle}>{children}</div>
    </div>
  );
}
