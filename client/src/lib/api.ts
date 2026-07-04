const BASE_URL = '/api/v1';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') || 'mock-token'; // Consistent with the token used in MastersPage.tsx
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If the path already has /api/v1, don't prepend BASE_URL
  const url = cleanPath.startsWith('/api/v1') ? cleanPath : `${BASE_URL}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Request failed');
    (error as any).response = { data: errorData };
    throw error;
  }

  const data = await response.json();
  return { data };
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (path: string, body?: any, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
