import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import UserSidebar from '../../components/layout/UserSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { getPaymentTypes, initiateMemberPayment, verifyMemberPayment, getUserPayments } from '../../api/payments';
import { formatCurrency, formatDate } from '../../utils';
import { FiCreditCard, FiDollarSign, FiHeart } from 'react-icons/fi';
import { FLW_PUBLIC_KEY } from '../../constants/config';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';

const UserPayments = () => {
  const { user } = useAuth();
  const { data: typesData, isLoading: loadingTypes } = useQuery({
    queryKey: ['payment-types'],
    queryFn: getPaymentTypes,
  });
  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['user-payments'],
    queryFn: getUserPayments,
  });

  const [selectedType, setSelectedType] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const initiateMutation = useMutation({
    mutationFn: initiateMemberPayment,
    onSuccess: (res) => {
      setPaymentRef(res.data.payment);
      toast.success('Payment initiated! Proceed to payment gateway.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to initiate payment'),
  });

  const types = typesData?.data?.types || {};
  const amounts = typesData?.data?.amounts || {};
  const payments = paymentsData?.data || [];

  const paymentIcons = {
    conference_fee: FiCreditCard,
    yearly_dues: FiDollarSign,
    funeral_levy: FiHeart,
    other: FiCreditCard,
  };

  const handleInitiate = () => {
    if (!selectedType) return toast.error('Select a payment type');
    const amount = selectedType === 'other' ? parseFloat(customAmount) : (amounts[selectedType] || 0);
    if (!amount || amount <= 0) return toast.error('Invalid amount');
    initiateMutation.mutate({ type: selectedType, amount });
  };

  const fwConfig = paymentRef ? {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: paymentRef.reference,
    amount: paymentRef.amount,
    currency: 'NGN',
    payment_options: 'card,ussd,mobilemoneyghana',
    customer: {
      email: user?.email || 'member@eopanse.com.ng',
      name: user?.name || 'EOPANSE Member',
    },
    customizations: {
      title: 'EOPANSE Payment',
      description: paymentRef.description || 'Member Payment',
    },
    callback: async (response) => {
      if (response.status === 'successful' || response.status === 'completed') {
        setVerifying(true);
        try {
          await verifyMemberPayment({
            reference: String(response.transaction_id),
            paymentRef: paymentRef.reference,
          });
          toast.success('Payment confirmed!');
          setPaymentRef(null);
          refetchPayments();
          closePaymentModal();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Verification failed. Contact admin.');
        } finally {
          setVerifying(false);
        }
      }
    },
    onClose: () => {
      if (!verifying) toast('Payment window closed.');
    },
  } : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Make payments and view your payment history</p>
          </div>

          {/* Make Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Make a Payment</h2>
            {paymentRef ? (
              <div className="bg-purple-50 rounded-xl p-5 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <FiCreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Your Payment</h3>
                <p className="text-gray-600 text-sm mb-4">{paymentRef.description}</p>
                <div className="bg-white rounded-xl p-4 mb-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-900">{formatCurrency(paymentRef.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs text-purple-700">{paymentRef.reference}</span>
                  </div>
                </div>
                {fwConfig && (
                  <FlutterWaveButton {...fwConfig} className="btn-primary w-full py-3 mb-2">
                    {verifying ? 'Verifying...' : `Pay ${formatCurrency(paymentRef.amount)}`}
                  </FlutterWaveButton>
                )}
                <button onClick={() => setPaymentRef(null)} className="text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {Object.entries(types).map(([key, val]) => {
                    const Icon = paymentIcons[key] || FiCreditCard;
                    const amt = key === 'other' ? customAmount : (amounts[key] || 0);
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedType(key); setCustomAmount(''); }}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selectedType === key
                            ? 'border-purple-600 bg-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${selectedType === key ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className={`font-semibold text-sm ${selectedType === key ? 'text-purple-900' : 'text-gray-900'}`}>{val.label}</p>
                        {key !== 'other' && (
                          <p className={`text-xs mt-1 ${selectedType === key ? 'text-purple-600' : 'text-gray-500'}`}>
                            {formatCurrency(amt)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedType === 'other' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN)</label>
                    <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="input-field" placeholder="Enter amount" min="1" />
                  </div>
                )}
                {selectedType && (
                  <button onClick={handleInitiate} disabled={initiateMutation.isPending} className="btn-primary w-full py-3">
                    {initiateMutation.isPending ? 'Processing...' : `Proceed to Pay ${selectedType === 'other' && customAmount ? formatCurrency(customAmount) : selectedType && amounts[selectedType] ? formatCurrency(amounts[selectedType]) : ''}`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment History</h2>
            {loadingPayments ? <LoadingSpinner className="py-8" /> : payments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiDollarSign className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No payment history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FiDollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm capitalize">{p.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                      <Badge status={p.status} className="text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPayments;
