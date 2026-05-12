import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getEvent } from '../api/content';
import { formatDate } from '../utils';
import { FiArrowLeft, FiCalendar, FiMapPin, FiImage } from 'react-icons/fi';

const API_BASE = 'https://api.eopanse.com.ng';

const EventDetail = () => {
  const { id } = useParams();
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center h-96"><LoadingSpinner size="xl" /></div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-400">Event not found</div>
    </div>
  );

  const images = Array.isArray(event.images) ? event.images : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors">
            <FiArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-purple-200 text-sm">
            {event.date && <span className="flex items-center gap-1.5"><FiCalendar className="h-4 w-4" />{formatDate(event.date)}{event.endDate ? ` - ${formatDate(event.endDate)}` : ''}</span>}
            {event.location && <span className="flex items-center gap-1.5"><FiMapPin className="h-4 w-4" />{event.location}</span>}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
              event.status === 'ongoing' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            }`}>{event.status}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {images.map((img, i) => (
                <div key={i} className={`${images.length === 1 ? '' : i === 0 && images.length > 2 ? 'sm:col-span-2' : ''} overflow-hidden`}>
                  <img src={`${API_BASE}${img}`} alt={`${event.title} - image ${i + 1}`} className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
