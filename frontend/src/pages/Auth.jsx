import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI.jsx';
import toast from 'react-hot-toast';

function AuthShell({ children, title, sub }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--grey-50)', padding:20 }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:440, padding:36, borderRadius:20 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div className="brand-icon" style={{ margin:'0 auto 14px', width:46, height:46, fontSize:20 }}>T</div>
          <h2 style={{ fontSize:24, fontWeight:800, color:'var(--navy)', letterSpacing:'-0.5px' }}>{title}</h2>
          <p style={{ fontSize:14, color:'var(--grey-500)', marginTop:5 }}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const doLogin = async (e, overrideEmail, overridePassword) => {
    if (e) e.preventDefault();
    setError('');
    const em = (overrideEmail    || email).trim();
    const pw = (overridePassword || password).trim();
    if (!em || !pw) { setError('Please enter email and password'); return; }
    const r = await login(em, pw);
    if (r.success) {
      toast.success('Welcome back! 👋');
      navigate(r.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard');
    } else {
      setError(r.message);
    }
  };

  const demoLogin = async (role) => {
    const em = role === 'owner' ? 'owner@demo.com' : 'pro@demo.com';
    const pw = 'demo1234';
    setEmail(em);
    setPassword(pw);
    setError('');
    // login directly — don't rely on state update
    const r = await login(em, pw);
    if (r.success) {
      toast.success('Welcome back! 👋');
      navigate(r.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard');
    } else {
      setError(r.message);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to your Thani account">

      {/* Demo buttons OUTSIDE the form */}
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'var(--grey-500)', textAlign:'center', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>
          Quick Demo Login
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <button
            type="button"
            className="btn btn-grey"
            style={{ fontSize:13 }}
            disabled={loading}
            onClick={() => demoLogin('owner')}
          >
            🏪 Pharmacy Owner
          </button>
          <button
            type="button"
            className="btn btn-grey"
            style={{ fontSize:13 }}
            disabled={loading}
            onClick={() => demoLogin('professional')}
          >
            👩‍⚕️ Professional
          </button>
        </div>
      </div>

      <div className="divider-text"><span>or sign in manually</span></div>

      {/* Login form */}
      <form onSubmit={doLogin}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@pharmacy.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <button
          className="btn btn-primary btn-full btn-lg"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
      </form>

      <div className="divider" />
      <p style={{ textAlign:'center', fontSize:14, color:'var(--grey-500)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>
          Sign up free
        </Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm]   = useState({ name:'', email:'', password:'', role: params.get('role') || 'professional' });
  const [error, setError] = useState('');
  const f = k => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const r = await register(form.name.trim(), form.email.trim(), form.password, form.role);
    if (r.success) {
      toast.success('Account created! Welcome 🎉');
      navigate(r.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard');
    } else {
      setError(r.message);
    }
  };

  return (
    <AuthShell title="Create your account" sub="Join the pharmacy professional marketplace">
      {/* Role toggle */}
      <div style={{ display:'flex', gap:6, background:'var(--grey-100)', borderRadius:10, padding:4, marginBottom:22 }}>
        {['owner','professional'].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({...form, role:r})}
            style={{
              flex:1, padding:'9px 12px', border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'var(--font)', fontSize:13, fontWeight:600, transition:'var(--transition)',
              background: form.role===r ? '#fff' : 'transparent',
              color:      form.role===r ? 'var(--navy)' : 'var(--grey-500)',
              boxShadow:  form.role===r ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {r === 'owner' ? '🏪 Pharmacy Owner' : '👩‍⚕️ Professional'}
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">{form.role === 'owner' ? 'Pharmacy / Business Name' : 'Full Name'}</label>
          <input className="form-input"
            placeholder={form.role === 'owner' ? 'Al-Khalifa Pharmacy' : 'Dr. Sara Al-Hassan'}
            {...f('name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com" {...f('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters" {...f('password')} required />
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account →'}
        </button>
      </form>

      <div className="divider" />
      <p style={{ textAlign:'center', fontSize:14, color:'var(--grey-500)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in</Link>
      </p>
    </AuthShell>
  );
}