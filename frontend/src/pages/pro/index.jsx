import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, JobCard, Spinner, Empty } from '../../components/index.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SPECS     = ['Clinical Pharmacy','Community Pharmacy','Compounding','Hospital Pharmacy','Oncology','Pediatrics','Geriatrics','Vaccination'];
const WORKTYPES = ['full-time','part-time','freelance','locum'];

/* ── APPLY BUTTON ────────────────────────────────────────────── */
function ApplyBtn({ jobId, matchScore }) {
  const [st, setSt] = useState('idle');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const apply = async () => {
    setSt('loading');
    try {
      await api.post(`/applications/job/${jobId}`, {cover_note:note, match_score:matchScore||0});
      setSt('done');
      toast.success('Application submitted! ✅');
    } catch (err) {
      const msg = err.response?.data?.message||'Failed';
      if (msg.includes('Already')||msg.includes('already')) setSt('done');
      else { setSt('idle'); toast.error(msg); }
    }
  };

  if (st==='done') return <button className="btn btn-mint btn-sm" disabled>✓ Applied</button>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
      {showNote && (
        <input className="form-input" style={{fontSize:12,padding:'6px 10px',borderRadius:8,width:190}}
          placeholder="Add a cover note..." value={note} onChange={e=>setNote(e.target.value)}/>
      )}
      <div className="flex gap-6">
        <button className="btn btn-light btn-sm btn-icon" onClick={()=>setShowNote(s=>!s)} title="Add note">✏️</button>
        <button className="btn btn-primary btn-sm" disabled={st==='loading'} onClick={apply}>
          {st==='loading'?'…':'Apply'}
        </button>
      </div>
    </div>
  );
}

