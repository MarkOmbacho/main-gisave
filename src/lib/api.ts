import axios from 'axios';

// Resolve base URL from env and normalize (no trailing slash)
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const baseURL = rawBase.replace(/\/$/, '');

// Guard: in production we should not be using the localhost fallback
if (import.meta.env.MODE === 'production' && /localhost|127\.0\.0\.1/.test(baseURL)) {
  // eslint-disable-next-line no-console
  console.error('VITE_API_URL is not set for production. Frontend may be pointing to localhost.');
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token from Supabase
api.interceptors.request.use(async (config) => {
  try {
    // Get Supabase session token instead of backend token
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    // If Supabase is not configured or fails, continue without token
    console.warn('Could not get Supabase session for API request:', error);
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access - sign out through Supabase
      try {
        const { supabase } = await import('./supabase');
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.warn('Could not sign out through Supabase:', supabaseError);
      }
      window.location.href = '/auth';
    }
    
    // Check if the response is HTML instead of JSON
    if (error.response?.headers['content-type']?.includes('text/html')) {
      console.error('Received HTML response instead of JSON');
      error.message = 'Unexpected server response. Please try again later.';
    }

    return Promise.reject(error);
  }
);

    /**
     * checkApi - lightweight connectivity check to the API root
     * Returns: response data if OK, throws if unreachable or non-JSON
     */
    export async function checkApi(timeout = 5000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await api.get('/', { signal: controller.signal });
        clearTimeout(id);
        return res.data;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    }