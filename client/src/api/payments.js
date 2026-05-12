import api from './axios';

export const getPaymentTypes = () => api.get('/payments/types');
export const initiateMemberPayment = (data) => api.post('/payments/initiate', data);
export const verifyMemberPayment = (data) => api.post('/payments/verify', data);
export const getUserPayments = () => api.get('/payments/my');
export const getAllMemberPayments = (params) => api.get('/payments/all', { params });
