import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { getVoteByToken, castVote, castPublicVote, getLeaderboard } from '../api/votes';
import { formatCurrency, formatDate, timeRemaining } from '../utils';
import { FiCheckCircle, FiClock, FiBarChart2, FiAward, FiLock } from 'react-icons/fi';
import { FLW_PUBLIC_KEY } from '../constants/config';

const COLORS = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706'];

const PublicVotePage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [voted, setVoted] = useState(false);
  const [voterEmail, setVoterEmail] = useState('');

  const { data: voteData, isLoading } = useQuery({
    queryKey: ['public-vote-detail', token],
    queryFn: () => getVoteByToken(token),
  });

  const vote = voteData?.data;

  // Pre-select option from contestant link
  useEffect(() => {
    const optionId = searchParams.get('option');
    if (optionId && vote?.options) {
      const match = vote.options.find((o) => o.id === parseInt(optionId));
      if (match) setSelectedOption(match.id);
    }
  }, [vote, searchParams]);

  const { data: lbData, refetch: refetchLb } = useQuery({
    queryKey: ['public-vote-leaderboard', vote?.id],
    queryFn: () => getLeaderboard(vote?.id),
    enabled: !!vote?.id,
    refetchInterval: 10000,
  });

  const leaderboard = lbData?.data?.leaderboard || [];
  const totalVotes = lbData?.data?.totalVotes || 0;

  // Determine pricing based on membership
  const isMember = !!user;
  const isFreeForUser = isMember ? vote?.isFree : vote?.nonMemberIsFree;
  const priceForUser = isMember ? vote?.pricePerVote : vote?.nonMemberPricePerVote;
  const cost = vote && !isFreeForUser ? priceForUser * quantity : 0;
  const emailForPaystack = isMember ? user?.email : voterEmail;

  const fwConfig = {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: `vote-${vote?.id}-${Date.now()}`,
    amount: cost,
    currency: "NGN",
    payment_options: "card,ussd,mobilemoneyghana",
    customer: {
      email: emailForPaystack || "",
      name: isMember ? user?.name : "Guest Voter",
    },
    customizations: {
      title: "EOPANSE Voting",
      description: `Vote for contestant in ${vote?.title}`,
    },
    callback: (response) => {
      if (response.status === "successful" || response.status === "completed") {
        if (isMember) {
          memberCastMut.mutate({
            voteId: vote.id,
            voteOptionId: selectedOption,
            quantity,
            transactionRef: String(response.transaction_id),
          });
        } else {
          publicCastMut.mutate({
            voteId: vote.id,
            voteOptionId: selectedOption,
            quantity,
            transactionRef: String(response.transaction_id),
            voterEmail,
          });
        }
        closePaymentModal();
      }
    },
    onClose: () => {
      toast("Payment cancelled");
    },
  };

  const memberCastMut = useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      toast.success('Your vote has been cast!');
      setVoted(true);
      refetchLb();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Vote failed'),
  });

  const publicCastMut = useMutation({
    mutationFn: castPublicVote,
    onSuccess: () => {
      toast.success('Your vote has been cast!');
      setVoted(true);
      refetchLb();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Vote failed'),
  });

  const castMut = isMember ? memberCastMut : publicCastMut;

  const handleVote = () => {
    if (!selectedOption) { toast.error('Please select an option'); return; }

    if (!isMember && !isFreeForUser && !voterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (isFreeForUser) {
      if (isMember) {
        memberCastMut.mutate({ voteId: vote.id, voteOptionId: selectedOption, quantity });
      } else {
        publicCastMut.mutate({ voteId: vote.id, voteOptionId: selectedOption, quantity, voterEmail: voterEmail || undefined });
      }
      return;
    }

    if (!emailForPaystack) {
      toast.error('Please enter your email address');
      return;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FiBarChart2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-semibold">Vote not found</p>
        </div>
      </div>
    );
  }

  // Members-only gate: vote doesn't allow non-members and user isn't logged in
  if (!vote.allowNonMembers && !isMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">E</span>
          </div>
          <span className="font-black text-gray-900 text-lg">EOPANSE</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Members Only</h2>
            <p className="text-gray-500 mb-6">This vote is for members only. Please log in to participate.</p>
            <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              Login to Vote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = vote.status === 'active';
  const isEnded = vote.status === 'ended';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="font-black text-gray-900 text-lg">EOPANSE</span>
          </div>
          <div className="flex items-center gap-3">
            {isMember ? (
              <span className="text-sm text-gray-500">Voting as <span className="font-semibold text-gray-800">{user.name}</span></span>
            ) : (
              <Link to="/login" className="text-sm text-primary-600 font-medium hover:underline">Login as Member</Link>
            )}
          </div>
        </div>
      </header>

      {/* Vote Title Banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900">{vote.title}</h1>
            <Badge status={vote.status} />
            {isFreeForUser && <Badge status="free" label="Free" />}
            {!isMember && vote.allowNonMembers && (
              <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">Open to Non-Members</span>
            )}
          </div>
          {vote.description && <p className="text-gray-500 mt-2">{vote.description}</p>}
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
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
              <p className={`font-black text-lg ${isFreeForUser ? 'text-green-600' : 'text-purple-600'}`}>
                {isFreeForUser ? 'FREE' : formatCurrency(priceForUser)}
              </p>
              <p className="text-xs text-gray-500">Per Vote{!isMember && ' (Non-Member)'}</p>
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
                  {!isFreeForUser && <p className="text-purple-600 font-semibold">Amount: {formatCurrency(cost)}</p>}
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
                          className={`p-4 rounded-xl border-2 transition-all ${isActive ? 'cursor-pointer' : ''} ${
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

                  {isActive && (
                    <div>
                      {/* Email input for non-member paid votes */}
                      {!isMember && !isFreeForUser && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email Address <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            value={voterEmail}
                            onChange={(e) => setVoterEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                          />
                          <p className="text-xs text-gray-400 mt-1">Required to process payment</p>
                        </div>
                      )}

                      {!isFreeForUser && (
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

                      {isFreeForUser ? (
                        <button
                          onClick={handleVote}
                          disabled={castMut.isPending || !selectedOption}
                          className="btn-primary w-full py-3 text-center"
                        >
                          {castMut.isPending ? 'Casting Vote...' : 'Cast Free Vote'}
                        </button>
                      ) : (
                        <FlutterWaveButton
                          {...fwConfig}
                          disabled={castMut.isPending || !selectedOption}
                          className="btn-primary w-full py-3 text-center"
                        >
                          {castMut.isPending ? 'Processing...' : `Vote Now — ${formatCurrency(cost)}`}
                        </FlutterWaveButton>
                      )}
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center">
        <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-600">EOPANSE</span></p>
      </footer>
    </div>
  );
};

export default PublicVotePage;
