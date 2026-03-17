export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const error = await res.json();
      throw new Error(error.error || 'Something went wrong');
    } else {
      const text = await res.text();
      console.error('Non-JSON error response:', text.substring(0, 100));
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
  }

  if (isJson) {
    return res.json();
  }
  
  return res.text();
}
