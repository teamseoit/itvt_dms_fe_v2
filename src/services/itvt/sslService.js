import axios from '../../api/axios';

const SSL_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/itvt/ssl', { params });
  },

  getById: (id) => {
    return axios.get(`/itvt/ssl/${id}`);
  },

  create: (data) => {
    return axios.post('/itvt/ssl', data);
  },

  update: (id, data) => {
    return axios.put(`/itvt/ssl/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/itvt/ssl/${id}`);
  },
};

export default SSL_SERVICE_API; 