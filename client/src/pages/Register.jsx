import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePaystackPayment } from 'react-paystack';
import { registerUser, verifyRegistrationPayment } from '../api/auth';
import { getRegistrationFee } from '../api/admin';
import { NIGERIAN_STATES, formatCurrency } from '../utils';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiEye, FiEyeOff, FiBriefcase, FiLock } from 'react-icons/fi';
import Logo from '../components/ui/Logo';

const RegistrationPayment = ({ registered, email, fee, onDone }) => {
  const [verifying, setVerifying] = useState(false);
  const [activated, setActivated] = useState(false);

  const config = {
    reference: registered.paymentRef,
    email,
    amount: Math.round(fee * 100), // kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: { userId: registered.userId, userCode: registered.userCode },
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    initializePayment(
      async (ref) => {
        setVerifying(true);
        try {
          await verifyRegistrationPayment({ reference: ref.reference, userId: registered.userId });
          toast.success('Payment confirmed! Account activated.');
          setActivated(true);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Verification failed. Contact admin.');
        } finally {
          setVerifying(false);
        }
      },
      () => toast('Payment cancelled. You can pay later by contacting admin.')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        {activated ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Account Activated!</h2>
            <p className="text-gray-600 mb-6">Your payment was confirmed and your account is now active.</p>
            <button onClick={onDone} className="btn-primary w-full py-3">Go to Login</button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-purple-600 text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Almost Done!</h2>
            <p className="text-gray-600 mb-6">Complete your registration fee payment to activate your account.</p>

            <div className="bg-purple-50 rounded-xl p-5 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member Code</span>
                <span className="font-bold text-purple-700 font-mono">{registered.userCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Due</span>
                <span className="font-bold text-gray-900">{formatCurrency(fee)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={verifying}
              className="btn-primary w-full py-3 mb-3"
            >
              {verifying ? 'Verifying Payment...' : `Pay ${formatCurrency(fee)} with Paystack`}
            </button>
            <p className="text-xs text-gray-400">Secured by Paystack. Your card details are never stored.</p>
          </>
        )}
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    businessName: '', address: '', city: '', state: '',
  });
  const [step, setStep] = useState(1);
  const [registered, setRegistered] = useState(null);

  const { data: feeData } = useQuery({
    queryKey: ['registrationFee'],
    queryFn: getRegistrationFee,
  });
  const fee = feeData?.data?.fee || 5000;

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => setRegistered(res.data),
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const { confirmPassword, ...data } = form;
    mutation.mutate(data);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (registered) {
    return <RegistrationPayment registered={registered} email={form.email} fee={fee} onDone={() => navigate('/login')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors">
          <FiArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <Logo size="md" className="brightness-0 invert" />
              <h1 className="text-2xl font-black">Join EOPANSE</h1>
            </div>
            <p className="text-purple-200">Complete your membership registration</p>
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-1.5 rounded-full flex-1 ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`h-1.5 rounded-full flex-1 ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
            <div className="flex justify-between text-xs text-purple-300 mt-1">
              <span>Personal Info</span>
              <span>Business Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input value={form.name} onChange={set('name')} className="input-field pl-9" placeholder="John Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type="email" value={form.email} onChange={set('email')} className="input-field pl-9" placeholder="john@example.com" required />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input type="tel" value={form.phone} onChange={set('phone')} className="input-field pl-9" placeholder="08012345678" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pl-9 pr-9" placeholder="••••••••" required minLength={6} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-field pl-9" placeholder="••••••••" required />
                    </div>
                  </div>
                </div>

                <button type="button" onClick={() => { if (!form.name || !form.email || !form.phone || !form.password) { toast.error('Fill all fields'); return; } setStep(2); }} className="btn-primary w-full text-center py-3">
                  Continue to Business Details →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                    <FiArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">Business Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input value={form.businessName} onChange={set('businessName')} className="input-field pl-9" placeholder="Your Business Name" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                    <textarea value={form.address} onChange={set('address')} className="input-field pl-9 resize-none" rows={3} placeholder="Street address" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input value={form.city} onChange={set('city')} className="input-field" placeholder="Your city" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                    <select value={form.state} onChange={set('state')} className="input-field" required>
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fee notice */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-purple-800 mb-1">Registration Fee: {formatCurrency(fee)}</p>
                  <p className="text-purple-600">Payment instructions will be provided after registration. Your account will be activated once payment is confirmed.</p>
                </div>

                <button type="submit" disabled={mutation.isPending} className="btn-primary w-full text-center py-3">
                  {mutation.isPending ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </form>

          <div className="px-8 pb-8 text-center text-gray-500 text-sm">
            Already a member? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
