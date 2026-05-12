import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import VoteLinkPage from './pages/VoteLinkPage';
import PublicVotePage from './pages/PublicVotePage';
import ContestantLinkPage from './pages/ContestantLinkPage';
import Constitution from './pages/Constitution';
import About from './pages/About';
import EventDetail from './pages/EventDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVotes from './pages/admin/AdminVotes';
import AdminVoteDetail from './pages/admin/AdminVoteDetail';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminSettings from './pages/admin/AdminSettings';
import AdminExecutives from './pages/admin/AdminExecutives';
import AdminEvents from './pages/admin/AdminEvents';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';

import UserDashboard from './pages/user/UserDashboard';
import UserVotes from './pages/user/UserVotes';
import VotePage from './pages/user/VotePage';
import VoteHistory from './pages/user/VoteHistory';
import UserProfile from './pages/user/UserProfile';
import UserPayments from './pages/user/UserPayments';

import LoadingSpinner from './components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedUser = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="xl" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdmin = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="xl" /></div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, admin } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/admin/login" element={admin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
      <Route path="/vote-link/:token" element={<VoteLinkPage />} />
      <Route path="/vote/o/:optionToken" element={<ContestantLinkPage />} />
      <Route path="/vote/:token" element={<PublicVotePage />} />
      <Route path="/constitution" element={<Constitution />} />
      <Route path="/about" element={<About />} />
      <Route path="/events/:id" element={<EventDetail />} />

      {/* User Dashboard */}
      <Route path="/dashboard" element={<ProtectedUser><UserDashboard /></ProtectedUser>} />
      <Route path="/dashboard/votes" element={<ProtectedUser><UserVotes /></ProtectedUser>} />
      <Route path="/dashboard/votes/:token" element={<ProtectedUser><VotePage /></ProtectedUser>} />
      <Route path="/dashboard/history" element={<ProtectedUser><VoteHistory /></ProtectedUser>} />
      <Route path="/dashboard/profile" element={<ProtectedUser><UserProfile /></ProtectedUser>} />
      <Route path="/dashboard/payments" element={<ProtectedUser><UserPayments /></ProtectedUser>} />

      {/* Admin Dashboard */}
      <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/admin/users" element={<ProtectedAdmin><AdminUsers /></ProtectedAdmin>} />
      <Route path="/admin/votes" element={<ProtectedAdmin><AdminVotes /></ProtectedAdmin>} />
      <Route path="/admin/votes/:id" element={<ProtectedAdmin><AdminVoteDetail /></ProtectedAdmin>} />
      <Route path="/admin/financials" element={<ProtectedAdmin><AdminFinancials /></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><AdminSettings /></ProtectedAdmin>} />
      <Route path="/admin/executives" element={<ProtectedAdmin><AdminExecutives /></ProtectedAdmin>} />
      <Route path="/admin/events" element={<ProtectedAdmin><AdminEvents /></ProtectedAdmin>} />
      <Route path="/admin/hero-slides" element={<ProtectedAdmin><AdminHeroSlides /></ProtectedAdmin>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
