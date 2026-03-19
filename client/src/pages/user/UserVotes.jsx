import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import UserSidebar from '../../components/layout/UserSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { getVotes } from '../../api/votes';
import { formatCurrency, formatDate, timeRemaining } from '../../utils';
import { FiCheckSquare, FiClock, FiBarChart2 } from 'react-icons/fi';

const UserVotes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-votes'],
    queryFn: getVotes,
    refetchInterval: 30000,
  });

  const votes = data?.data || [];
  const active = votes.filter((v) => v.status === 'active');
  const ended = votes.filter((v) => v.status === 'ended');

  const VoteCard = ({ vote }) => {
    const total = vote.options?.reduce((s, o) => s + (o.totalVotes || 0), 0) || 0;
    const leader = vote.options?.sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))[0];

    return (
      <Link
        to={`/dashboard/votes/${vote.shareToken}`}
        className="card hover:shadow-md transition-all hover:border-primary-200 group flex flex-col"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{vote.title}</h3>
            {vote.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{vote.description}</p>}
          </div>
          <Badge status={vote.status} className="flex-shrink-0" />
        </div>

        {vote.category && (
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full self-start mb-3">{vote.category}</span>
        )}

        {leader && (
          <div className="bg-purple-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 mb-1">Current Leader</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm truncate">{leader.title}</span>
              <span className="text-purple-700 font-bold text-sm ml-2 flex-shrink-0">{leader.totalVotes || 0} votes</span>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-500 flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" />
            {vote.status === 'active' ? timeRemaining(vote.endDate) : `Ended ${formatDate(vote.endDate)}`}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">{total} votes</span>
            <span className={`text-xs font-bold ${vote.isFree ? 'text-green-600' : 'text-purple-600'}`}>
              {vote.isFree ? 'Free' : formatCurrency(vote.pricePerVote)}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Votes & Elections</h1>
            <p className="text-gray-500 mt-1">Participate in ongoing and view past elections</p>
          </div>

          {isLoading ? <LoadingSpinner size="xl" className="py-16" /> : (
            <>
              {active.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    Active Votes ({active.length})
                  </h2>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {active.map((vote) => <VoteCard key={vote.id} vote={vote} />)}
                  </div>
                </div>
              )}

              {ended.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBarChart2 className="h-5 w-5 text-gray-500" />
                    Completed Votes ({ended.length})
                  </h2>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {ended.map((vote) => <VoteCard key={vote.id} vote={vote} />)}
                  </div>
                </div>
              )}

              {votes.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <FiCheckSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No votes available</p>
                  <p className="text-sm mt-1">Check back soon for new elections</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserVotes;
