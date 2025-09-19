// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import { AuthProvider } from './context/AuthContext.tsx'; // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);