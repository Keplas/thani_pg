import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell, RequireAuth } from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Profile from './pages/Profile.jsx';

// Owner pages
import OwnerDashboard    from './pages/owner/Dashboard.jsx';
import PostJob           from './pages/owner/PostJob.jsx';
import ViewApplications  from './pages/owner/ViewApplications.jsx';
import FindTalent        from './pages/owner/FindTalent.jsx';
import AllJobs           from './pages/owner/AllJobs.jsx';

// Pro pages
import ProDashboard    from './pages/pro/Dashboard.jsx';
import JobSearch       from './pages/pro/JobSearch.jsx';
import MyApplications  from './pages/pro/MyApplications.jsx';

const ownerNav = [
  { label:'Main', links:[
    { to:'/owner/dashboard',   icon:'📊', label:'Dashboard'   },
    { to:'/owner/post-job',    icon:'➕', label:'Post a Job'  },
    { to:'/owner/jobs',        icon:'💼', label:'My Jobs'     },
    { to:'/owner/find-talent', icon:'🔍', label:'Find Talent' },
  ]},
  { label:'Account', links:[
    { to:'/owner/profile', icon:'🏪', label:'My Profile' },
  ]},
];

const proNav = [
  { label:'Main', links:[
    { to:'/pro/dashboard',    icon:'📊', label:'Dashboard'       },
    { to:'/pro/jobs',         icon:'🔍', label:'Find Jobs'       },
    { to:'/pro/applications', icon:'📋', label:'My Applications' },
  ]},
  { label:'Account', links:[
    { to:'/pro/profile', icon:'👩‍⚕️', label:'My Profile' },
  ]},
];

function O({ children }) {
  return <RequireAuth role="owner"><AppShell navSections={ownerNav}>{children}</AppShell></RequireAuth>;
}
function P({ children }) {
  return <RequireAuth role="professional"><AppShell navSections={proNav}>{children}</AppShell></RequireAuth>;
}

function AppRoutes() {
  const { user } = useAuth();
  const dash = user?.role === 'owner' ? '/owner/dashboard' : '/pro/dashboard';
  return (
    <Routes>
      <Route path="/"         element={user ? <Navigate to={dash} replace /> : <Landing />} />
      <Route path="/login"    element={user ? <Navigate to={dash} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={dash} replace /> : <Register />} />

      {/* Owner */}
      <Route path="/owner/dashboard"              element={<O><OwnerDashboard /></O>} />
      <Route path="/owner/post-job"               element={<O><PostJob /></O>} />
      <Route path="/owner/jobs"                   element={<O><AllJobs /></O>} />
      <Route path="/owner/jobs/:jobId/applications" element={<O><ViewApplications /></O>} />
      <Route path="/owner/find-talent"            element={<O><FindTalent /></O>} />
      <Route path="/owner/profile"                element={<O><Profile /></O>} />

      {/* Professional */}
      <Route path="/pro/dashboard"   element={<P><ProDashboard /></P>} />
      <Route path="/pro/jobs"        element={<P><JobSearch /></P>} />
      <Route path="/pro/applications"element={<P><MyApplications /></P>} />
      <Route path="/pro/profile"     element={<P><Profile /></P>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ style:{ fontFamily:'var(--font)', fontSize:14, borderRadius:10 } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
