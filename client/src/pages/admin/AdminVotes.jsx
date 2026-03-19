import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { getVotes, createVote, updateVote, deleteVote } from '../../api/admin';
import { formatDate, formatCurrency, timeRemaining } from '../../utils';
import { FiPlus, FiEdit, FiTrash2, FiBarChart2, FiCopy } from 'react-icons/fi';

const emptyVote = {
  title: '', description: '', startDate: '', endDate: '', pricePerVote: '', isFree: false,
  maxVotesPerUser: '', category: '', status: 'draft',
  options: [{ title: '', description: '', image: '' }, { title: '', description: '', image: '' }],
};

const VoteForm = ({ form, setForm, onSubmit, loading, editMode, onCancel }) => (
  <div className="space-y-5">
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Vote title" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="e.g. Awards, Elections" />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Vote description" />
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
        <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
        <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" required />
      </div>
    </div>

    <div className="grid sm:grid-cols-3 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Vote (₦)</label>
        <input type="number" value={form.pricePerVote} onChange={(e) => setForm({ ...form, pricePerVote: e.target.value })}
          className="input-field" placeholder="0" disabled={form.isFree} min="0" />
      </div>
      <div className="flex items-end pb-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked, pricePerVote: e.target.checked ? 0 : form.pricePerVote })}
            className="w-4 h-4 text-primary-600 rounded" />
          <span className="text-sm font-medium text-gray-700">Free Vote</span>
        </label>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Votes per User</label>
        <input type="number" value={form.maxVotesPerUser} onChange={(e) => setForm({ ...form, maxVotesPerUser: e.target.value })}
          className="input-field" placeholder="Unlimited" min="1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    {!editMode && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">Vote Options (min. 2) *</label>
          <button type="button" onClick={() => setForm({ ...form, options: [...form.options, { title: '', description: '', image: '' }] })} className="text-sm text-primary-600 hover:underline font-medium">+ Add Option</button>
        </div>
        <div className="space-y-3">
          {form.options.map((opt, i) => {
            const updateOption = (key, val) => {
              const opts = [...form.options];
              opts[i] = { ...opts[i], [key]: val };
              setForm({ ...form, options: opts });
            };
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Option {i + 1}</span>
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  )}
                </div>
                <input value={opt.title} onChange={(e) => updateOption('title', e.target.value)} className="input-field" placeholder="Option title *" required />
                <input value={opt.description} onChange={(e) => updateOption('description', e.target.value)} className="input-field" placeholder="Description (optional)" />
                <input value={opt.image} onChange={(e) => updateOption('image', e.target.value)} className="input-field" placeholder="Image URL (optional)" />
              </div>
            );
          })}
        </div>
      </div>
    )}

    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
      <button type="button" onClick={onSubmit} disabled={loading} className="btn-primary flex-1">
        {loading ? 'Saving...' : editMode ? 'Update Vote' : 'Create Vote'}
      </button>
    </div>
  </div>
);

const AdminVotes = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState(emptyVote);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-votes', page, statusFilter],
    queryFn: () => getVotes({ page, limit: 15, status: statusFilter }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: createVote,
    onSuccess: () => { toast.success('Vote created!'); qc.invalidateQueries(['admin-votes']); setCreateModal(false); setForm(emptyVote); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateVote(id, data),
    onSuccess: () => { toast.success('Vote updated!'); qc.invalidateQueries(['admin-votes']); setEditModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteVote(id),
    onSuccess: () => { toast.success('Vote deleted!'); qc.invalidateQueries(['admin-votes']); setDeleteModal(null); },
    onError: (e) => toast.error(e.response?.data?.message),
  });

  const votes = data?.data?.votes || [];

  const copyShareLink = (vote) => {
    const link = `${window.location.origin}/vote/${vote.shareToken}`;
    navigator.clipboard.writeText(link).then(() => toast.success('Share link copied!'));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Votes & Elections</h1>
              <p className="text-gray-500 mt-1">Manage all voting events</p>
            </div>
            <button onClick={() => { setForm(emptyVote); setCreateModal(true); }} className="btn-primary flex items-center gap-2">
              <FiPlus className="h-4 w-4" /> Create Vote
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex gap-3 flex-wrap">
              {['', 'draft', 'active', 'ended', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vote Cards */}
          {isLoading ? <LoadingSpinner size="lg" className="py-12" /> : (
            <div className="space-y-4">
              {votes.map((vote) => {
                const totalVotes = vote.options?.reduce((s, o) => s + (o.totalVotes || 0), 0) || 0;
                return (
                  <div key={vote.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{vote.title}</h3>
                          <Badge status={vote.status} />
                          {vote.isFree ? <Badge status="free" label="Free" /> : (
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{formatCurrency(vote.pricePerVote)}/vote</span>
                          )}
                          {vote.category && <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{vote.category}</span>}
                        </div>
                        {vote.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{vote.description}</p>}
                        <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                          <span>Start: {formatDate(vote.startDate)}</span>
                          <span>End: {formatDate(vote.endDate)}</span>
                          <span>{vote.options?.length || 0} options</span>
                          <span className="font-semibold text-purple-600">{totalVotes} total votes</span>
                          {vote.status === 'active' && <span className="text-orange-600 font-medium">{timeRemaining(vote.endDate)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                        <Link to={`/admin/votes/${vote.id}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View Results">
                          <FiBarChart2 className="h-4 w-4" />
                        </Link>
                        <button onClick={() => { setForm({ title: vote.title, description: vote.description, startDate: vote.startDate?.slice(0, 16), endDate: vote.endDate?.slice(0, 16), pricePerVote: vote.pricePerVote, isFree: vote.isFree, maxVotesPerUser: vote.maxVotesPerUser || '', category: vote.category || '', status: vote.status, options: [] }); setEditModal(vote.id); }} className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Edit">
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => copyShareLink(vote)} className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors" title="Copy Share Link">
                          <FiCopy className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteModal(vote.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options preview */}
                    {vote.options?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2 flex-wrap">
                          {vote.options.map((opt) => {
                            const pct = totalVotes > 0 ? ((opt.totalVotes || 0) / totalVotes * 100).toFixed(0) : 0;
                            return (
                              <div key={opt.id} className="flex-1 min-w-[120px] bg-gray-50 rounded-lg p-2">
                                <p className="text-xs font-semibold text-gray-700 truncate">{opt.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium">{opt.totalVotes || 0}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {votes.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <FiBarChart2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No votes found. Create your first vote!</p>
                </div>
              )}
            </div>
          )}

          <Pagination page={page} pages={data?.data?.pages || 1} onPage={setPage} />
        </div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Vote" size="lg">
        <VoteForm
          form={form}
          setForm={setForm}
          onSubmit={() => createMut.mutate(form)}
          onClose={() => setCreateModal(false)}
          loading={createMut.isPending}
          editMode={false}
          onCancel={() => setCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Vote" size="lg">
        <VoteForm
          form={form}
          setForm={setForm}
          onSubmit={() => updateMut.mutate({ id: editModal, data: form })}
          onClose={() => setEditModal(null)}
          loading={updateMut.isPending}
          editMode={true}
          onCancel={() => setEditModal(null)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={() => deleteMut.mutate(deleteModal)}
        title="Delete Vote"
        message="Are you sure you want to delete this vote? All vote records will be lost."
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default AdminVotes;
