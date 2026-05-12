import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/content';
import { formatDate } from '../../utils';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin } from 'react-icons/fi';

const API_BASE = 'https://api.eopanse.com.ng';

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', endDate: '', location: '', status: 'upcoming', images: [] });

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => getEvents().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createEvent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event created'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event updated'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetForm = () => setForm({ title: '', description: '', date: '', endDate: '', location: '', status: 'upcoming', images: [] });

  const openEdit = (event) => {
    setForm({ title: event.title, description: event.description || '', date: event.date || '', endDate: event.endDate || '', location: event.location || '', status: event.status, images: [] });
    setModal(event);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('date', form.date);
    if (form.endDate) formData.append('endDate', form.endDate);
    formData.append('location', form.location);
    formData.append('status', form.status);
    Array.from(form.images).forEach((img) => formData.append('images', img));

    if (modal?.id) updateMutation.mutate({ id: modal.id, data: formData });
    else createMutation.mutate(formData);
  };

  const statusBadge = (status) => {
    const colors = { upcoming: 'bg-blue-100 text-blue-700', ongoing: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600' };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || colors.upcoming}`}>{status}</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Events</h1>
              <p className="text-gray-500 mt-1">Manage upcoming events displayed on the landing page</p>
            </div>
            <button onClick={() => { resetForm(); setModal({}); }} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              <FiPlus className="h-4 w-4" /> Add Event
            </button>
          </div>

          {isLoading ? <LoadingSpinner className="py-16" /> : !events?.length ? (
            <div className="card text-center py-16 text-gray-400">
              <FiCalendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No events yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-5">
                    {event.images?.[0] && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 hidden sm:block">
                        <img src={`${API_BASE}${event.images[0]}`} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                        </div>
                        {statusBadge(event.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FiCalendar className="h-3.5 w-3.5" />{event.date && formatDate(event.date)}</span>
                        {event.location && <span className="flex items-center gap-1"><FiMapPin className="h-3.5 w-3.5" />{event.location}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => openEdit(event)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modal !== null && (
        <Modal isOpen={modal !== null} onClose={() => { setModal(null); resetForm(); }} title={modal?.id ? 'Edit Event' : 'Add Event'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={4} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Venue, City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images (multiple)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, images: e.target.files })} className="input-field text-sm file:border-0 file:bg-purple-50 file:text-purple-700 file:font-medium file:rounded-lg file:px-3 file:py-1.5" />
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary w-full py-2.5">
              {modal?.id ? 'Update Event' : 'Create Event'}
            </button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog isOpen={deleteId !== null} onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} title="Delete Event?" message="This action cannot be undone." />
      )}
    </div>
  );
};

export default AdminEvents;
