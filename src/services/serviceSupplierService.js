import axios from '../api/axios';

const SERVICE_SUPPLIER_API = {
  getAll: (params = { page: 1, limit: 10 }) => {
    return axios.get('/supplier/service', { params });
  },

  getById: (id) => {
    return axios.get(`/supplier/service/${id}`);
  },

  create: (data) => {
    return axios.post('/supplier/service', data);
  },

  update: (id, data) => {
    return axios.put(`/supplier/service/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/supplier/service/${id}`);
  }
};

export default SERVICE_SUPPLIER_API; 