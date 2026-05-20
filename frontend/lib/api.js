const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiFetch = (path, options = {}) => {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return fetch(`${base}${cleanPath}`, { ...options, headers });
};

export { apiFetch };
