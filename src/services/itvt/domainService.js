import axios from '../../api/axios';

const DOMAIN_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/itvt/domain', { params });
  },

  getById: (id) => {
    return axios.get(`/itvt/domain/${id}`);
  },

  create: (data) => {
    return axios.post('/itvt/domain', data);
  },

  update: (id, data) => {
    return axios.put(`/itvt/domain/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/itvt/domain/${id}`);
  },
};

export default DOMAIN_SERVICE_API; 