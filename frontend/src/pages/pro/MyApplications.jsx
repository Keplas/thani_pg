import { useState, useEffect } from 'react';
import { Spinner, EmptyState, StatusBadge, JobTypeBadge } from '../../components/UI.jsx';
import api from '../../api/axios';

export default function MyApplications() {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/applications/my').then(r => setApps(r.data.applications)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tabs = ['all','pending','shortlisted','hired','rejected'];
  const displayed = filter==='all' ? apps : apps.filter(a => a.status===filter);

  return (
    <div className="fade-up">
      <div className="page-header"><h1>My Applications</h1><p>Track the status of all your job applications.</p></div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab ${filter===t?'active':''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)} ({t==='all'?apps.length:apps.filter(a=>a.status===t).length})
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : displayed.length===0 ? (
        <EmptyState icon="📭" title={`No ${filter!=='all'?filter:''} applications`} message="Applications you submit will appear here." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {displayed.map(app => (
            <div key={app.id} className="card" style={{ padding:22 }}>
              <div style={{ display:'flex', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏥</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--navy)' }}>{app.job_title || 'Job no longer available'}</div>
                      <div style={{ fontSize:13, color:'var(--grey-500)', marginTop:2 }}>{app.owner_name}</div>
                      <div style={{ fontSize:12, color:'var(--grey-500)', marginTop:2, display:'flex', gap:8 }}>
                        {app.job_city && <span>📍 {app.job_city}</span>}
                        <span>Applied {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                    {app.job_type && <JobTypeBadge type={app.job_type} />}
                    {app.pay_min > 0 && <span className="badge badge-grey">SAR {app.pay_min}–{app.pay_max}/{app.pay_type}</span>}
                  </div>
                  {app.status==='shortlisted' && (
                    <div className="alert alert-info" style={{ marginTop:12, marginBottom:0 }}>
                      🎉 You've been shortlisted! The employer may contact you for an interview.
                    </div>
                  )}
                  {app.status==='hired' && (
                    <div className="alert alert-success" style={{ marginTop:12, marginBottom:0 }}>
                      🏆 Congratulations! You've been hired for this position.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
