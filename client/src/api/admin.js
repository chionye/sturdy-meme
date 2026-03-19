import api from './axios';

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');
export const getFinancials = (params) => api.get('/admin/financials', { params });
export const confirmPayment = (data) => api.post('/admin/payments/confirm', data);
export const updateAdminProfile = (data) => api.put('/admin/profile', data);
export const getRegistrationFee = () => api.get('/admin/settings/registration-fee');

// Users
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const suspendUser = (id) => api.post(`/admin/users/${id}/suspend`);
export const activateUser = (id) => api.post(`/admin/users/${id}/activate`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const sendVotingLink = (data) => api.post('/admin/users/send-voting-link', data);
export const getUserVotingLink = (id, voteId) => api.get(`/admin/users/${id}/voting-link`, { params: { voteId } });

// Votes
export const createVote = (data) => api.post('/admin/votes', data);
export const getVotes = (params) => api.get('/admin/votes', { params });
export const getVote = (id) => api.get(`/admin/votes/${id}`);
export const updateVote = (id, data) => api.put(`/admin/votes/${id}`, data);
export const deleteVote = (id) => api.delete(`/admin/votes/${id}`);
export const getVoteResults = (id) => api.get(`/admin/votes/${id}/results`);
