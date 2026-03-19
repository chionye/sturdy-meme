import { useAuth } from '../../context/AuthContext';
import UserSidebar from '../../components/layout/UserSidebar';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user } = useAuth();

  const copyLink = () => {
    const link = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied!'));
  };

  const fields = [
    { label: 'Full Name', value: user?.name, icon: FiUser },
    { label: 'Email', value: user?.email, icon: FiMail },
    { label: 'Phone', value: user?.phone, icon: FiPhone },
    { label: 'Business Name', value: user?.businessName, icon: FiBriefcase },
    { label: 'Address', value: user?.address, icon: FiMapPin },
    { label: 'City', value: user?.city, icon: FiMapPin },
    { label: 'State', value: `${user?.state} (${user?.stateCode})`, icon: FiMapPin },
    { label: 'Member Since', value: formatDate(user?.createdAt), icon: FiUser },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Your EOPANSE membership details</p>
          </div>

          {/* Profile Hero */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
                {user?.name?.[0]}
              </div>
              <div>
                <h2 className="font-black text-xl">{user?.name}</h2>
                <p className="text-purple-200">{user?.businessName}</p>
                <Badge status={user?.status} className="mt-1" />
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-purple-200 text-xs mb-1">Member Code</p>
              <p className="font-black text-2xl font-mono">{user?.userCode}</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="card mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Membership Details</h3>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.label} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <field.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{field.label}</p>
                    <p className="text-gray-900 font-semibold mt-0.5">{field.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voting Link */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2">Your Voting Link</h3>
            <p className="text-gray-500 text-sm mb-4">Share this link to let others know about the voting platform</p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <p className="flex-1 text-sm text-gray-700 font-mono truncate">{window.location.origin}/dashboard</p>
              <button onClick={copyLink} className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:underline flex-shrink-0">
                <FiCopy className="h-4 w-4" /> Copy
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
