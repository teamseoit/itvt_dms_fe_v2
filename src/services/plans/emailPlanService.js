import axios from '../../api/axios';

const EMAIL_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/email', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/email/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/email', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/email/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/email/${id}`);
  },
};

export default EMAIL_PLAN_API; 