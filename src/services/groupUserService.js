import axios from '../api/axios';

const GROUP_USER_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/group-user', { params });
  },

  getById: (id) => {
    return axios.get(`/group-user/${id}`);
  },

  create: (data) => {
    return axios.post('/group-user', data);
  },

  update: (id, data) => {
    return axios.put(`/group-user/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/group-user/${id}`);
  }
};

export default GROUP_USER_API; 