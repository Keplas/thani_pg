import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner, EmptyState, StatusBadge, Stars, Avatar, Alert } from '../../components/UI.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ViewApplications() {
  const { jobId } = useParams();
  const [job,  setJob]  = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${jobId}/applications`)
      .then(r => { setJob(r.data.job); setApps(r.data.applications); })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApps(p => p.map(a => a.id === appId ? {...a, status} : a));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-up">
      <Link to="/owner/dashboard" className="btn btn-grey btn-sm" style={{ marginBottom:20, display:'inline-flex' }}>← Back</Link>
      <div className="page-header">
        <h1>{job?.title}</h1>
        <p>{apps.length} application{apps.length!==1?'s':''} received · {job?.city || 'Remote'} · {job?.job_type}</p>
      </div>

      {apps.length === 0 ? (
        <EmptyState icon="📭" title="No applications yet" message="Share your job posting to attract candidates." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {apps.map(app => (
            <div key={app.id} className="card" style={{ padding:22 }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <Avatar name={app.applicant_name} size="lg" color="var(--primary)" style={{ flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16, color:'var(--navy)' }}>{app.applicant_name}</div>
                      <div style={{ fontSize:13, color:'var(--grey-500)', marginTop:2 }}>{app.applicant_title || 'Pharmacy Professional'} {app.applicant_city ? `· ${app.applicant_city}` : ''}</div>
                      <div style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>
                        {app.years_experience > 0 && `${app.years_experience} yrs experience · `}
                        Applied {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                      {app.match_score > 0 && (
                        <div style={{ background:'var(--success-bg)', color:'var(--success)', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>
                          🎯 {app.match_score}% match
                        </div>
                      )}
                      {app.is_verified && <span className="verified">✓ Verified</span>}
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  {app.specializations?.length > 0 && (
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
                      {app.specializations.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
                    </div>
                  )}

                  {app.cover_note && (
                    <div style={{ marginTop:12, padding:'12px 16px', background:'var(--grey-50)', borderRadius:10, fontSize:14, color:'var(--grey-700)', lineHeight:1.6, fontStyle:'italic', borderLeft:'3px solid var(--grey-200)' }}>
                      "{app.cover_note}"
                    </div>
                  )}

                  {app.rating > 0 && (
                    <div style={{ marginTop:10 }}>
                      <Stars rating={app.rating} count={app.review_count} />
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--grey-500)' }}>Update status:</span>
                    {['pending','shortlisted','hired','rejected'].map(s => (
                      <button key={s} onClick={() => updateStatus(app.id, s)}
                        disabled={updating === app.id}
                        className={`btn btn-sm ${app.status===s?'btn-primary':'btn-grey'}`}>
                        {updating===app.id && app.status===s ? '…' : s.charAt(0).toUpperCase()+s.slice(1)}
                      </button>
                    ))}
                    <a href={`mailto:${app.applicant_email}`} className="btn btn-grey btn-sm" style={{ marginLeft:'auto' }}>
                      ✉️ Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
