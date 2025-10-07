import axios from '../../api/axios';

const HOSTING_SERVICE_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/itvt/hosting', { params });
  },

  getById: (id) => {
    return axios.get(`/itvt/hosting/${id}`);
  },

  create: (data) => {
    return axios.post('/itvt/hosting', data);
  },

  update: (id, data) => {
    return axios.put(`/itvt/hosting/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/itvt/hosting/${id}`);
  },
};

export default HOSTING_SERVICE_API; 