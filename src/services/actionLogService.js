import axios from '../api/axios';

const ACTION_LOG_API = {
  getAll: (params = { page: 1, limit: 30 }) => {
    return axios.get('/action-logs', { params });
  },
};

export default ACTION_LOG_API; 