import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/`,
});

// Function to set error handler (will be set by the app)
let globalErrorHandler: ((message: string) => void) | null = null;
let authLockHandler: ((locked: boolean) => void) | null = null;

export const setGlobalErrorHandler = (handler: (message: string) => void) => {
  globalErrorHandler = handler;
};

export const setAuthLockHandler = (handler: (locked: boolean) => void) => {
  authLockHandler = handler;
};

// Add response interceptor to handle validation errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Ocorreu um erro inesperado';
    let isAuthError = false;

    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      isAuthError = true;
      errorMessage = 'Sessão expirada. Por favor, faça logout e entre novamente.';
      
      // Check for specific "Could not validate credentials" message
      if (error.response?.data?.detail === 'Could not validate credentials') {
        errorMessage = 'Suas credenciais não puderam ser validadas. Por favor, faça logout.';
      }
      
      // Lock the UI
      if (authLockHandler) {
        authLockHandler(true);
      }
    }
    // Handle FastAPI validation errors
    else if (error.response?.status === 422) {
      const validationError = error.response.data;
      console.error('Validation Error:', validationError);
      
      // Create a more user-friendly error message
      if (validationError.detail) {
        if (typeof validationError.detail === 'string') {
          errorMessage = validationError.detail;
        } else if (Array.isArray(validationError.detail)) {
          const errorMessages = validationError.detail.map((err: Record<string, unknown>) => {
            const field = (err.loc as unknown[])?.slice(-1)[0] || 'campo';
            return `${field}: ${err.msg}`;
          });
          errorMessage = `Erro de validação: ${errorMessages.join(', ')}`;
        }
      }
    } else if (error.response?.data?.detail) {
      // Handle other API errors with detail field
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show error in header if handler is set
    if (globalErrorHandler) {
      globalErrorHandler(errorMessage);
    }

    error.message = errorMessage;
    error.isAuthError = isAuthError;
    return Promise.reject(error);
  }
);

export default api;
