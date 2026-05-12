import api from './axios';

export const getExecutives = (params) => api.get('/content/executives', { params });
export const getEvents = (params) => api.get('/content/events', { params });
export const getEvent = (id) => api.get(`/content/events/${id}`);
export const getActiveHeroSlides = () => api.get('/content/hero-slides/active');
export const getAllHeroSlides = () => api.get('/content/hero-slides');

export const createExecutive = (data) => api.post('/content/executives', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateExecutive = (id, data) => api.put(`/content/executives/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteExecutive = (id) => api.delete(`/content/executives/${id}`);

export const createEvent = (data) => api.post('/content/events', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateEvent = (id, data) => api.put(`/content/events/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteEvent = (id) => api.delete(`/content/events/${id}`);

export const createHeroSlide = (data) => api.post('/content/hero-slides', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateHeroSlide = (id, data) => api.put(`/content/hero-slides/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteHeroSlide = (id) => api.delete(`/content/hero-slides/${id}`);
