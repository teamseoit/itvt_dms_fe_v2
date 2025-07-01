import axios from '../../api/axios';

const HOSTING_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/services/hosting', { params });
  },

  getById: (id) => {
    return axios.get(`/services/hosting/${id}`);
  },

  create: (data) => {
    return axios.post('/services/hosting', data);
  },

  update: (id, data) => {
    return axios.put(`/services/hosting/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/services/hosting/${id}`);
  },
};

export default HOSTING_SERVICE_API; 