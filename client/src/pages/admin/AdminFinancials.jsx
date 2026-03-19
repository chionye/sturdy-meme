import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { getFinancials, confirmPayment } from '../../api/admin';
import { formatCurrency, formatDateTime } from '../../utils';
import { FiDollarSign, FiFilter, FiPrinter, FiCheck } from 'react-icons/fi';

const AdminFinancials = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [confirmRef, setConfirmRef] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-financials', page, typeFilter, statusFilter],
    queryFn: () => getFinancials({ page, limit: 20, type: typeFilter, status: statusFilter }),
    keepPreviousData: true,
  });

  const confirmMut = useMutation({
    mutationFn: (reference) => confirmPayment({ reference }),
    onSuccess: () => {
      toast.success('Payment confirmed! User account activated.');
      qc.invalidateQueries(['admin-financials']);
      setConfirmModal(null);
      setConfirmRef('');
    },
    onError: (e) => toast.error(e.response?.data?.message),
  });

  const d = data?.data;
  const totals = d?.totals || [];
  const regTotal = totals.find((t) => t.type === 'registration')?.total || 0;
  const voteTotal = totals.find((t) => t.type === 'vote')?.total || 0;
  const regCount = totals.find((t) => t.type === 'registration')?.count || 0;
  const voteCount = totals.find((t) => t.type === 'vote')?.count || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Financials</h1>
              <p className="text-gray-500 mt-1">Revenue and payment tracking</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(true)} className="btn-secondary flex items-center gap-2">
                <FiCheck className="h-4 w-4" /> Confirm Payment
              </button>
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 print:hidden">
                <FiPrinter className="h-4 w-4" /> Print Report
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Registration Revenue</p>
              <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(regTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">{regCount} payments</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Vote Revenue</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{formatCurrency(voteTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">{voteCount} payments</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(parseFloat(regTotal) + parseFloat(voteTotal))}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 font-medium">Total Transactions</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{d?.total || 0}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6 flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 h-4 w-4" />
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-40">
                <option value="">All Types</option>
                <option value="registration">Registration</option>
                <option value="vote">Vote</option>
              </select>
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-40">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            {isLoading ? <LoadingSpinner size="lg" className="py-12" /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Member', 'Type', 'Amount', 'Reference', 'Status', 'Date'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(d?.payments || []).map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {p.user ? (
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{p.user.name}</p>
                              <p className="text-xs text-gray-500">{p.user.email}</p>
                              <p className="text-xs font-mono text-purple-600">{p.user.userCode}</p>
                            </div>
                          ) : <span className="text-gray-400 text-sm">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.type === 'registration' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.reference}</td>
                        <td className="px-4 py-3"><Badge status={p.status} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(d?.payments || []).length === 0 && (
                  <div className="text-center py-12 text-gray-400">No payments found</div>
                )}
              </div>
            )}
          </div>

          <Pagination page={page} pages={d?.pages || 1} onPage={setPage} />
        </div>
      </main>

      {/* Confirm Payment Modal */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Payment" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Enter the payment reference to manually confirm a payment. This will also activate the user's account if it's a registration payment.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
            <input value={confirmRef} onChange={(e) => setConfirmRef(e.target.value)} className="input-field font-mono" placeholder="REG-1234567890-1" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => confirmMut.mutate(confirmRef)} disabled={!confirmRef || confirmMut.isPending} className="btn-primary flex-1">
              {confirmMut.isPending ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminFinancials;
