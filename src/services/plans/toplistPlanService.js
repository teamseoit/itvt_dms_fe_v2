import axios from '../../api/axios';

const TOPLIST_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/toplist', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/toplist/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/toplist', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/toplist/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/toplist/${id}`);
  },
};

export default TOPLIST_PLAN_API; 