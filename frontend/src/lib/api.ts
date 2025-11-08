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
    
    // Optional: Show toast notification
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast('Session expired. Please login again.');
    }
    
    window.location.href = '/admin-portal/login';
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || errorData.message || 'Request failed'
    );
  }

  return response.json();
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