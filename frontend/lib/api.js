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

  return fetch(`${API_URL}${path}`, { ...options, headers });
};

export { apiFetch };
