import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Spinner, StatusBadge, JobTypeBadge } from '../../components/UI.jsx';
import api from '../../api/axios';

export default function ProDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs,  setJobs]  = useState([]);
  const [apps,  setApps]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/pro'), api.get('/jobs'), api.get('/applications/my')])
      .then(([s, j, a]) => {
        setStats(s.data.stats);
        const sorted = [...(j.data.jobs||[])].sort((a,b) => (b.match_score||0)-(a.match_score||0));
        setJobs(sorted.slice(0,4));
        setApps(a.data.applications.slice(0,4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your activity summary and top job matches.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="📋" label="Applications"   value={stats?.total_apps}  sub="Total submitted"       color="var(--primary)" />
        <StatCard icon="⭐" label="Shortlisted"    value={stats?.shortlisted}  sub="Employers interested"  color="var(--success)" />
        <StatCard icon="✅" label="Hired"          value={stats?.hired}        sub="Successful placements" color="var(--warning)" />
        <StatCard icon="🌟" label="Your Rating"    value={stats?.rating>0?`${stats.rating}★`:'—'} sub={`${stats?.review_count||0} reviews`} color="var(--primary)" />
      </div>

      {/* Top matched jobs */}
      {jobs.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:'var(--navy)' }}>🎯 Recommended for You</div>
              <div style={{ fontSize:13, color:'var(--grey-500)', marginTop:2 }}>AI-matched based on your profile</div>
            </div>
            <Link to="/pro/jobs" className="btn btn-grey btn-sm">View All →</Link>
          </div>
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-top">
                  <div className="job-logo">🏥</div>
                  <div style={{ flex:1 }}>
                    <div className="job-title">{job.title}</div>
                    <div className="job-company">{job.owner_name}</div>
                    {job.city && <div className="job-location">📍 {job.city}</div>}
                  </div>
                </div>
                <div className="job-chips">
                  <JobTypeBadge type={job.job_type} />
                  {job.specializations?.slice(0,2).map(s => <span key={s} className="badge badge-grey">{s}</span>)}
                </div>
                <div className="job-footer">
                  <div>
                    {job.pay_min > 0 && (
                      <div className="job-pay">SAR {job.pay_min}–{job.pay_max} <span className="job-pay-type">/{job.pay_type}</span></div>
                    )}
                    {job.match_score > 0 && <div className="match-score">🎯 {job.match_score}% match</div>}
                  </div>
                  <Link to="/pro/jobs" className="btn btn-primary btn-sm">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Applications</span>
          <Link to="/pro/applications" className="btn btn-grey btn-sm">View All</Link>
        </div>
        <div style={{ padding:'0 22px' }}>
          {apps.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'var(--grey-500)' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
              <p style={{ fontSize:14 }}>No applications yet. <Link to="/pro/jobs" style={{ color:'var(--primary)', fontWeight:600 }}>Browse jobs</Link> to get started.</p>
            </div>
          ) : apps.map((app, i) => (
            <div key={app.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom: i < apps.length-1 ? '1px solid var(--grey-100)' : 'none' }}>
              <div style={{ width:42, height:42, borderRadius:10, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏥</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--navy)' }}>{app.job_title}</div>
                <div style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>
                  {app.owner_name} · {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
