import axios from '../../api/axios';

const MAINTENANCE_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/maintenance', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/maintenance/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/maintenance', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/maintenance/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/maintenance/${id}`);
  },
};

export default MAINTENANCE_PLAN_API; 