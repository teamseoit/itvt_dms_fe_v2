import axios from 'axios';

const PERMISSION_API = {
  getPermissions: async () => {
    const token = localStorage.getItem('token');
    return axios.get(`${import.meta.env.VITE_API_URL}/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default PERMISSION_API; 