import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PillToggle, Alert } from '../../components/UI.jsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SPECS = ['Clinical Pharmacy','Community Pharmacy','Compounding','Hospital Pharmacy','Oncology','Pediatrics','Geriatrics','Vaccination','Dispensing'];

export default function PostJob() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [form, setForm] = useState({
    title:'', description:'', job_type:'full-time', city:'', address:'',
    is_remote:false, pay_min:'', pay_max:'', pay_type:'hourly',
    experience_min:0, openings:1, requirements:'', specializations:[], status:'active',
  });

  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const f   = k => ({ value:form[k], onChange:e => set(k, e.target.value) });

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/jobs', { ...form, pay_min:Number(form.pay_min)||0, pay_max:Number(form.pay_max)||0, experience_min:Number(form.experience_min)||0 });
      toast.success('Job published! 🚀'); navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally { setSaving(false); }
  };

  return (
    <div className="fade-up" style={{ maxWidth:760, margin:'0 auto' }}>
      <Link to="/owner/dashboard" className="btn btn-grey btn-sm" style={{ marginBottom:20, display:'inline-flex' }}>← Back</Link>
      <div className="page-header">
        <h1>Post a New Job</h1>
        <p>Fill in the details below to attract the right candidates.</p>
      </div>

      <form onSubmit={submit}>
        {/* BASIC INFO */}
        <div className="card" style={{ marginBottom:16, padding:28 }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>📋 Job Details</h3>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" placeholder="e.g. Senior Clinical Pharmacist" {...f('title')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Type *</label>
              <select className="form-input" {...f('job_type')}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="freelance">Freelance</option>
                <option value="locum">Locum</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Openings</label>
              <input className="form-input" type="number" min={1} {...f('openings')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea className="form-input form-textarea" style={{ minHeight:120 }}
              placeholder="Describe responsibilities, expectations, work environment, and team culture..." {...f('description')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="e.g. Riyadh" {...f('city')} />
            </div>
            <div className="form-group">
              <label className="form-label">Min. Experience (years)</label>
              <input className="form-input" type="number" min={0} {...f('experience_min')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Requirements & Notes</label>
            <textarea className="form-input form-textarea" style={{ minHeight:70 }}
              placeholder="Specific license requirements, shift patterns, dress code, etc." {...f('requirements')} />
          </div>
          <label style={{ display:'flex', gap:9, alignItems:'center', cursor:'pointer', marginTop:4 }}>
            <input type="checkbox" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)} style={{ width:16, height:16 }} />
            <span style={{ fontSize:14, fontWeight:500, color:'var(--grey-700)' }}>Remote / work-from-home position</span>
          </label>
        </div>

        {/* PAY */}
        <div className="card" style={{ marginBottom:16, padding:28 }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>💰 Compensation</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pay Structure</label>
              <select className="form-input" {...f('pay_type')}>
                <option value="hourly">Hourly (SAR/hr)</option>
                <option value="monthly">Monthly (SAR/month)</option>
                <option value="fixed">Fixed Project (SAR)</option>
              </select>
            </div>
            <div></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Minimum Pay (SAR)</label>
              <input className="form-input" type="number" placeholder="100" {...f('pay_min')} />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Pay (SAR)</label>
              <input className="form-input" type="number" placeholder="200" {...f('pay_max')} />
            </div>
          </div>
        </div>

        {/* SPECIALIZATIONS */}
        <div className="card" style={{ marginBottom:24, padding:28 }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>🎯 Required Specializations</h3>
          <PillToggle options={SPECS} selected={form.specializations}
            onToggle={s => set('specializations', form.specializations.includes(s) ? form.specializations.filter(x=>x!==s) : [...form.specializations,s])} />
        </div>

        {error && <Alert type="error">{error}</Alert>}
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/owner/dashboard" className="btn btn-grey btn-lg">Cancel</Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving?'Publishing…':'🚀 Publish Job'}</button>
        </div>
      </form>
    </div>
  );
}