/* ── PRO DASHBOARD ───────────────────────────────────────────── */
export function ProDashboard() {
  const { user } = useAuth();
  const [apps, setApps]   = useState([]);
  const [jobs, setJobs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/applications/my'), api.get('/jobs')])
      .then(([a,j]) => {
        setApps(a.data.applications);
        const sorted = [...(j.data.jobs||[])].sort((a,b)=>(b.match_score||0)-(a.match_score||0));
        setJobs(sorted.slice(0,4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const shortlisted = apps.filter(a=>a.status==='shortlisted').length;
  const pending     = apps.filter(a=>a.status==='pending').length;
  const hired       = apps.filter(a=>a.status==='hired').length;

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="h2">Hello, {user?.name?.split(' ')[0]} 👋</div>
        <p className="text-sm text-muted mt-4">Your activity summary and top-matched job opportunities.</p>
      </div>

      <div className="metrics-grid">
        <MetricCard icon="📋" label="Applications"  value={apps.length}  sub="Total submitted"      color="blue"/>
        <MetricCard icon="⭐" label="Shortlisted"   value={shortlisted}  sub="Employers interested" color="mint"/>
        <MetricCard icon="🕐" label="Pending"       value={pending}      sub="Under review"         color="amber"/>
        <MetricCard icon="🏆" label="Hired"         value={hired}        sub="Positions secured"    color="purple"/>
      </div>

      <div className="section-header mb-16">
        <div>
          <div className="section-title">Recommended for You</div>
          <div className="section-sub">AI-matched based on your profile</div>
        </div>
        <Link to="/pro/jobs" className="btn btn-primary btn-sm">View All Jobs →</Link>
      </div>

      {loading ? <Spinner/> : (
        <div className="grid-auto mb-24">
          {jobs.length===0
            ? <Empty icon="💼" title="No jobs yet" desc="Complete your profile to get matched."/>
            : jobs.map(job => (
                <JobCard key={job.id} job={job}
                  footer={<ApplyBtn jobId={job.id} matchScore={job.match_score}/>}/>
              ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="h4">Recent Applications</div>
            <div className="text-xs text-muted mt-4">Your latest {Math.min(apps.length,5)} submissions</div>
          </div>
          <Link to="/pro/applications" className="btn btn-sm" style={{background:'var(--sky)',color:'var(--blue)'}}>
            View All ({apps.length})
          </Link>
        </div>
        <div>
          {apps.length===0 ? (
            <Empty icon="📭" title="No applications yet" desc="Browse jobs and start applying."/>
          ) : apps.slice(0,5).map(app => (
            <div key={app.id} className="list-row">
              <div className="job-icon" style={{flexShrink:0}}>🏥</div>
              <div style={{flex:1}}>
                <div className="font-semibold" style={{fontSize:14,color:'var(--navy)'}}>{app.job_title}</div>
                <div className="text-xs text-muted mt-4">
                  {app.owner_name} · {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                </div>
              </div>
              <span className={`chip status-${app.status}`}>{app.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── JOB SEARCH ──────────────────────────────────────────────── */
export function JobSearch() {
  const [jobs, setJobs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filt, setFilt]   = useState({search:'',job_type:'',city:''});

  const fetch = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filt.search)   p.append('search', filt.search);
      if (filt.job_type) p.append('job_type', filt.job_type);
      if (filt.city)     p.append('city', filt.city);
      const r = await api.get(`/jobs?${p}`);
      setJobs(r.data.jobs||[]);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="h2">Find Jobs</div>
        <p className="text-sm text-muted mt-4">Browse and apply to pharmacy job postings near you.</p>
      </div>

      <form onSubmit={e=>{e.preventDefault();fetch();}} className="toolbar">
        <div className="searchbox">
          🔍
          <input type="text" placeholder="Search by title or keyword..."
            value={filt.search} onChange={e=>setFilt({...filt,search:e.target.value})}/>
        </div>
        <select className="filter-sel" value={filt.job_type} onChange={e=>setFilt({...filt,job_type:e.target.value})}>
          <option value="">All Job Types</option>
          {['full-time','part-time','freelance','locum'].map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <input className="filter-sel" placeholder="City..." style={{minWidth:120}}
          value={filt.city} onChange={e=>setFilt({...filt,city:e.target.value})}/>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? <Spinner/> : jobs.length===0 ? (
        <Empty icon="🔍" title="No jobs found" desc="Try different search terms or filters."/>
      ) : (
        <div className="grid-auto">
          {jobs.map(job => (
            <JobCard key={job.id} job={job}
              footer={<ApplyBtn jobId={job.id} matchScore={job.match_score}/>}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MY APPLICATIONS ─────────────────────────────────────────── */
export function MyApplications() {
  const [apps, setApps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState('all');

  const STATUS_ICON = {pending:'🕐',shortlisted:'⭐',hired:'✅',rejected:'✗'};

  useEffect(() => {
    api.get('/applications/my').then(r=>setApps(r.data.applications)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const displayed = tab==='all' ? apps : apps.filter(a=>a.status===tab);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="h2">My Applications</div>
        <p className="text-sm text-muted mt-4">Track the status of all your job applications.</p>
      </div>

      <div className="tabs">
        {['all','pending','shortlisted','hired','rejected'].map(s => (
          <button key={s} className={`tab-btn ${tab===s?'active':''}`} onClick={()=>setTab(s)}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({s==='all'?apps.length:apps.filter(a=>a.status===s).length})
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : displayed.length===0 ? (
        <Empty icon="📭" title={`No ${tab!=='all'?tab+' ':''} applications`}
          desc={tab==='all'?'Apply to jobs to see them here.':'Nothing in this category.'}/>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {displayed.map(app => (
            <div key={app.id} className="card" style={{padding:20}}>
              <div className="flex gap-14">
                <div className="job-icon" style={{flexShrink:0}}>🏥</div>
                <div style={{flex:1}}>
                  <div className="flex justify-between flex-wrap gap-8">
                    <div>
                      <div className="h4">{app.job_title||'Job no longer available'}</div>
                      <div className="text-sm text-muted">{app.owner_name}</div>
                      <div className="text-xs text-muted mt-4">
                        {app.job_city&&`📍 ${app.job_city} · `}
                        Applied {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                      </div>
                    </div>
                    <span className={`chip status-${app.status}`} style={{height:'fit-content'}}>
                      {STATUS_ICON[app.status]} {app.status.charAt(0).toUpperCase()+app.status.slice(1)}
                    </span>
                  </div>

                  {app.status==='shortlisted' && (
                    <div className="alert alert-info mt-12" style={{marginBottom:0}}>
                      🎉 You've been shortlisted! The employer may contact you for an interview.
                    </div>
                  )}
                  {app.status==='hired' && (
                    <div className="alert alert-success mt-12" style={{marginBottom:0}}>
                      🏆 Congratulations! You were hired for this position.
                    </div>
                  )}

                  <div className="flex gap-6 mt-10 flex-wrap">
                    {app.pay_min>0&&<span className="chip chip-grey">SAR {app.pay_min}–{app.pay_max}/{app.pay_type}</span>}
                    {app.job_type&&<span className={`chip chip-${app.job_type==='full-time'?'blue':'amber'}`}>{app.job_type}</span>}
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

/* ── PRO PROFILE ─────────────────────────────────────────────── */
export function ProProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.get('/profiles/me').then(r=>setProfile(r.data.profile)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  }, []);

  const upd = (k,v) => setProfile(p=>({...p,[k]:v}));
  const toggleArr = (k,v) => { const a=profile[k]||[]; upd(k,a.includes(v)?a.filter(x=>x!==v):[...a,v]); };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try { await api.put('/profiles/me',profile); toast.success('Profile saved! ✅'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner/>;

  return (
    <div className="fade-up">
      <div className="page-header"><div className="h2">My Profile</div>
        <p className="text-sm text-muted mt-4">A complete profile gets 3× more interview requests.</p>
      </div>

      <div style={{maxWidth:720,marginBottom:24}}>
        <div className="profile-banner"/>
        <div className="profile-card">
          <div className="avatar avatar-lg" style={{background:'var(--mint)'}}>{user?.name?.charAt(0)||'?'}</div>
          <div className="h3">{user?.name}</div>
          <div className="text-sm text-muted mt-4">{profile?.title||'Pharmacy Professional'} · {profile?.city||'Location not set'}</div>
          <div className="flex gap-8 mt-12 flex-wrap">
            {profile?.is_verified&&<span className="verified">✓ License Verified</span>}
            {profile?.is_available&&<span className="chip chip-mint">🟢 Available</span>}
            {profile?.rating>0&&<div className="text-sm"><span className="stars">{'★'.repeat(Math.round(profile.rating))}</span> {profile.rating} ({profile.review_count} reviews)</div>}
          </div>
        </div>
      </div>

      <form onSubmit={save} style={{maxWidth:720}}>
        <div className="card mb-16">
          <div className="card-header"><div className="h4">Professional Information</div></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input className="form-input" placeholder="e.g. Clinical Pharmacist"
                  value={profile?.title||''} onChange={e=>upd('title',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min={0}
                  value={profile?.years_experience||0} onChange={e=>upd('years_experience',Number(e.target.value))}/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-input" placeholder="Your pharmacy license #"
                  value={profile?.license_number||''} onChange={e=>upd('license_number',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Riyadh"
                  value={profile?.city||''} onChange={e=>upd('city',e.target.value)}/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Hourly Rate (SAR)</label>
                <input className="form-input" type="number"
                  value={profile?.hourly_rate_min||''} onChange={e=>upd('hourly_rate_min',Number(e.target.value))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Max Hourly Rate (SAR)</label>
                <input className="form-input" type="number"
                  value={profile?.hourly_rate_max||''} onChange={e=>upd('hourly_rate_max',Number(e.target.value))}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea className="form-input" rows={3} placeholder="Brief professional summary..."
                value={profile?.bio||''} onChange={e=>upd('bio',e.target.value)}/>
            </div>
            <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer',fontSize:14,fontWeight:500,color:'var(--g600)'}}>
              <input type="checkbox" checked={profile?.is_available||false}
                onChange={e=>upd('is_available',e.target.checked)}/>
              Currently available for work
            </label>
          </div>
        </div>

        <div className="card mb-16">
          <div className="card-header"><div className="h4">Specializations</div></div>
          <div className="card-body">
            <div className="pill-group">
              {SPECS.map(s => (
                <button key={s} type="button"
                  className={`pill ${(profile?.specializations||[]).includes(s)?'active-blue':''}`}
                  onClick={()=>toggleArr('specializations',s)}>
                  {(profile?.specializations||[]).includes(s)?'✓ ':''}{s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header"><div className="h4">Available Work Types</div></div>
          <div className="card-body">
            <div className="pill-group">
              {WORKTYPES.map(w => (
                <button key={w} type="button"
                  className={`pill ${(profile?.work_types||[]).includes(w)?'active-mint':''}`}
                  onClick={()=>toggleArr('work_types',w)}>
                  {(profile?.work_types||[]).includes(w)?'✓ ':''}{w}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving?'Saving…':'💾 Save Profile'}
        </button>
      </form>
    </div>
  );
}
