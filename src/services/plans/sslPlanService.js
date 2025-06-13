import axios from '../../api/axios';

const SSL_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/ssl', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/ssl/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/ssl', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/ssl/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/ssl/${id}`);
  },
};

export default SSL_PLAN_API; 