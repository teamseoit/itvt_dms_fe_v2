import axios from '../../api/axios';

const HOSTING_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/hosting', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/hosting/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/hosting', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/hosting/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/hosting/${id}`);
  },
};

export default HOSTING_PLAN_API; 