// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './app.tsx';
import { AuthProvider } from './context/AuthContext.tsx'; // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        components: {
          Popover: {
            colorBgElevated: '#fff',
            colorText: '#1f1e27',
            colorTextHeading: '#1f1e27',
          },
          Popconfirm: {
            colorText: '#1f1e27',
            colorTextHeading: '#1f1e27',
          },
        },
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
