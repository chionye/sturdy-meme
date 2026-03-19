import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { getUsers, getUserById, updateUser, suspendUser, activateUser, deleteUser, sendVotingLink, getUserVotingLink, getVotes } from '../../api/admin';
import { formatDate, formatCurrency, NIGERIAN_STATES } from '../../utils';
import {
  FiSearch, FiUser, FiMail, FiPhone, FiMapPin, FiLink, FiSend,
  FiEdit, FiTrash2, FiEye, FiSlash, FiUserCheck, FiCopy, FiFilter,
} from 'react-icons/fi';

const AdminUsers = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [sendLinkUser, setSendLinkUser] = useState(null);
  const [selectedVoteId, setSelectedVoteId] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, statusFilter],
    queryFn: () => getUsers({ page, limit: 15, search, status: statusFilter }),
    keepPreviousData: true,
  });

  const { data: votesData } = useQuery({
    queryKey: ['admin-votes-list'],
    queryFn: () => getVotes({ status: 'active' }),
  });

  const { data: userDetail, isLoading: loadingUser } = useQuery({
    queryKey: ['admin-user', viewUser],
    queryFn: () => getUserById(viewUser),
    enabled: !!viewUser,
  });

  const [pendingStatusId, setPendingStatusId] = useState(null);

  const suspendMut = useMutation({
    mutationFn: (id) => suspendUser(id),
    onSuccess: () => { toast.success('User suspended'); qc.invalidateQueries(['admin-users']); setPendingStatusId(null); },
    onError: (e) => { toast.error(e.response?.data?.message); setPendingStatusId(null); },
  });

  const activateMut = useMutation({
    mutationFn: (id) => activateUser(id),
    onSuccess: () => { toast.success('User activated'); qc.invalidateQueries(['admin-users']); setPendingStatusId(null); },
    onError: (e) => { toast.error(e.response?.data?.message); setPendingStatusId(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['admin-users']); setDeleteModal(null); },
    onError: (e) => toast.error(e.response?.data?.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries(['admin-users']); setEditUser(null); },
    onError: (e) => toast.error(e.response?.data?.message),
  });

  const sendLinkMut = useMutation({
    mutationFn: (data) => sendVotingLink(data),
    onSuccess: () => { toast.success('Voting link sent!'); setSendLinkUser(null); },
    onError: (e) => toast.error(e.response?.data?.message),
  });

  const users = data?.data?.users || [];
  const totalPages = data?.data?.pages || 1;
  const total = data?.data?.total || 0;

  const copyVotingLink = async (user) => {
    const link = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied!'));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Members</h1>
              <p className="text-gray-500 mt-1">{total} total members</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9" placeholder="Search by name, email, code..."
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 h-4 w-4" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-40">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            {isLoading ? <LoadingSpinner size="lg" className="py-12" /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Member', 'Code', 'Phone', 'State', 'Business', 'Status', 'Joined', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{user.name[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-purple-700 font-bold text-sm">{user.userCode}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.state}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{user.businessName}</td>
                        <td className="px-4 py-3"><Badge status={user.status} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewUser(user.id)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View">
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button onClick={() => { setEditUser(user.id); setEditForm({ name: user.name, email: user.email, phone: user.phone, businessName: user.businessName, city: user.city, state: user.state, status: user.status }); }} className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Edit">
                              <FiEdit className="h-4 w-4" />
                            </button>
                            {pendingStatusId === user.id ? (
                              <span className="p-1.5"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" /></span>
                            ) : user.status === 'active' ? (
                              <button onClick={() => { setPendingStatusId(user.id); suspendMut.mutate(user.id); }} className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors" title="Suspend">
                                <FiSlash className="h-4 w-4" />
                              </button>
                            ) : (
                              <button onClick={() => { setPendingStatusId(user.id); activateMut.mutate(user.id); }} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Activate">
                                <FiUserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => setSendLinkUser(user)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Send Voting Link">
                              <FiSend className="h-4 w-4" />
                            </button>
                            <button onClick={() => copyVotingLink(user)} className="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors" title="Copy Voting Link">
                              <FiCopy className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteModal(user.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No members found</div>
                )}
              </div>
            )}
          </div>

          <Pagination page={page} pages={totalPages} onPage={setPage} />
        </div>
      </main>

      {/* View User Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="Member Details" size="lg">
        {loadingUser ? <LoadingSpinner className="py-8" /> : userDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-2xl">{userDetail.data.name[0]}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userDetail.data.name}</h3>
                <p className="text-gray-500">{userDetail.data.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-purple-700 font-bold">{userDetail.data.userCode}</span>
                  <Badge status={userDetail.data.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Phone', value: userDetail.data.phone, icon: FiPhone },
                { label: 'Business', value: userDetail.data.businessName, icon: FiUser },
                { label: 'City', value: userDetail.data.city, icon: FiMapPin },
                { label: 'State', value: `${userDetail.data.state} (${userDetail.data.stateCode})`, icon: FiMapPin },
                { label: 'Address', value: userDetail.data.address, icon: FiMapPin },
                { label: 'Joined', value: formatDate(userDetail.data.createdAt), icon: FiUser },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {userDetail.data.payments?.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Payment History</h4>
                <div className="space-y-2">
                  {userDetail.data.payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="capitalize text-gray-600">{p.type} - {p.reference}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(p.amount)}</span>
                        <Badge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Member" size="md">
        <div className="space-y-4">
          {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['businessName', 'Business Name', 'text'], ['city', 'City', 'text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={editForm[key] || ''} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="input-field">
              {NIGERIAN_STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => updateMut.mutate({ id: editUser, data: editForm })} disabled={updateMut.isPending} className="btn-primary flex-1">
              {updateMut.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Voting Link Modal */}
      <Modal isOpen={!!sendLinkUser} onClose={() => setSendLinkUser(null)} title="Send Voting Link" size="sm">
        {sendLinkUser && (
          <div className="space-y-4">
            <p className="text-gray-600">Send voting link to <strong>{sendLinkUser.name}</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vote (optional)</label>
              <select value={selectedVoteId} onChange={(e) => setSelectedVoteId(e.target.value)} className="input-field">
                <option value="">General login link</option>
                {votesData?.data?.votes?.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSendLinkUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => sendLinkMut.mutate({ userId: sendLinkUser.id, voteId: selectedVoteId })} disabled={sendLinkMut.isPending} className="btn-primary flex-1">
                {sendLinkMut.isPending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={() => deleteMut.mutate(deleteModal)}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmText="Delete"
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default AdminUsers;
