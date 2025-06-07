import axios from '../api/axios';

const USER_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/users', { params });
  },

  getById: (id) => {
    return axios.get(`/users/${id}`);
  },

  create: (data) => {
    return axios.post('/users', data);
  },

  update: (id, data) => {
    return axios.put(`/users/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/users/${id}`);
  }
};

export default USER_API; 