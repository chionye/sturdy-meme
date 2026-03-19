import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginAdmin } from '../api/auth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (res) => {
      loginAsAdmin(res.data.token, res.data.admin);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors">
          <FiArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-purple-900 mx-auto flex items-center justify-center mb-4">
              <FiShield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Admin Access</h1>
            <p className="text-gray-500 mt-1">EOPANSE Administration Portal</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="admin@eopanse.com.ng"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={mutation.isPending} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-5 rounded-lg transition-all disabled:opacity-50">
              {mutation.isPending ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link to="/login" className="text-primary-600 hover:underline">Member Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
