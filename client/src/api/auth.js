import api from './axios';

export const loginUser = (data) => api.post('/auth/login', data, { skipAuthRedirect: true });
export const loginAdmin = (data) => api.post('/auth/admin/login', data, { skipAuthRedirect: true });
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const getAdminMe = () => api.get('/auth/admin/me');
export const verifyRegistrationPayment = (data) => api.post('/auth/verify-payment', data);
