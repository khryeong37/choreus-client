// src/api/client.js
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000/api' // 로컬 개발용
  : 'https://choreus-server.onrender.com/api'; // 배포용 (Render URL)

const TOKEN_KEY = 'choreus_token';

// ✅ 같은 요청이 동시에 여러 번 발생하면 첫 요청 Promise를 재사용(중복 호출 방지)
const inFlight = new Map();

const makeRequestKey = (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? String(options.body) : '';
  return `${method}:${url}:${body}`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const redirectToLogin = () => {
  setAuthToken(null);
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

// (기존 함수: 현재는 apiRequest에서 직접 처리하므로 남겨둬도 되고 지워도 됩니다)
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    redirectToLogin();
  }
  if (!response.ok) {
    const message = data?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(message);
  }
  return data;
};

export const apiRequest = (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;

  // ✅ 동일 요청 중복 방지 키
  const key = makeRequestKey(url, options);

  // ✅ 이미 진행 중이면 그 Promise를 그대로 반환
  if (inFlight.has(key)) return inFlight.get(key);

  const run = async () => {
    const maxAttempts = 2; // ✅ 429 대응 1회 재시도만(쿼터 절약)

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response;

      try {
        response = await fetch(url, {
          ...options,
          headers: buildHeaders(options.headers),
        });
      } catch (error) {
        console.error('FETCH NETWORK ERROR', { url, message: error.message });
        throw error;
      }

      const raw = await response.text().catch(() => '');
      let data;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = raw;
      }

      // ✅ 인증 만료 처리
      if (response.status === 401) {
        redirectToLogin();
      }

      // ✅ 429(쿼터/레이트리밋)이면 잠깐 기다리고 1회 재시도
      if (response.status === 429 && attempt < maxAttempts) {
        const detail = (data && data.detail) || (data && data.message) || '';
        const match = String(detail).match(/retry in\s*([\d.]+)s/i);
        const waitMs = match ? Math.ceil(Number(match[1]) * 1000) : 15000;

        console.warn('RATE LIMITED (429). Retrying after:', waitMs, 'ms', {
          url,
          detail,
        });

        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        console.error('FETCH HTTP ERROR', {
          url,
          status: response.status,
          data,
        });
        const message =
          (data && data.detail) ||
          (data && data.message) ||
          `HTTP ${response.status}`;
        throw new Error(message);
      }

      return data;
    }
  };

  // ✅ inFlight 등록
  const p = run().finally(() => inFlight.delete(key));
  inFlight.set(key, p);
  return p;
};

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

export const tipApi = {
  generate: (payload) =>
    apiRequest('/tips', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const templateApi = {
  list: () => apiRequest('/templates'),
};
