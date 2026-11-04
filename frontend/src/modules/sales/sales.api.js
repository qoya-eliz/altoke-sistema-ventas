import api from '../../api/axiosClient.js';
const base = '/sales';
export default {
  list: (query = '', config) => api.get(base + query, config),
  get: (id, config) => api.get(base + '/' + id, config),
  metrics: (config) => api.get(base + '/metrics', config),
  create: (data, config) => api.post(base, data, config),
  update: (id, data, config) => api.put(base + '/' + id, data, config),
  search: (query = '', config) => api.get(base + '/search' + query, config),
  searchPos: (query = '', config) => api.get(base + '/search-pos' + query, config),
};
