const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Main API request function that automatically:
 * - Adds Authorization header with JWT token
 * - Handles 401 errors by logging out and redirecting
 * - Provides consistent error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Automatically add Authorization header if authentication is required
  if (requireAuth) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if no token is found
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/admin-portal/login';
      throw new Error('No authentication token found');
    }

    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized - token is invalid or expired
  if (response.status === 401) {
    // Clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    
    alert('Session expired. Please login again.');
    window.location.href = '/admin-portal/login';
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = 'Request failed';
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
       errorMessage = errorData.error || errorData.message || errorMessage;
    } else if (contentType?.includes('text/')) {
      errorMessage = await response.text();
    }
    
    throw new ApiError(response.status, errorMessage);
  }

  // Handle JSON, text, or empty responses
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  } else if (contentType?.includes('text/')) {
    return (await response.text()) as unknown as T;
  } else {
    return null as unknown as T; // empty response
  }
}

/**
 * Convenience methods for common HTTP operations
 * All methods automatically include JWT token for protected routes
 */
export const api = {
  // GET request
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PATCH request
  patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};