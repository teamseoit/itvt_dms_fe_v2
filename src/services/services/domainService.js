import axios from '../../api/axios';

const DOMAIN_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/services/domain', { params });
  },

  getById: (id) => {
    return axios.get(`/services/domain/${id}`);
  },

  create: (data) => {
    return axios.post('/services/domain', data);
  },

  update: (id, data) => {
    return axios.put(`/services/domain/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/services/domain/${id}`);
  },
};

export default DOMAIN_SERVICE_API; 