import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateAdminProfile } from '../../api/admin';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminSettings = () => {
  const { admin } = useAuth();
  const [form, setForm] = useState({ name: admin?.name || '', email: admin?.email || '', currentPassword: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => toast.success('Profile updated successfully!'),
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const { confirmPassword, ...data } = form;
    if (!data.password) delete data.password;
    if (!data.currentPassword) delete data.currentPassword;
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your admin profile and credentials</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-purple-900 flex items-center justify-center">
                <span className="text-white font-black text-xl">{admin?.name?.[0]}</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{admin?.name}</h2>
                <p className="text-gray-500 text-sm">{admin?.email}</p>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full capitalize">{admin?.role}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-bold text-gray-900">Profile Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-9" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-9" required />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-900 mb-5">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type={showPass ? 'text' : 'password'} value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="input-field pl-9" placeholder="Leave blank to keep current" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-9 pr-9" placeholder="New password" minLength={6} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field pl-9" placeholder="Confirm new password" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
                <FiSave className="h-4 w-4" />
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
