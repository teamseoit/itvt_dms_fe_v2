import axios from '../api/axios';

const CUSTOMER_API = {
  getAll: (params = { page: 1, limit: 10, typeCustomer: '', keyword: '' }) => {
    return axios.get('/customer', { params });
  },

  getById: (id) => {
    return axios.get(`/customer/${id}`);
  },

  create: (data) => {
    return axios.post('/customer', data);
  },

  update: (id, data) => {
    return axios.put(`/customer/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/customer/${id}`);
  }
};

export default CUSTOMER_API; 