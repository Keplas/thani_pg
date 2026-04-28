import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, EmptyState, StatusBadge, JobTypeBadge } from '../../components/UI.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AllJobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my').then(r => setJobs(r.data.jobs)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const closeJob = async id => {
    try { await api.put(`/jobs/${id}`, { status:'closed' }); setJobs(p => p.map(j => j.id===id?{...j,status:'closed'}:j)); toast.success('Job closed'); }
    catch { toast.error('Failed to close job'); }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>All My Jobs</h1><p>Manage all your pharmacy job postings.</p></div>
          <Link to="/owner/post-job" className="btn btn-primary">+ Post New Job</Link>
        </div>
      </div>
      {loading ? <Spinner /> : jobs.length===0 ? (
        <EmptyState icon="💼" title="No jobs yet" message="Post your first job to start hiring."
          action={<Link to="/owner/post-job" className="btn btn-primary">Post a Job</Link>} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:46, height:46, borderRadius:10, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💊</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--navy)' }}>{job.title}</div>
                      <div style={{ display:'flex', gap:8, marginTop:5, flexWrap:'wrap', alignItems:'center' }}>
                        <JobTypeBadge type={job.job_type} />
                        <StatusBadge status={job.status} />
                        {job.city && <span style={{ fontSize:12, color:'var(--grey-500)' }}>📍 {job.city}</span>}
                        {job.pay_min > 0 && <span style={{ fontSize:12, color:'var(--grey-500)' }}>SAR {job.pay_min}–{job.pay_max}/{job.pay_type}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <Link to={`/owner/jobs/${job.id}/applications`} className="btn btn-grey btn-sm">
                        📋 {job.application_count} Apps
                      </Link>
                      {job.status === 'active' && (
                        <button className="btn btn-danger btn-sm" onClick={() => closeJob(job.id)}>Close</button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'var(--grey-500)', marginTop:8, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{job.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
