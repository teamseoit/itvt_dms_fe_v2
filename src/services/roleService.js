import axios from 'axios';

const ROLE_API = {
  getRoles: async () => {
    const token = localStorage.getItem('token');
    return axios.get(`${import.meta.env.VITE_API_URL}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default ROLE_API; 