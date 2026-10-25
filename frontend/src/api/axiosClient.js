import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('altoke_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {}
    }
    const status = error.response?.status;
    if (status === 401 || error.response?.data?.code === 'INACTIVE_USER') {
      localStorage.removeItem('altoke_token');
      window.dispatchEvent(new Event('altoke:expired'));
    } else if (status === 403) {
      window.dispatchEvent(new Event('altoke:role-refresh'));
    }
    error.message =
      error.response?.data?.message ||
      error.message ||
      'No se pudo conectar con el servidor.';
    return Promise.reject(error);
  },
);
export async function downloadFile(path, name) {
  const res = await api.get(path, { responseType: 'blob' });
  return { blob: res.data, name };
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default api;
