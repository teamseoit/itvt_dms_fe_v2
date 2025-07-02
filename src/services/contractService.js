import axios from '../api/axios';

const CONTRACT_API = {
  getAll: (params = { page: 1, limit: 10, keyword: '' }) => {
    return axios.get('/contracts', { params });
  },

  getById: (id) => {
    return axios.get(`/contracts/${id}`);
  },

  update: (id, data) => {
    return axios.put(`/contracts/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/contracts/${id}`);
  },

  getPaymentHistory: (id) => {
    return axios.get(`/contracts/${id}/payment-history`);
  },
};

export default CONTRACT_API; 