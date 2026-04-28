import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Spinner, PillToggle, Alert, Stars } from '../components/UI.jsx';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SPECS     = ['Clinical Pharmacy','Community Pharmacy','Compounding','Hospital Pharmacy','Oncology','Pediatrics','Geriatrics','Vaccination','Dispensing'];
const SERVICES  = ['Dispensing','Compounding','Consultation','Vaccination','Delivery','Drive-through','Home Care'];
const WORKTYPES = ['full-time','part-time','freelance','locum'];

export default function Profile() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/profiles/me').then(r => setProfile(r.data.profile)).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setProfile(p => ({...p, [k]:v}));
  const toggle = (field, val) => {
    const arr = profile[field] || [];
    upd(field, arr.includes(val) ? arr.filter(x => x!==val) : [...arr, val]);
  };

  const save = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try { await api.put('/profiles/me', profile); toast.success('Profile saved! ✅'); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-up" style={{ maxWidth:760, margin:'0 auto' }}>
      {/* Profile Header */}
      <div style={{ marginBottom:24 }}>
        <div className="profile-banner" />
        <div className="profile-body">
          <div style={{ display:'flex', alignItems:'flex-end', gap:14, marginTop:-40, marginBottom:14 }}>
            <div className="avatar avatar-xl" style={{ background: isOwner?'var(--primary)':'var(--success)', fontSize:28 }}>
              {isOwner ? '🏪' : (user?.name?.charAt(0)||'?')}
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontWeight:800, fontSize:22, color:'var(--navy)' }}>{profile?.business_name || profile?.name || user?.name}</div>
              <div style={{ fontSize:14, color:'var(--grey-500)', marginTop:3 }}>
                {isOwner ? `Pharmacy · ${profile?.city||'Location not set'}` : `${profile?.title||'Professional'} · ${profile?.city||'Location not set'}`}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap', alignItems:'center' }}>
                {profile?.is_verified && <span className="verified">✓ Verified</span>}
                {!isOwner && profile?.is_available && <span className="badge badge-success">🟢 Available</span>}
                {profile?.rating > 0 && <Stars rating={profile.rating} count={profile.review_count} />}
              </div>
            </div>
          </div>
          <div style={{ fontSize:13, color:'var(--grey-500)', paddingTop:12, borderTop:'1px solid var(--grey-100)' }}>
            {user?.email} · Member since {new Date(profile?.created_at).toLocaleDateString('en-GB',{month:'long',year:'numeric'})}
          </div>
        </div>
      </div>

      <form onSubmit={save}>
        {isOwner ? (
          <>
            <div className="card" style={{ padding:28, marginBottom:16 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:18, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>🏪 Pharmacy Information</h3>
              <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" value={profile?.business_name||''} onChange={e => upd('business_name',e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">License Number</label><input className="form-input" placeholder="PH-XXXX-XXXX" value={profile?.license_number||''} onChange={e => upd('license_number',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="e.g. Riyadh" value={profile?.city||''} onChange={e => upd('city',e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="Full street address" value={profile?.address||''} onChange={e => upd('address',e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+966 11 XXX XXXX" value={profile?.phone||''} onChange={e => upd('phone',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Website</label><input className="form-input" placeholder="https://..." value={profile?.website||''} onChange={e => upd('website',e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">About Your Pharmacy</label><textarea className="form-input form-textarea" placeholder="Brief description of your pharmacy..." value={profile?.about||''} onChange={e => upd('about',e.target.value)} /></div>
            </div>
            <div className="card" style={{ padding:28, marginBottom:24 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>⚕️ Services Offered</h3>
              <PillToggle options={SERVICES} selected={profile?.services||[]} onToggle={v => toggle('services',v)} />
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding:28, marginBottom:16 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:18, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>👩‍⚕️ Professional Information</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Professional Title</label><input className="form-input" placeholder="e.g. Clinical Pharmacist" value={profile?.title||''} onChange={e => upd('title',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Years of Experience</label><input className="form-input" type="number" min={0} value={profile?.years_experience||0} onChange={e => upd('years_experience',Number(e.target.value))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">License Number</label><input className="form-input" placeholder="Your pharmacy license #" value={profile?.license_number||''} onChange={e => upd('license_number',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="e.g. Riyadh" value={profile?.city||''} onChange={e => upd('city',e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Min Hourly Rate (SAR)</label><input className="form-input" type="number" value={profile?.hourly_rate_min||''} onChange={e => upd('hourly_rate_min',Number(e.target.value))} /></div>
                <div className="form-group"><label className="form-label">Max Hourly Rate (SAR)</label><input className="form-input" type="number" value={profile?.hourly_rate_max||''} onChange={e => upd('hourly_rate_max',Number(e.target.value))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Professional Bio</label><textarea className="form-input form-textarea" placeholder="Brief professional summary..." value={profile?.bio||''} onChange={e => upd('bio',e.target.value)} /></div>
              <label style={{ display:'flex', gap:9, alignItems:'center', cursor:'pointer' }}>
                <input type="checkbox" checked={profile?.is_available||false} onChange={e => upd('is_available',e.target.checked)} style={{ width:16,height:16 }} />
                <span style={{ fontSize:14, fontWeight:500, color:'var(--grey-700)' }}>Currently available for work</span>
              </label>
            </div>
            <div className="card" style={{ padding:28, marginBottom:16 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>🎯 Specializations</h3>
              <PillToggle options={SPECS} selected={profile?.specializations||[]} onToggle={v => toggle('specializations',v)} />
            </div>
            <div className="card" style={{ padding:28, marginBottom:24 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--grey-100)' }}>💼 Available Work Types</h3>
              <PillToggle options={WORKTYPES} selected={profile?.work_types||[]} onToggle={v => toggle('work_types',v)} colorActive="active-green" />
            </div>
          </>
        )}

        {error && <Alert type="error">{error}</Alert>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving?'Saving…':'💾 Save Profile'}</button>
      </form>
    </div>
  );
}
