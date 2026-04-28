import { useState, useEffect } from 'react';
import { Spinner, EmptyState, JobTypeBadge } from '../../components/UI.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function JobSearch() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(new Set());
  const [applying,setApplying]= useState(null);
  const [note,    setNote]    = useState({});
  const [showNote,setShowNote]= useState(null);
  const [filters, setFilters] = useState({ search:'', job_type:'', city:'' });

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.search)   p.append('search', filters.search);
      if (filters.job_type) p.append('job_type', filters.job_type);
      if (filters.city)     p.append('city', filters.city);
      const r = await api.get(`/jobs?${p}`);
      setJobs(r.data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const apply = async (jobId, matchScore) => {
    setApplying(jobId);
    try {
      await api.post(`/applications/${jobId}`, { cover_note: note[jobId]||'', match_score: matchScore||0 });
      setApplied(p => new Set([...p, jobId]));
      setShowNote(null);
      toast.success('Application submitted! ✅');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed';
      if (msg.includes('Already')) { setApplied(p => new Set([...p, jobId])); }
      else toast.error(msg);
    } finally { setApplying(null); }
  };

  return (
    <div className="fade-up">
      <div className="page-header"><h1>Find Jobs</h1><p>Browse pharmacy job postings matched to your profile.</p></div>

      <form onSubmit={e => { e.preventDefault(); load(); }} className="toolbar">
        <div className="search-input-wrap">
          🔍 <input type="text" placeholder="Search by title, keyword..." value={filters.search} onChange={e => setFilters({...filters,search:e.target.value})} />
        </div>
        <select className="filter-select" value={filters.job_type} onChange={e => setFilters({...filters,job_type:e.target.value})}>
          <option value="">All Types</option>
          {['full-time','part-time','freelance','locum'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="filter-select" placeholder="City..." style={{ minWidth:120 }} value={filters.city} onChange={e => setFilters({...filters,city:e.target.value})} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? <Spinner /> : jobs.length===0 ? (
        <EmptyState icon="🔍" title="No jobs found" message="Try different search terms or filters." />
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-card-top">
                <div className="job-logo">🏥</div>
                <div style={{ flex:1 }}>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.owner_name}</div>
                  {job.city && <div className="job-location">📍 {job.city}{job.is_remote ? ' · Remote' : ''}</div>}
                </div>
              </div>

              <p className="job-desc">{job.description}</p>

              <div className="job-chips">
                <JobTypeBadge type={job.job_type} />
                {job.specializations?.slice(0,2).map(s => <span key={s} className="badge badge-grey">{s}</span>)}
                {job.experience_min > 0 && <span className="badge badge-grey">{job.experience_min}+ yrs</span>}
              </div>

              {showNote === job.id && (
                <textarea className="form-input form-textarea" style={{ minHeight:70, fontSize:13 }}
                  placeholder="Add a short cover note (optional)..."
                  value={note[job.id]||''} onChange={e => setNote({...note,[job.id]:e.target.value})} />
              )}

              <div className="job-footer">
                <div>
                  {job.pay_min > 0 ? (
                    <div className="job-pay">SAR {job.pay_min}–{job.pay_max}<span className="job-pay-type"> /{job.pay_type}</span></div>
                  ) : <span className="badge badge-grey">Pay negotiable</span>}
                  {job.match_score > 0 && <div className="match-score">🎯 {job.match_score}% match</div>}
                </div>
                <div style={{ display:'flex', gap:7 }}>
                  <button className="btn btn-grey btn-sm" title="Add cover note" onClick={() => setShowNote(showNote===job.id?null:job.id)}>✏️</button>
                  <button className={`btn btn-sm ${applied.has(job.id)?'btn-success':'btn-primary'}`}
                    disabled={applied.has(job.id)||applying===job.id}
                    onClick={() => apply(job.id, job.match_score)}>
                    {applying===job.id ? '…' : applied.has(job.id) ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
