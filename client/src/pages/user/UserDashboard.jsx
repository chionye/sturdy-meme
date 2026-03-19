import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserSidebar from '../../components/layout/UserSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { getVotes } from '../../api/votes';
import { getVoteHistory } from '../../api/votes';
import { formatDate, formatCurrency, timeRemaining, getVoteStatus } from '../../utils';
import { FiCheckSquare, FiClock, FiBarChart2, FiArrowRight, FiUser } from 'react-icons/fi';

const UserDashboard = () => {
  const { user } = useAuth();

  const { data: votesData, isLoading: loadingVotes } = useQuery({
    queryKey: ['user-votes'],
    queryFn: getVotes,
  });

  const { data: historyData } = useQuery({
    queryKey: ['user-vote-history'],
    queryFn: getVoteHistory,
  });

  const votes = votesData?.data || [];
  const history = historyData?.data || [];
  const activeVotes = votes.filter((v) => v.status === 'active');
  const endedVotes = votes.filter((v) => v.status === 'ended');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 mt-1">Your EOPANSE member dashboard</p>
          </div>

          {/* Profile Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                {user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-xl truncate">{user?.name}</h2>
                <p className="text-purple-200 text-sm truncate">{user?.businessName}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full font-mono">{user?.userCode}</span>
                  <span className="text-purple-200 text-xs">{user?.state}</span>
                  <Badge status={user?.status} className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <FiCheckSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{activeVotes.length}</p>
              <p className="text-gray-500 text-sm">Active Votes</p>
            </div>
            <div className="card text-center">
              <FiBarChart2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{history.length}</p>
              <p className="text-gray-500 text-sm">Votes Participated</p>
            </div>
            <div className="card text-center col-span-2 lg:col-span-1">
              <FiClock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{endedVotes.length}</p>
              <p className="text-gray-500 text-sm">Completed Votes</p>
            </div>
          </div>

          {/* Active Votes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Active Votes</h2>
              <Link to="/dashboard/votes" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                View All <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingVotes ? <LoadingSpinner className="py-8" /> : activeVotes.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <FiCheckSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No active votes at the moment</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeVotes.slice(0, 4).map((vote) => {
                  const total = vote.options?.reduce((s, o) => s + (o.totalVotes || 0), 0) || 0;
                  return (
                    <Link key={vote.id} to={`/dashboard/votes/${vote.shareToken}`} className="card hover:shadow-md transition-all hover:border-primary-200 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{vote.title}</h3>
                          {vote.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{vote.description}</p>}
                        </div>
                        <Badge status="active" className="ml-2 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><FiClock className="h-3 w-3" />{timeRemaining(vote.endDate)}</span>
                        <span>{total} votes cast</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${vote.isFree ? 'text-green-600' : 'text-purple-600'}`}>
                          {vote.isFree ? 'Free Vote' : `${formatCurrency(vote.pricePerVote)}/vote`}
                        </span>
                        <span className="text-primary-600 text-xs font-semibold group-hover:underline">Vote Now →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Vote History */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Participation</h2>
                <Link to="/dashboard/history" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                  View All <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {history.slice(0, 3).map((h, i) => (
                  <div key={i} className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FiCheckSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{h.vote?.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{h.totalVotes} vote(s) cast</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge status={h.vote?.status} />
                      {h.totalSpent > 0 && <p className="text-xs text-gray-500 mt-1">{formatCurrency(h.totalSpent)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
