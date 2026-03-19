import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVoteResults } from '../../api/admin';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatDate, formatCurrency, timeRemaining } from '../../utils';
import { FiArrowLeft, FiTrendingUp, FiAward, FiDollarSign, FiUsers, FiPrinter } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#ec4899', '#8b5cf6'];

const AdminVoteDetail = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vote-results', id],
    queryFn: () => getVoteResults(id),
    refetchInterval: 15000,
  });

  const d = data?.data;

  const handlePrint = () => window.print();

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
          <div className="flex items-center gap-4 mb-6">
            <Link to="/admin/votes" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{d?.vote?.title}</h1>
                {d?.vote && <Badge status={d.vote.status} />}
              </div>
              {d?.vote?.description && <p className="text-gray-500 mt-1">{d.vote.description}</p>}
            </div>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 print:hidden">
              <FiPrinter className="h-4 w-4" /> Print Report
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Total Votes</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{d?.totalVotes || 0}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Vote Revenue</p>
              <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(d?.totalRevenue || 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Start Date</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(d?.vote?.startDate)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">{d?.vote?.status === 'active' ? 'Time Left' : 'End Date'}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {d?.vote?.status === 'active' ? timeRemaining(d?.vote?.endDate) : formatDate(d?.vote?.endDate)}
              </p>
            </div>
          </div>

          {/* Winner Banner */}
          {d?.winner && d.vote?.status === 'ended' && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 flex items-center gap-4">
              <FiAward className="h-12 w-12 text-white flex-shrink-0" />
              <div>
                <p className="text-orange-900 font-semibold text-sm">Winner</p>
                <h2 className="text-white font-black text-2xl">{d.winner.title}</h2>
                <p className="text-orange-100">{d.winner.votes} votes ({d.winner.percentage}%)</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Pie Chart */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Vote Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d?.results || []} dataKey="votes" nameKey="title" cx="50%" cy="50%" outerRadius={80}>
                    {(d?.results || []).map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} votes`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="card lg:col-span-2">
              <h2 className="font-bold text-gray-900 mb-4">Vote Comparison</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d?.results || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="votes" name="Votes" radius={[4, 4, 0, 0]}>
                    {(d?.results || []).map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5 text-primary-600" /> Leaderboard
            </h2>
            <div className="space-y-3">
              {(d?.results || []).map((result, idx) => (
                <div key={result.id} className={`flex items-center gap-4 p-4 rounded-xl ${idx === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{result.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${result.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                      </div>
                      <span className="text-xs text-gray-600 font-medium w-12 text-right">{result.percentage}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900 text-lg">{result.votes}</p>
                    <p className="text-xs text-gray-500">votes</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-600">{formatCurrency(result.revenue)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top voters per option */}
          {(d?.results || []).map((result) => result.topVoters?.length > 0 && (
            <div key={result.id} className="card mb-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiUsers className="h-4 w-4 text-primary-600" /> Top Voters for "{result.title}"
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="pb-2">Member</th>
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Votes</th>
                      <th className="pb-2">Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.topVoters.map((v) => (
                      <tr key={v.userId}>
                        <td className="py-2 font-medium">{v.user?.name}</td>
                        <td className="py-2 font-mono text-purple-600">{v.user?.userCode}</td>
                        <td className="py-2 font-bold">{v.dataValues?.voteCount || 0}</td>
                        <td className="py-2 text-green-600">{formatCurrency(v.dataValues?.totalAmount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminVoteDetail;
