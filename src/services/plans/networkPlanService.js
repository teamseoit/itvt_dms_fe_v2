import axios from '../../api/axios';

const NETWORK_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/network', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/network/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/network', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/network/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/network/${id}`);
  },
};

export default NETWORK_PLAN_API; 