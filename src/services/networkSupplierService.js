import axios from '../api/axios';

const NETWORK_SUPPLIER_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/supplier/network', { params });
  },

  getById: (id) => {
    return axios.get(`/supplier/network/${id}`);
  },

  create: (data) => {
    return axios.post('/supplier/network', data);
  },

  update: (id, data) => {
    return axios.put(`/supplier/network/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/supplier/network/${id}`);
  }
};

export default NETWORK_SUPPLIER_API; 