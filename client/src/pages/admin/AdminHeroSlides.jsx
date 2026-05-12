import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '../../api/content';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

const API_BASE = 'https://api.eopanse.com.ng';

const AdminHeroSlides = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', isActive: true, image: null, order: 0 });

  const { data: slides, isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: () => getAllHeroSlides().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createHeroSlide(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] }); toast.success('Slide added'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateHeroSlide(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] }); toast.success('Slide updated'); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHeroSlide,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetForm = () => setForm({ title: '', subtitle: '', isActive: true, image: null, order: 0 });

  const openEdit = (slide) => {
    setForm({ title: slide.title || '', subtitle: slide.subtitle || '', isActive: slide.isActive, image: null, order: slide.order || 0 });
    setModal(slide);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle);
    formData.append('isActive', String(form.isActive));
    formData.append('order', String(form.order));
    if (form.image instanceof File) formData.append('image', form.image);

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
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Hero Slides</h1>
              <p className="text-gray-500 mt-1">Manage hero carousel images for the landing page</p>
            </div>
            <button onClick={() => { resetForm(); setModal({}); }} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              <FiPlus className="h-4 w-4" /> Add Slide
            </button>
          </div>

          {isLoading ? <LoadingSpinner className="py-16" /> : !slides?.length ? (
            <div className="card text-center py-16 text-gray-400">
              <FiImage className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No slides yet</p>
              <p className="text-sm mt-1">Add hero slides to display on the landing page carousel</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {slides.map((slide) => (
                <div key={slide.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-100">
                    <img src={`${API_BASE}${slide.image}`} alt={slide.title || 'Hero slide'} className="w-full h-full object-cover" />
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="p-4">
                    {slide.title && <h3 className="font-bold text-gray-900 truncate">{slide.title}</h3>}
                    {slide.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{slide.subtitle}</p>}
                    <p className="text-xs text-gray-400 mt-1">Order: {slide.order}</p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => openEdit(slide)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                        <FiEdit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteId(slide.id)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <FiTrash2 className="h-3.5 w-3.5" /> Delete
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
        <Modal isOpen={modal !== null} onClose={() => { setModal(null); resetForm(); }} title={modal?.id ? 'Edit Slide' : 'Add Slide'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Slide headline" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" placeholder="Slide subtext" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="input-field text-sm file:border-0 file:bg-purple-50 file:text-purple-700 file:font-medium file:rounded-lg file:px-3 file:py-1.5" required={!modal?.id} />
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary w-full py-2.5">
              {modal?.id ? 'Update Slide' : 'Add Slide'}
            </button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog isOpen={deleteId !== null} onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} title="Delete Slide?" message="This action cannot be undone." />
      )}
    </div>
  );
};

export default AdminHeroSlides;
