import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getExecutives, createExecutive, updateExecutive, deleteExecutive } from '../../api/content';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { NIGERIAN_STATES } from '../../utils';

const API_BASE = 'https://api.eopanse.com.ng';

const AdminExecutives = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', businessName: '', office: '', position: '', state: '', isBoardMember: false, image: null, order: 0 });

  const { data: executives, isLoading } = useQuery({
    queryKey: ['admin-executives'],
    queryFn: () => getExecutives().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createExecutive(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-executives'] }); toast.success('Executive added'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateExecutive(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-executives'] }); toast.success('Executive updated'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExecutive,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-executives'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetForm = () => setForm({ name: '', businessName: '', office: '', position: '', state: '', isBoardMember: false, image: null, order: 0 });

  const openEdit = (exec) => {
    setForm({ name: exec.name, businessName: exec.businessName || '', office: exec.office || '', position: exec.position, state: exec.state, isBoardMember: exec.isBoardMember, image: null, order: exec.order || 0 });
    setModal(exec);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'image' && val instanceof File) formData.append('image', val);
      else if (key !== 'image') formData.append(key, val);
    });
    if (modal?.id) updateMutation.mutate({ id: modal.id, data: formData });
    else createMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Executives</h1>
              <p className="text-gray-500 mt-1">Manage EOPANSE executives and board of directors</p>
            </div>
            <button onClick={() => { resetForm(); setModal({}); }} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              <FiPlus className="h-4 w-4" /> Add Executive
            </button>
          </div>

          {isLoading ? <LoadingSpinner className="py-16" /> : !executives?.length ? (
            <div className="card text-center py-16 text-gray-400">
              <FiUsers className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No executives yet</p>
              <p className="text-sm mt-1">Add your first executive to display on the landing page</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {executives.map((exec) => (
                <div key={exec.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex-shrink-0 overflow-hidden">
                      {exec.image ? (
                        <img src={`${API_BASE}${exec.image}`} alt={exec.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-purple-600">
                          {exec.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{exec.name}</h3>
                      {exec.businessName && <p className="text-xs text-gray-500 truncate">{exec.businessName}</p>}
                      <p className="text-sm text-purple-600 font-medium mt-1">{exec.position}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exec.state}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${exec.isBoardMember ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {exec.isBoardMember ? 'Board of Director' : 'Executive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => openEdit(exec)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                      <FiEdit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteId(exec.id)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <FiTrash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modal !== null && (
        <Modal isOpen={modal !== null} onClose={() => { setModal(null); resetForm(); }} title={modal?.id ? 'Edit Executive' : 'Add Executive'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field" placeholder="e.g. President, Secretary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
                <input value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })} className="input-field" placeholder="e.g. National Secretariat" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" required>
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isBoardMember" checked={form.isBoardMember} onChange={(e) => setForm({ ...form, isBoardMember: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <label htmlFor="isBoardMember" className="text-sm text-gray-700">Board of Director</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="input-field text-sm file:border-0 file:bg-purple-50 file:text-purple-700 file:font-medium file:rounded-lg file:px-3 file:py-1.5" />
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary w-full py-2.5">
              {modal?.id ? 'Update Executive' : 'Add Executive'}
            </button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog isOpen={deleteId !== null} onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} title="Delete Executive?" message="This action cannot be undone." />
      )}
    </div>
  );
};

export default AdminExecutives;
