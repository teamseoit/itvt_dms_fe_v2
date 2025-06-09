import axios from '../api/axios';

const SERVER_SUPPLIER_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/supplier/server', { params });
  },

  getById: (id) => {
    return axios.get(`/supplier/server/${id}`);
  },

  create: (data) => {
    return axios.post('/supplier/server', data);
  },

  update: (id, data) => {
    return axios.put(`/supplier/server/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/supplier/server/${id}`);
  }
};

export default SERVER_SUPPLIER_API; 