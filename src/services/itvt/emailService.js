import axios from '../../api/axios';

const EMAIL_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/itvt/email', { params });
  },

  getById: (id) => {
    return axios.get(`/itvt/email/${id}`);
  },

  create: (data) => {
    return axios.post('/itvt/email', data);
  },

  update: (id, data) => {
    return axios.put(`/itvt/email/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/itvt/email/${id}`);
  },
};

export default EMAIL_SERVICE_API; 