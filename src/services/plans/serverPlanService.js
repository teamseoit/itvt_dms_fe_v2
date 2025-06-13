import axios from '../../api/axios';

const SERVER_PLAN_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/plans/server', { params });
  },

  getById: (id) => {
    return axios.get(`/plans/server/${id}`);
  },

  create: (data) => {
    return axios.post('/plans/server', data);
  },

  update: (id, data) => {
    return axios.put(`/plans/server/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/plans/server/${id}`);
  },
};

export default SERVER_PLAN_API; 