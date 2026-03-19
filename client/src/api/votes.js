import api from './axios';

export const getVotes = () => api.get('/votes');
export const getVoteByToken = (token) => api.get(`/votes/token/${token}`);
export const castVote = (data) => api.post('/votes/cast', data);
export const getVoteHistory = () => api.get('/votes/history');
export const getLeaderboard = (id) => api.get(`/votes/${id}/leaderboard`);
export const resolveVotingLink = (token) => api.get(`/votes/voting-link/${token}`);
