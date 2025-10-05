import axios from '../../api/axios';

const WEBSITE_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/services/website', { params });
  },

  getById: (id) => {
    return axios.get(`/services/website/${id}`);
  },

  create: (data) => {
    return axios.post('/services/website', data);
  },

  update: (id, data) => {
    return axios.put(`/services/website/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/services/website/${id}`);
  },
};

export default WEBSITE_SERVICE_API;
