import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import UserSidebar from '../../components/layout/UserSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { getVoteHistory } from '../../api/votes';
import { formatCurrency, formatDate } from '../../utils';
import { FiClock, FiBarChart2, FiCheckCircle } from 'react-icons/fi';

const VoteHistory = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-vote-history'],
    queryFn: getVoteHistory,
  });

  const history = data?.data || [];
  const totalSpent = history.reduce((s, h) => s + h.totalSpent, 0);
  const totalCast = history.reduce((s, h) => s + h.totalVotes, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Vote History</h1>
            <p className="text-gray-500 mt-1">All elections you've participated in</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <FiCheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-gray-900">{history.length}</p>
              <p className="text-xs text-gray-500">Elections</p>
            </div>
            <div className="card text-center">
              <FiBarChart2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-gray-900">{totalCast}</p>
              <p className="text-xs text-gray-500">Votes Cast</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-black text-green-600">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>

          {isLoading ? <LoadingSpinner size="xl" className="py-16" /> : history.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <FiClock className="h-14 w-14 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No voting history yet</p>
              <p className="text-sm mt-1">Your voting activity will appear here</p>
              <Link to="/dashboard/votes" className="btn-primary inline-block mt-4">Browse Active Votes</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((h, idx) => {
                const optionsList = Object.values(h.options);
                return (
                  <div key={idx} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{h.vote?.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge status={h.vote?.status} />
                          <span className="text-xs text-gray-500">Ended: {formatDate(h.vote?.endDate)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{h.totalVotes}</p>
                        <p className="text-xs text-gray-500">votes cast</p>
                        {h.totalSpent > 0 && <p className="text-green-600 font-semibold text-sm">{formatCurrency(h.totalSpent)}</p>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Votes</p>
                      {optionsList.map((item) => (
                        <div key={item.option?.id} className="flex items-center justify-between bg-purple-50 rounded-lg p-2.5">
                          <span className="text-sm font-medium text-gray-900">{item.option?.title}</span>
                          <div className="flex items-center gap-3">
                            {item.spent > 0 && <span className="text-xs text-gray-500">{formatCurrency(item.spent)}</span>}
                            <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">×{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoteHistory;
