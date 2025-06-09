import axios from '../../api/axios';

const DOMAIN_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/domain', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/domain/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/domain', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/domain/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/domain/${id}`);
  },
};

export default DOMAIN_PLAN_API; 