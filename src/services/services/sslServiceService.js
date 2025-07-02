import axios from '../../api/axios';

const SSL_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/services/ssl', { params });
  },

  getById: (id) => {
    return axios.get(`/services/ssl/${id}`);
  },

  create: (data) => {
    return axios.post('/services/ssl', data);
  },

  update: (id, data) => {
    return axios.put(`/services/ssl/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/services/ssl/${id}`);
  },
};

export default SSL_SERVICE_API; 