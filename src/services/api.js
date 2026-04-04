import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5167/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const signup = (data) => api.post('/auth/signup', data);
export const login  = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout', {
  accessToken:  sessionStorage.getItem('accessToken'),
  refreshToken: sessionStorage.getItem('refreshToken')
});

export const compare  = (body) => api.post('/quantities/compare',  body);
export const convert  = (body) => api.post('/quantities/convert',  body);
export const add      = (body) => api.post('/quantities/add',      body);
export const subtract = (body) => api.post('/quantities/subtract', body);
export const divide   = (body) => api.post('/quantities/divide',   body);

export const getHistoryByType = (type) =>
  api.get(`/quantities/history/type/${type}`);

export const getAllHistory = () => {
  const types = ['LengthUnit', 'WeightUnit', 'VolumeUnit', 'TemperatureUnit'];
  return Promise.all(types.map(t => getHistoryByType(t)))
    .then(results => results.flatMap(r => Array.isArray(r.data) ? r.data : []));
};

export default api;