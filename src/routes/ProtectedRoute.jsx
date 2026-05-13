import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================
// ProtectedRoute — redirect ke /login jika belum login
// allowedRoles: array of role strings, e.g. ['owner', 'admin']
// ============================================================
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect ke dashboard sesuai role
    const redirectMap = {
      owner: '/owner/dashboard',
      admin: '/admin/laundries',
      kurir: '/courier/dashboard',
      user: '/',
    };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }

  return children;
}
