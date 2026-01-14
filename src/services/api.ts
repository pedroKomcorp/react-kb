import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/`,
});

// Add response interceptor to handle validation errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle FastAPI validation errors
    if (error.response?.status === 422) {
      const validationError = error.response.data;
      console.error('Validation Error:', validationError);
      
      // Create a more user-friendly error message
      if (validationError.detail && Array.isArray(validationError.detail)) {
        const errorMessages = validationError.detail.map((err: Record<string, unknown>) => {
          const field = (err.loc as unknown[])?.slice(-1)[0] || 'campo';
          return `${field}: ${err.msg}`;
        });
        error.message = `Erro de validação: ${errorMessages.join(', ')}`;
      }
    }
    
    return Promise.reject(error);
  }
);
export default api;
