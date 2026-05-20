import api from '../lib/api';

export const initiateAccountLink = async (email) => {
    const response = await api.post('/api/account-link/initiate', { email });
    return response.data;
};

export const confirmAccountLink = async (token) => {
    const response = await api.post('/api/account-link/confirm', { token });
    return response.data;
};

export const getPendingAccountLinks = async () => {
    const response = await api.get('/api/account-link/pending');
    return response.data;
};
