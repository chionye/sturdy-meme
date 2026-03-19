import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../api/admin';
import AdminSidebar from '../../components/layout/AdminSidebar';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate, timeRemaining } from '../../utils';
import {
  FiUsers, FiCheckSquare, FiDollarSign, FiBarChart2,
  FiUserCheck, FiUserX, FiClock,
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
    refetchInterval: 30000,
  });

  const d = data?.data;

  if (isLoading) return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center lg:ml-64">
        <LoadingSpinner size="xl" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Welcome to EOPANSE Admin Portal</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Members" value={d?.users?.total || 0} icon={FiUsers} color="purple"
              subtitle={`${d?.users?.pending || 0} pending`} />
            <StatCard title="Active Members" value={d?.users?.active || 0} icon={FiUserCheck} color="green" />
            <StatCard title="Active Votes" value={d?.votes?.active || 0} icon={FiCheckSquare} color="blue" />
            <StatCard title="Total Revenue" value={formatCurrency(d?.revenue?.total || 0)} icon={FiDollarSign} color="orange"
              subtitle="All time" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Votes Cast" value={d?.votes?.cast || 0} icon={FiBarChart2} color="indigo" />
            <StatCard title="Reg. Revenue" value={formatCurrency(d?.revenue?.registration || 0)} icon={FiDollarSign} color="green" />
            <StatCard title="Vote Revenue" value={formatCurrency(d?.revenue?.votes || 0)} icon={FiDollarSign} color="purple" />
            <StatCard title="Suspended" value={d?.users?.suspended || 0} icon={FiUserX} color="red" />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Member Growth */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Member Growth (6 months)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={d?.charts?.userGrowth || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="New Members" stroke="#7c3aed" fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Growth */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue (6 months)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d?.charts?.revenueGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="total" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Votes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Active Votes</h2>
              <Link to="/admin/votes" className="text-primary-600 text-sm font-medium hover:underline">View All</Link>
            </div>
            {d?.activeVotes?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No active votes</div>
            ) : (
              <div className="space-y-3">
                {(d?.activeVotes || []).map((vote) => {
                  const total = vote.options?.reduce((s, o) => s + (o.totalVotes || 0), 0) || 0;
                  return (
                    <div key={vote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{vote.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FiClock className="h-3 w-3" /> {timeRemaining(vote.endDate)}
                          </span>
                          <span className="text-xs text-gray-500">{total} votes cast</span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Badge status="active" />
                        <Link to={`/admin/votes/${vote.id}`} className="text-primary-600 text-sm hover:underline">View</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
