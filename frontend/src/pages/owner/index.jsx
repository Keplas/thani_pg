import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, Spinner, Empty } from '../../components/index.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SPECS    = ['Clinical Pharmacy','Community Pharmacy','Compounding','Hospital Pharmacy','Oncology','Pediatrics','Geriatrics','Vaccination'];
const SERVICES = ['Dispensing','Compounding','Consultation','Vaccination','Delivery','Drive-through','Home Service'];

/* ── DASHBOARD ───────────────────────────────────────────────── */
export function OwnerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my').then(r=>setJobs(r.data.jobs)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const active   = jobs.filter(j=>j.status==='active').length;
  const totalApp = jobs.reduce((s,j)=>s+(j.application_count||0),0);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="h2">Good day, {user?.name?.split(' ')[0]} 👋</div>
        <p className="text-sm text-muted mt-4">Manage your pharmacy job postings and track applicants.</p>
      </div>

      <div className="metrics-grid">
        <MetricCard icon="💼" label="Active Jobs"        value={active}      sub="Open postings"     color="blue"/>
        <MetricCard icon="📋" label="Total Applications" value={totalApp}     sub="Across all jobs"  color="mint"/>
        <MetricCard icon="📌" label="Total Postings"     value={jobs.length}  sub="Posted so far"    color="amber"/>
        <MetricCard icon="🎯" label="Platform Rate"      value="94%"          sub="Avg. hiring rate" color="purple"/>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="h4">My Job Postings</div>
            <div className="text-xs text-muted mt-4">All positions you have created</div>
          </div>
          <Link to="/owner/post-job" className="btn btn-primary btn-sm">+ Post New Job</Link>
        </div>
        <div>
          {loading ? <Spinner/> : jobs.length===0 ? (
            <Empty icon="💼" title="No jobs posted yet" desc="Post your first job to start receiving applications."
              action={<Link to="/owner/post-job" className="btn btn-primary">Post a Job</Link>}/>
          ) : jobs.map(job => (
            <div key={job.id} className="list-row">
              <div className="job-icon" style={{flexShrink:0}}>💊</div>
              <div style={{flex:1}}>
                <div className="font-semibold" style={{fontSize:14,color:'var(--navy)'}}>{job.title}</div>
                <div className="flex gap-8 mt-4 flex-wrap items-center">
                  <span className={`chip chip-${job.job_type==='full-time'?'blue':job.job_type==='locum'?'amber':'grey'}`}>{job.job_type}</span>
                  <span className="text-xs text-muted">{job.application_count||0} applications</span>
                  {job.city&&<span className="text-xs text-muted">📍 {job.city}</span>}
                  <span className="text-xs text-muted">Created {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`chip status-${job.status}`}>{job.status}</span>
              <Link to={`/owner/jobs/${job.id}/applications`}
                className="btn btn-sm" style={{background:'var(--sky)',color:'var(--blue)',marginLeft:8}}>
                View Apps ({job.application_count||0})
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── POST JOB ────────────────────────────────────────────────── */
export function PostJob() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [specs, setSpecs] = useState([]);
  const [f, setF] = useState({
    title:'',description:'',job_type:'full-time',city:'',address:'',
    is_remote:false,pay_min:'',pay_max:'',pay_type:'hourly',
    experience_min:0,openings:1,requirements:'',status:'active',
  });

  const toggleSpec = s => setSpecs(p => p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/jobs', {...f, specializations:specs,
        pay_min:Number(f.pay_min)||0, pay_max:Number(f.pay_max)||0,
        experience_min:Number(f.experience_min)||0});
      toast.success('Job posted successfully! 🚀');
      nav('/owner/dashboard');
    } catch (err) { toast.error(err.response?.data?.message||'Failed to post job'); }
    finally { setSaving(false); }
  };

  const inp = field => ({ value:f[field], onChange:e=>setF({...f,[field]:e.target.value}) });

  return (
    <div className="fade-up">
      <button className="back-btn" onClick={() => nav('/owner/dashboard')}>← Back to Dashboard</button>
      <div className="page-header">
        <div className="h2">Post a New Job</div>
        <p className="text-sm text-muted mt-4">Complete all sections to attract the best candidates.</p>
      </div>

      <form onSubmit={submit} style={{maxWidth:720}}>
        <div className="card mb-16">
          <div className="card-header"><div className="h4">Job Details</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className="form-input" placeholder="e.g. Weekend Locum Pharmacist" {...inp('title')} required/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select className="form-input" {...inp('job_type')}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="locum">Locum</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Openings</label>
                <input className="form-input" type="number" min={1} {...inp('openings')}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea className="form-input" rows={4} required
                placeholder="Describe the role, responsibilities and expectations..."
                {...inp('description')}/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Riyadh" {...inp('city')}/>
              </div>
              <div className="form-group">
                <label className="form-label">Min. Experience (years)</label>
                <input className="form-input" type="number" min={0} {...inp('experience_min')}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Requirements & Notes</label>
              <textarea className="form-input" rows={2}
                placeholder="License requirements, shift times, special skills..."
                {...inp('requirements')}/>
            </div>
            <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer',fontSize:14,fontWeight:500,color:'var(--g600)'}}>
              <input type="checkbox" checked={f.is_remote} onChange={e=>setF({...f,is_remote:e.target.checked})}/>
              Remote position
            </label>
          </div>
        </div>

        <div className="card mb-16">
          <div className="card-header"><div className="h4">Compensation</div></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pay Type</label>
                <select className="form-input" {...inp('pay_type')}>
                  <option value="hourly">Hourly (SAR/hr)</option>
                  <option value="monthly">Monthly (SAR/month)</option>
                  <option value="fixed">Fixed Price (SAR)</option>
                </select>
              </div>
              <div/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Pay (SAR)</label>
                <input className="form-input" type="number" placeholder="100" {...inp('pay_min')}/>
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Pay (SAR)</label>
                <input className="form-input" type="number" placeholder="200" {...inp('pay_max')}/>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header"><div className="h4">Required Specializations</div></div>
          <div className="card-body">
            <div className="pill-group">
              {SPECS.map(s => (
                <button key={s} type="button"
                  className={`pill ${specs.includes(s)?'active-blue':''}`}
                  onClick={()=>toggleSpec(s)}>
                  {specs.includes(s)?'✓ ':''}{s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          <button type="button" className="btn btn-outline" onClick={()=>nav('/owner/dashboard')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving?'Posting…':'🚀 Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── VIEW APPLICATIONS ──────────────────────────────────────── */
const S_CHIP = {pending:'chip-amber',shortlisted:'chip-blue',hired:'chip-mint',rejected:'chip-red'};
const S_ICON = {pending:'🕐',shortlisted:'⭐',hired:'✅',rejected:'✗'};

export function ViewApplications() {
  const { jobId } = useParams();
  const [data, setData] = useState({job:null,applications:[]});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/jobs/${jobId}/applications`)])
      .then(([j,a]) => setData({job:j.data.job, applications:a.data.applications}))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, {status});
      setData(p => ({...p, applications:p.applications.map(a=>a.id===appId?{...a,status}:a)}));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="fade-up">
      <Link to="/owner/dashboard" className="back-btn">← Back to Dashboard</Link>
      <div className="page-header">
        <div className="h2">{data.job?.title || 'Applications'}</div>
        <p className="text-sm text-muted mt-4">{data.applications.length} application{data.applications.length!==1?'s':''} received</p>
      </div>

      {loading ? <Spinner/> : data.applications.length===0 ? (
        <Empty icon="📭" title="No applications yet" desc="Applications will appear here as professionals apply."/>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {data.applications.map(app => (
            <div key={app.id} className="card" style={{padding:20}}>
              <div className="flex gap-14">
                <div className="avatar" style={{width:52,height:52,fontSize:20,flexShrink:0,
                  background:app.applicant_rating>4?'var(--mint)':'var(--blue)'}}>
                  {app.applicant_name?.charAt(0)||'?'}
                </div>
                <div style={{flex:1}}>
                  <div className="flex justify-between flex-wrap gap-8">
                    <div>
                      <div className="h4">{app.applicant_name}</div>
                      <div className="text-sm text-muted">{app.applicant_email}</div>
                      {app.applicant_title && <div className="text-xs text-muted mt-4">{app.applicant_title} · {app.years_experience} yrs exp</div>}
                      <div className="text-xs text-muted mt-4">
                        Applied {new Date(app.applied_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      {app.match_score>0 && <div className="match-pill">🎯 {app.match_score}% match</div>}
                      {app.applicant_rating>0 && (
                        <div className="text-xs"><span className="stars">{'★'.repeat(Math.round(app.applicant_rating))}</span> {app.applicant_rating}</div>
                      )}
                      <span className={`chip ${S_CHIP[app.status]}`}>{S_ICON[app.status]} {app.status}</span>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div style={{marginTop:10,padding:'10px 14px',background:'var(--g50)',borderRadius:9,
                      fontSize:14,color:'var(--g500)',fontStyle:'italic',lineHeight:1.5}}>
                      "{app.cover_note}"
                    </div>
                  )}

                  <div className="flex gap-8 mt-12 flex-wrap">
                    <span className="text-xs text-muted" style={{alignSelf:'center',fontWeight:600}}>Update status:</span>
                    {['pending','shortlisted','hired','rejected'].map(s => (
                      <button key={s} onClick={()=>updateStatus(app.id,s)}
                        className={`btn btn-sm ${app.status===s?'btn-primary':'btn-light'}`}>
                        {s.charAt(0).toUpperCase()+s.slice(1)}
                      </button>
                    ))}
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

/* ── FIND TALENT ────────────────────────────────────────────── */
export function FindTalent() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filt, setFilt] = useState({city:'',specialization:'',work_type:'',available:false});

  const search = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filt.city)           p.append('city', filt.city);
      if (filt.specialization) p.append('specialization', filt.specialization);
      if (filt.work_type)      p.append('work_type', filt.work_type);
      if (filt.available)      p.append('available', 'true');
      const r = await api.get(`/profiles/professionals?${p}`);
      setProfiles(r.data.profiles);
    } catch { toast.error('Failed to search'); }
    finally { setLoading(false); }
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="h2">Find Talent</div>
        <p className="text-sm text-muted mt-4">Search verified pharmacy professionals.</p>
      </div>

      <form onSubmit={e=>{e.preventDefault();search();}} className="toolbar">
        <input className="filter-sel" style={{minWidth:140}} placeholder="City..."
          value={filt.city} onChange={e=>setFilt({...filt,city:e.target.value})}/>
        <select className="filter-sel" value={filt.specialization} onChange={e=>setFilt({...filt,specialization:e.target.value})}>
          <option value="">All Specializations</option>
          {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-sel" value={filt.work_type} onChange={e=>setFilt({...filt,work_type:e.target.value})}>
          <option value="">All Work Types</option>
          {['full-time','part-time','freelance','locum'].map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <label style={{display:'flex',gap:6,alignItems:'center',fontSize:14,fontWeight:500,color:'var(--g600)',cursor:'pointer',whiteSpace:'nowrap'}}>
          <input type="checkbox" checked={filt.available} onChange={e=>setFilt({...filt,available:e.target.checked})}/>
          Available now
        </label>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? <Spinner/> : profiles.length===0 ? (
        <Empty icon="🔍" title="No professionals found" desc="Try adjusting your search filters."/>
      ) : (
        <div className="grid-auto">
          {profiles.map(p => (
            <div key={p.id} className="job-card">
              <div className="flex gap-12 mb-12">
                <div className="avatar" style={{width:54,height:54,fontSize:22,flexShrink:0,
                  background:p.is_verified?'var(--mint)':'var(--blue)'}}>{p.name?.charAt(0)||'?'}</div>
                <div>
                  <div className="h4">{p.name}</div>
                  <div className="text-sm text-muted">{p.title}</div>
                  {p.city&&<div style={{fontSize:12,color:'var(--g400)',marginTop:2}}>📍 {p.city}</div>}
                </div>
              </div>
              <div className="flex gap-6 flex-wrap mb-10">
                {p.is_verified&&<span className="verified">✓ Verified</span>}
                {p.specializations?.slice(0,2).map(s=><span key={s} className="chip chip-blue">{s}</span>)}
                <span className="chip chip-grey">{p.years_experience} yrs exp</span>
                {p.is_available&&<span className="chip chip-mint">🟢 Available</span>}
              </div>
              {p.rating>0&&(
                <div style={{fontSize:13,marginBottom:10}}>
                  <span className="stars">{'★'.repeat(Math.round(p.rating))}</span>
                  <span className="text-muted" style={{marginLeft:6}}>{p.rating} ({p.review_count} reviews)</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                {p.hourly_rate_min>0&&(
                  <div className="pay-text">SAR {p.hourly_rate_min}–{p.hourly_rate_max}<span className="pay-unit">/hr</span></div>
                )}
                <a href={`mailto:${p.email}`} className="btn btn-primary btn-sm">Contact</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── OWNER PROFILE ──────────────────────────────────────────── */
export function OwnerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      <div className="page-header"><div className="h2">My Pharmacy Profile</div></div>
      <div style={{maxWidth:720,marginBottom:24}}>
        <div className="profile-banner"/>
        <div className="profile-card">
          <div className="avatar avatar-lg" style={{background:'var(--blue)',fontSize:28}}>🏪</div>
          <div className="h3">{profile?.business_name||user?.name}</div>
          <div className="text-sm text-muted mt-4">Pharmacy · {profile?.city||'Location not set'} · {profile?.country}</div>
          <div className="flex gap-8 mt-12 flex-wrap">
            {profile?.is_verified&&<span className="verified">✓ Verified Pharmacy</span>}
            {profile?.rating>0&&<span className="stars text-sm">{'★'.repeat(Math.round(profile.rating))} {profile.rating} ({profile.review_count} reviews)</span>}
          </div>
        </div>
      </div>

      <form onSubmit={save} style={{maxWidth:720}}>
        <div className="card mb-16">
          <div className="card-header"><div className="h4">Pharmacy Information</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={profile?.business_name||''} onChange={e=>upd('business_name',e.target.value)}/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-input" placeholder="PH-XXXX-XXXX" value={profile?.license_number||''} onChange={e=>upd('license_number',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Riyadh" value={profile?.city||''} onChange={e=>upd('city',e.target.value)}/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+966 11 XXX XXXX" value={profile?.phone||''} onChange={e=>upd('phone',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" placeholder="https://yourpharmacy.com" value={profile?.website||''} onChange={e=>upd('website',e.target.value)}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Street address" value={profile?.address||''} onChange={e=>upd('address',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">About Your Pharmacy</label>
              <textarea className="form-input" rows={3} placeholder="Brief description of your pharmacy..." value={profile?.about||''} onChange={e=>upd('about',e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header"><div className="h4">Services Offered</div></div>
          <div className="card-body">
            <div className="pill-group">
              {SERVICES.map(s => (
                <button key={s} type="button"
                  className={`pill ${(profile?.services||[]).includes(s)?'active-blue':''}`}
                  onClick={()=>toggleArr('services',s)}>
                  {(profile?.services||[]).includes(s)?'✓ ':''}{s}
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
