const statusConfig = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  ended: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  upcoming: 'bg-indigo-100 text-indigo-800',
  free: 'bg-teal-100 text-teal-800',
};

const Badge = ({ status, label, className = '' }) => {
  const cls = statusConfig[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls} ${className}`}>
      {label || status}
    </span>
  );
};

export default Badge;
