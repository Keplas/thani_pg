import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Spinner, EmptyState, StatusBadge, JobTypeBadge } from '../../components/UI.jsx';
import api from '../../api/axios';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs,  setJobs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/owner'), api.get('/jobs/my')])
      .then(([s, j]) => { setStats(s.data.stats); setJobs(j.data.jobs.slice(0,5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening at your pharmacy today.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="💼" label="Active Jobs"       value={stats?.active_jobs}  sub="Open postings"        color="var(--primary)" />
        <StatCard icon="📋" label="Total Applications" value={stats?.total_apps}   sub="Received so far"     color="var(--success)" />
        <StatCard icon="✅" label="Total Hires"        value={stats?.total_hires}  sub="Successful placements" color="var(--warning)" />
        <StatCard icon="⭐" label="Your Rating"        value={stats?.rating > 0 ? `${stats.rating}★` : '—'} sub={`${stats?.review_count||0} reviews`} color="var(--primary)" />
      </div>

      {/* Recent Jobs */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-header">
          <span className="card-title">Recent Job Postings</span>
          <Link to="/owner/post-job" className="btn btn-primary btn-sm">+ Post New Job</Link>
        </div>
        <div style={{ padding:'0 22px' }}>
          {jobs.length === 0 ? (
            <EmptyState icon="💼" title="No jobs yet" message="Post your first job to start receiving applications."
              action={<Link to="/owner/post-job" className="btn btn-primary">Post a Job</Link>} />
          ) : jobs.map((job, i) => (
            <div key={job.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom: i < jobs.length-1 ? '1px solid var(--grey-100)' : 'none' }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💊</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--navy)' }}>{job.title}</div>
                <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center', flexWrap:'wrap' }}>
                  <JobTypeBadge type={job.job_type} />
                  {job.city && <span style={{ fontSize:12, color:'var(--grey-500)' }}>📍 {job.city}</span>}
                  <span style={{ fontSize:12, color:'var(--grey-500)' }}>{job.application_count} applications</span>
                </div>
              </div>
              <StatusBadge status={job.status} />
              <Link to={`/owner/jobs/${job.id}/applications`} className="btn btn-grey btn-sm">View Apps</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        {[
          { icon:'➕', label:'Post a Job',      to:'/owner/post-job',     color:'var(--primary-bg)',  text:'var(--primary)' },
          { icon:'🔍', label:'Find Talent',     to:'/owner/find-talent',  color:'var(--success-bg)',  text:'var(--success)' },
          { icon:'📋', label:'All My Jobs',     to:'/owner/jobs',         color:'var(--warning-bg)',  text:'var(--warning)' },
          { icon:'🏪', label:'Edit Profile',    to:'/owner/profile',      color:'var(--grey-100)',    text:'var(--grey-700)' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ background:a.color, border:'1px solid transparent', borderRadius:14, padding:'18px 20px', display:'flex', alignItems:'center', gap:12, textDecoration:'none', transition:'var(--transition)' }}
            onMouseOver={e => e.currentTarget.style.boxShadow='var(--shadow)'}
            onMouseOut={e => e.currentTarget.style.boxShadow='none'}>
            <span style={{ fontSize:22 }}>{a.icon}</span>
            <span style={{ fontWeight:600, fontSize:14, color:a.text }}>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
