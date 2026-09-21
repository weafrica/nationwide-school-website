import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import ChangePassword from './ChangePassword';
import PendingApproval from './PendingApproval';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

// Auto-refresh in the sense that matters for a portal: this component
// re-evaluates on every render of profile/session (which AuthContext
// keeps live via onAuthStateChange), so the moment an admin approves a
// pending account or changes someone's role, that person's own portal
// view updates without them needing to manually reload the page.
export default function PortalGate() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-ink/50">Loading\u2026</div>;
  }

  if (!session) {
    return <Navigate to="/portal" replace />;
  }

  if (!profile) {
    return <div className="flex min-h-[50vh] items-center justify-center text-ink/50">Setting up your account\u2026</div>;
  }

  if (profile.must_change_password) {
    return <ChangePassword />;
  }

  if (profile.role === 'pending') {
    return <PendingApproval onSignOut={signOut} />;
  }

  if (profile.role === 'student') return <StudentDashboard />;
  if (profile.role === 'teacher') return <TeacherDashboard />;
  if (profile.role === 'principal' || profile.role === 'admin') return <AdminDashboard />;

  return <PendingApproval onSignOut={signOut} />;
}
