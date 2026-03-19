import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveVotingLink } from '../api/votes';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useEffect } from 'react';

const VoteLinkPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['voting-link', token],
    queryFn: () => resolveVotingLink(token),
  });

  useEffect(() => {
    if (data?.data?.valid) {
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [data, navigate]);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
      <LoadingSpinner size="xl" className="text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {isError || !data?.data?.valid ? (
          <>
            <FiXCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-500">This voting link is invalid or has expired.</p>
          </>
        ) : (
          <>
            <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Valid Voting Link</h2>
            <p className="text-gray-500 mb-4">Member: <strong>{data.data.user.name}</strong> ({data.data.user.userCode})</p>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VoteLinkPage;
