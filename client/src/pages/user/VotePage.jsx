import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import usePaystackPayment from '../../hooks/usePaystackPayment';
import { useAuth } from '../../context/AuthContext';
import UserSidebar from '../../components/layout/UserSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { getVoteByToken, castVote, getLeaderboard } from '../../api/votes';
import { formatCurrency, formatDate, timeRemaining } from '../../utils';
import { FiArrowLeft, FiCheckCircle, FiClock, FiBarChart2, FiAward } from 'react-icons/fi';

const COLORS = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706'];

const VotePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [voted, setVoted] = useState(false);
  const [pendingRef, setPendingRef] = useState(null);

  const { data: voteData, isLoading } = useQuery({
    queryKey: ['vote-detail', token],
    queryFn: () => getVoteByToken(token),
  });

  const { data: lbData, refetch: refetchLb } = useQuery({
    queryKey: ['vote-leaderboard', voteData?.data?.id],
    queryFn: () => getLeaderboard(voteData?.data?.id),
    enabled: !!voteData?.data?.id,
    refetchInterval: 10000,
  });

  const castMut = useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      toast.success('Your vote has been cast!');
      setVoted(true);
      refetchLb();
      qc.invalidateQueries(['user-votes']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Vote failed'),
  });

  const vote = voteData?.data;
  const leaderboard = lbData?.data?.leaderboard || [];
  const totalVotes = lbData?.data?.totalVotes || 0;
  const cost = vote && !vote.isFree ? vote.pricePerVote * quantity : 0;

  const paystackConfig = {
    email: user?.email || '',
    amount: Math.round(cost * 100), // kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: { voteId: vote?.id, voteOptionId: selectedOption, quantity },
  };
  const initializePayment = usePaystackPayment(paystackConfig);

  const handleVote = () => {
    if (!selectedOption) { toast.error('Please select an option'); return; }

    if (vote.isFree) {
      castMut.mutate({ voteId: vote.id, voteOptionId: selectedOption, quantity });
      return;
    }

    // Paid vote — open Paystack
    initializePayment(
      (ref) => {
        castMut.mutate({ voteId: vote.id, voteOptionId: selectedOption, quantity, transactionRef: ref.reference });
      },
      () => toast('Payment cancelled')
    );
  };

  if (isLoading) return (
    <div className="flex h-screen">
      <UserSidebar />
      <div className="flex-1 flex items-center justify-center lg:ml-64"><LoadingSpinner size="xl" /></div>
    </div>
  );

  if (!vote) return (
    <div className="flex h-screen">
      <UserSidebar />
      <div className="flex-1 flex items-center justify-center lg:ml-64 text-gray-400">Vote not found</div>
    </div>
  );

  const isActive = vote.status === 'active';
  const isEnded = vote.status === 'ended';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard/votes" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{vote.title}</h1>
                <Badge status={vote.status} />
                {vote.isFree && <Badge status="free" label="Free" />}
              </div>
              {vote.description && <p className="text-gray-500 mt-1">{vote.description}</p>}
            </div>
          </div>

          {/* Vote Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <FiBarChart2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="font-black text-lg text-gray-900">{totalVotes}</p>
              <p className="text-xs text-gray-500">Total Votes</p>
            </div>
            <div className="card text-center">
              <FiClock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="font-bold text-sm text-gray-900">{isActive ? timeRemaining(vote.endDate) : formatDate(vote.endDate)}</p>
              <p className="text-xs text-gray-500">{isActive ? 'Time Left' : 'Ended'}</p>
            </div>
            <div className="card text-center">
              <p className={`font-black text-lg ${vote.isFree ? 'text-green-600' : 'text-purple-600'}`}>
                {vote.isFree ? 'FREE' : formatCurrency(vote.pricePerVote)}
              </p>
              <p className="text-xs text-gray-500">Per Vote</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Voting Section */}
            <div className="lg:col-span-3">
              {voted ? (
                <div className="card text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Vote Submitted!</h2>
                  <p className="text-gray-500 mb-4">Your vote has been recorded successfully.</p>
                  {!vote.isFree && <p className="text-purple-600 font-semibold">Amount: {formatCurrency(cost)}</p>}
                  <button onClick={() => setVoted(false)} className="btn-secondary mt-4">Vote Again</button>
                </div>
              ) : (
                <div className="card">
                  <h2 className="font-bold text-gray-900 mb-4">
                    {isActive ? 'Cast Your Vote' : isEnded ? 'Final Results' : 'Vote Options'}
                  </h2>

                  <div className="space-y-3 mb-6">
                    {vote.options?.map((opt, idx) => {
                      const lb = leaderboard.find((l) => l.id === opt.id);
                      const pct = lb ? lb.percentage : 0;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => isActive && setSelectedOption(opt.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isActive ? 'cursor-pointer' : ''
                          } ${
                            selectedOption === opt.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {isActive && (
                              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                selectedOption === opt.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                              }`}>
                                {selectedOption === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                            )}
                            {opt.image && <img src={opt.image} alt={opt.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900">{opt.title}</p>
                              {opt.description && <p className="text-gray-500 text-xs mt-0.5">{opt.description}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-black text-gray-900">{lb?.votes || 0}</p>
                              <p className="text-xs text-gray-500">votes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isActive && !voted && (
                    <div>
                      {!vote.isFree && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Votes</label>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-bold">−</button>
                            <span className="font-black text-xl text-gray-900 w-8 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-bold">+</button>
                            {cost > 0 && <span className="text-purple-600 font-bold ml-2">= {formatCurrency(cost)}</span>}
                          </div>
                        </div>
                      )}
                      <button onClick={handleVote} disabled={castMut.isPending || !selectedOption} className="btn-primary w-full py-3 text-center">
                        {castMut.isPending ? 'Casting Vote...' : vote.isFree ? 'Cast Free Vote' : `Vote Now — ${formatCurrency(cost)}`}
                      </button>
                    </div>
                  )}

                  {isEnded && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm">This vote has ended. View the final results on the leaderboard.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiAward className="h-5 w-5 text-yellow-500" /> Leaderboard
                </h2>
                <div className="space-y-2">
                  {leaderboard.map((item, idx) => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${idx === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                          </div>
                          <span className="text-xs text-gray-500">{item.percentage}%</span>
                        </div>
                      </div>
                      <span className="font-black text-gray-900 text-sm flex-shrink-0">{item.votes}</span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No votes yet</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">Updates every 10 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VotePage;
