import axios from '../../api/axios';

const EMAIL_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/services/email', { params });
  },

  getById: (id) => {
    return axios.get(`/services/email/${id}`);
  },

  create: (data) => {
    return axios.post('/services/email', data);
  },

  update: (id, data) => {
    return axios.put(`/services/email/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/services/email/${id}`);
  },
};

export default EMAIL_SERVICE_API; 