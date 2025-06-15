import axios from '../api/axios';

const IP_WHITELIST_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/ip-whitelist', { params });
  },

  create: (data) => {
    return axios.post('/ip-whitelist', data);
  },

  update: (id, data) => {
    return axios.put(`/ip-whitelist/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/ip-whitelist/${id}`);
  }
};

export default IP_WHITELIST_API; 