import axios from '../../api/axios';

const CONTENT_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/content', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/content/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/content', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/content/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/content/${id}`);
  },
};

export default CONTENT_PLAN_API; 