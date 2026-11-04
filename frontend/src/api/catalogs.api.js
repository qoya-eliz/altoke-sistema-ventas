import api from './axiosClient.js';
export const getCatalogs = () => api.get('/catalogs');
