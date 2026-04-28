import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'var(--font)' }}>
      {/* NAV */}
      <nav style={{ background:'#fff', borderBottom:'1px solid var(--grey-200)', padding:'0 48px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="brand-icon">T</div>
          <div>
            <div className="brand-name">Thani</div>
            <div className="brand-sub">ALJABRI PHARMACEUTICALS</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/login"    className="btn btn-grey btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,#0F172A 0%,#1E3A8A 60%,#2563EB 100%)', padding:'90px 48px 100px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-120, right:-80, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.25),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, left:-60, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.15),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:760, position:'relative', zIndex:1 }} className="fade-up">
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(16,185,129,0.15)', color:'#34D399', border:'1px solid rgba(16,185,129,0.3)', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:700, letterSpacing:'.05em', marginBottom:22 }}>
            🏥 The Pharmacy Professional Network
          </div>
          <h1 style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'clamp(38px,5vw,66px)', color:'#fff', lineHeight:1.1, marginBottom:20, letterSpacing:'-1px' }}>
            Connect Pharmacy<br /><span style={{ color:'#34D399' }}>Owners & Professionals</span>
          </h1>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.7)', maxWidth:540, lineHeight:1.7, marginBottom:36 }}>
            Project Thani is the dedicated marketplace built for the pharmaceutical industry — enabling fast hiring, flexible staffing, and professional growth.
          </p>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <Link to="/register?role=owner"        className="btn btn-primary btn-xl">🏪 I Own a Pharmacy</Link>
            <Link to="/register?role=professional" className="btn btn-xl" style={{ background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.25)' }}>👩‍⚕️ I'm a Professional</Link>
          </div>
          <div style={{ display:'flex', gap:48, marginTop:60 }}>
            {[['2,400+','Verified Professionals'],['680+','Partner Pharmacies'],['94%','Placement Rate'],['4.9★','Avg. Rating']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>{n}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'80px 48px', background:'#fff' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', color:'var(--primary)', textTransform:'uppercase', marginBottom:10 }}>Platform Features</div>
          <h2 style={{ fontWeight:800, fontSize:'clamp(28px,3vw,42px)', color:'var(--navy)', letterSpacing:'-0.5px' }}>Everything you need, in one place</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:22 }}>
          {[
            ['🤖','AI Job Matching','Smart algorithm matches professionals with opportunities based on skills, location, and availability.'],
            ['✅','Verified Credentials','Every professional goes through license verification before earning a trusted badge.'],
            ['💬','Direct Messaging','Communicate securely with built-in messaging and video interview support.'],
            ['💳','Secure Payments','Escrow-based milestone payments protect both parties on freelance contracts.'],
            ['⭐','Reviews & Ratings','Two-sided review system builds reputation and drives better long-term matches.'],
            ['📊','Analytics Dashboard','Real-time insights on applications, hires, job performance, and profile views.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:'var(--grey-50)', borderRadius:16, padding:26, border:'1px solid var(--grey-200)', transition:'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.boxShadow='var(--shadow)'}
              onMouseOut={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ width:48, height:48, borderRadius:12, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{icon}</div>
              <h3 style={{ fontWeight:700, fontSize:16, color:'var(--navy)', marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:14, color:'var(--grey-500)', lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'80px 48px', background:'var(--grey-50)' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontWeight:800, fontSize:'clamp(26px,3vw,38px)', color:'var(--navy)', letterSpacing:'-0.5px' }}>How It Works</h2>
          <p style={{ fontSize:15, color:'var(--grey-500)', marginTop:8 }}>Get started in under 5 minutes</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24, maxWidth:900, margin:'0 auto' }}>
          {[
            ['1','Register Free','Create your account as a pharmacy owner or professional — no credit card needed.'],
            ['2','Build Profile','Add your qualifications, licenses, services, and preferences to get discovered.'],
            ['3','Get AI Matched','Our algorithm finds the best opportunities or candidates for you automatically.'],
            ['4','Connect & Hire','Message, interview, and finalize — all within the platform securely.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ background:'#fff', borderRadius:16, padding:26, border:'1px solid var(--grey-200)', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--primary)', color:'#fff', fontWeight:800, fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>{n}</div>
              <h3 style={{ fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:8 }}>{t}</h3>
              <p style={{ fontSize:13, color:'var(--grey-500)', lineHeight:1.65 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO CREDENTIALS */}
      <section style={{ padding:'60px 48px', background:'var(--primary-bg)', borderTop:'1px solid #BFDBFE' }}>
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontWeight:800, fontSize:28, color:'var(--navy)', marginBottom:10 }}>Try the Demo</h2>
          <p style={{ color:'var(--grey-500)', marginBottom:24 }}>Use these credentials to explore the platform instantly:</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid var(--grey-200)' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🏪</div>
              <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>Pharmacy Owner</div>
              <div style={{ fontSize:13, color:'var(--grey-500)' }}>owner@demo.com</div>
              <div style={{ fontSize:13, color:'var(--grey-500)' }}>demo1234</div>
            </div>
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid var(--grey-200)' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>👩‍⚕️</div>
              <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>Professional</div>
              <div style={{ fontSize:13, color:'var(--grey-500)' }}>pro@demo.com</div>
              <div style={{ fontSize:13, color:'var(--grey-500)' }}>demo1234</div>
            </div>
          </div>
          <div style={{ marginTop:20, display:'flex', gap:12, justifyContent:'center' }}>
            <Link to="/login" className="btn btn-primary btn-lg">Sign In to Demo →</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create New Account</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'var(--navy)', padding:'28px 48px', marginTop:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="brand-icon">T</div>
            <span style={{ color:'rgba(255,255,255,0.7)', fontSize:14 }}>Project Thani — Aljabri Pharmaceuticals</span>
          </div>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>© 2024 All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
