import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveOptionToken } from '../api/votes';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FiXCircle } from 'react-icons/fi';

const ContestantLinkPage = () => {
  const { optionToken } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['option-token', optionToken],
    queryFn: () => resolveOptionToken(optionToken),
    retry: false,
  });

  useEffect(() => {
    if (data?.data?.voteToken) {
      navigate(`/vote/${data.data.voteToken}?option=${data.data.preSelectedOptionId}`, { replace: true });
    }
  }, [data, navigate]);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
      <LoadingSpinner size="xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <FiXCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-500">This contestant link is invalid or has expired.</p>
      </div>
    </div>
  );
};

export default ContestantLinkPage;
