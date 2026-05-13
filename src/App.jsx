import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import RegisterCourierPage from './pages/RegisterCourierPage';

// Shared
import ProfilePage from './pages/ProfilePage';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOrders from './pages/owner/OwnerOrders';
import OwnerServices from './pages/owner/OwnerServices';
import OwnerPOS from './pages/owner/OwnerPOS';

// Admin pages
import AdminLaundries from './pages/admin/AdminLaundries';
import AdminCouriers from './pages/admin/AdminCouriers';
import AdminOrders from './pages/admin/AdminOrders';

// Courier pages
import CourierDashboard from './pages/courier/CourierDashboard';
import CourierTasks from './pages/courier/CourierTasks';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#b02228', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── PUBLIC ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/owner" element={<RegisterOwnerPage />} />
          <Route path="/register/courier" element={<RegisterCourierPage />} />

          {/* ── OWNER ── */}
          <Route
            path="/owner/dashboard"
            element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/owner/orders"
            element={<ProtectedRoute allowedRoles={['owner']}><OwnerOrders /></ProtectedRoute>}
          />
          <Route
            path="/owner/services"
            element={<ProtectedRoute allowedRoles={['owner']}><OwnerServices /></ProtectedRoute>}
          />
          <Route
            path="/owner/pos"
            element={<ProtectedRoute allowedRoles={['owner']}><OwnerPOS /></ProtectedRoute>}
          />
          <Route
            path="/owner/profile"
            element={<ProtectedRoute allowedRoles={['owner']}><ProfilePage /></ProtectedRoute>}
          />

          {/* ── ADMIN ── */}
          <Route
            path="/admin/laundries"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminLaundries /></ProtectedRoute>}
          />
          <Route
            path="/admin/couriers"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminCouriers /></ProtectedRoute>}
          />
          <Route
            path="/admin/orders"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>}
          />
          <Route
            path="/admin/profile"
            element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>}
          />

          {/* ── KURIR ── */}
          <Route
            path="/courier/dashboard"
            element={<ProtectedRoute allowedRoles={['kurir']}><CourierDashboard /></ProtectedRoute>}
          />
          <Route
            path="/courier/tasks"
            element={<ProtectedRoute allowedRoles={['kurir']}><CourierTasks /></ProtectedRoute>}
          />
          <Route
            path="/courier/profile"
            element={<ProtectedRoute allowedRoles={['kurir']}><ProfilePage /></ProtectedRoute>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
