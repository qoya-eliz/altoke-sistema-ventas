import api from '../../api/axiosClient.js';
export default {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};
