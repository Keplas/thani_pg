import { useState, useEffect } from 'react';
import { Spinner, EmptyState, Stars, Avatar } from '../../components/UI.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SPECS = ['Clinical Pharmacy','Community Pharmacy','Compounding','Hospital Pharmacy','Oncology','Pediatrics','Geriatrics','Vaccination'];

export default function FindTalent() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ city:'', specialization:'', work_type:'', available:false });

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.city)           p.append('city', filters.city);
      if (filters.specialization) p.append('specialization', filters.specialization);
      if (filters.work_type)      p.append('work_type', filters.work_type);
      if (filters.available)      p.append('available', '1');
      const r = await api.get(`/profiles/professionals?${p}`);
      setProfiles(r.data.profiles);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Find Talent</h1>
        <p>Search verified pharmacy professionals by skill, location, and availability.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); load(); }} className="toolbar">
        <input className="filter-select" placeholder="City..." style={{ minWidth:130 }}
          value={filters.city} onChange={e => setFilters({...filters,city:e.target.value})} />
        <select className="filter-select" value={filters.specialization} onChange={e => setFilters({...filters,specialization:e.target.value})}>
          <option value="">All Specializations</option>
          {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.work_type} onChange={e => setFilters({...filters,work_type:e.target.value})}>
          <option value="">All Work Types</option>
          {['full-time','part-time','freelance','locum'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label style={{ display:'flex', gap:7, alignItems:'center', cursor:'pointer', fontSize:14, fontWeight:500, color:'var(--grey-700)', background:'var(--white)', border:'1.5px solid var(--grey-200)', borderRadius:'var(--radius)', padding:'10px 14px' }}>
          <input type="checkbox" checked={filters.available} onChange={e => setFilters({...filters,available:e.target.checked})} />
          Available now
        </label>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? <Spinner /> : profiles.length === 0 ? (
        <EmptyState icon="🔍" title="No professionals found" message="Try adjusting your filters to find more candidates." />
      ) : (
        <div className="jobs-grid">
          {profiles.map(p => (
            <div key={p.id} className="card card-hover" style={{ padding:22 }}>
              <div style={{ display:'flex', gap:12, marginBottom:14 }}>
                <Avatar name={p.name} size="lg" color="var(--success)" style={{ flexShrink:0 }} />
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:'var(--navy)' }}>{p.name}</div>
                  <div style={{ fontSize:13, color:'var(--grey-500)' }}>{p.title || 'Pharmacy Professional'}</div>
                  {p.city && <div style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>📍 {p.city}, {p.country}</div>}
                </div>
              </div>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {p.is_verified && <span className="verified">✓ Verified</span>}
                {p.is_available && <span className="badge badge-success">🟢 Available</span>}
                {p.years_experience > 0 && <span className="badge badge-grey">{p.years_experience} yrs exp</span>}
                {p.specializations?.slice(0,2).map(s => <span key={s} className="badge badge-primary">{s}</span>)}
              </div>

              {p.rating > 0 && <div style={{ marginBottom:10 }}><Stars rating={p.rating} count={p.review_count} /></div>}

              {p.bio && <p style={{ fontSize:13, color:'var(--grey-500)', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.bio}</p>}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                {p.hourly_rate_min > 0 ? (
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--navy)' }}>
                    SAR {p.hourly_rate_min}–{p.hourly_rate_max}
                    <span style={{ fontWeight:400, fontSize:11, color:'var(--grey-500)' }}>/hr</span>
                  </div>
                ) : <div />}
                <a href={`mailto:${p.email}`} className="btn btn-primary btn-sm">✉️ Contact</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
