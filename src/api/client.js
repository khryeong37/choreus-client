const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'choreus_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

const buildHeaders = (custom = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...custom,
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(message);
  }
  return data;
};

export const apiRequest = (path, options = {}) =>
  fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  }).then(handleResponse);

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  if (!entries.length) {
    return '';
  }
  const qs = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
  return `?${qs}`;
};

export const authApi = {
  signup: (payload) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const userApi = {
  fetchMe: () => apiRequest('/users/me'),
  updateMe: (payload) =>
    apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  fetchHousehold: () => apiRequest('/users/household'),
};

export const requestApi = {
  list: () => apiRequest('/requests'),
  create: (payload) =>
    apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  decide: (requestId, payload) =>
    apiRequest(`/requests/${requestId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export const taskApi = {
  list: (params) => apiRequest(`/tasks${buildQueryString(params)}`),
  create: (payload) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (taskId, payload) =>
    apiRequest(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  toggle: (taskId) =>
    apiRequest(`/tasks/${taskId}/toggle`, {
      method: 'PATCH',
    }),
  remove: (taskId) =>
    apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};

export const conditionApi = {
  listMine: (params) => apiRequest(`/conditions${buildQueryString(params)}`),
  upsert: (payload) =>
    apiRequest('/conditions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  remove: (conditionId) =>
    apiRequest(`/conditions/${conditionId}`, {
      method: 'DELETE',
    }),
};
