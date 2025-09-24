import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { getUsuarios } from '../../services/usuarios';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/UseAuth';


type FormValues = {
  username?: string;
  password?: string;
};
const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If a token exists, it means the user is logged in, so we redirect.
    if (token) {
      navigate('/home', { replace: true }); // Use replace to prevent going back to login
    }
  }, [token, navigate]);

  const onFinish = async (values: FormValues) => {
    setErrorMessage('');
    const formData = new FormData();
    formData.append('username', values.username || '');
    formData.append('password', values.password || '');

    try {
      const response = await api.post('/auth/token', formData);
      const { access_token } = response.data;

      if (access_token) {
        login(access_token);
        // Buscar id do usuário pelo email (username)
        try {
          const usuarios = await getUsuarios();
          const usuario = usuarios.find(u => u.email === values.username);
          if (usuario) {
            localStorage.setItem('user_id', usuario.id.toString());
          }
        } catch (e) {
          console.log(e)
        }
      }

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (detail) {
          setErrorMessage(detail);
        } else {
          setErrorMessage('Ocorreu um erro na resposta do servidor.');
        }
      } else {
        setErrorMessage('Algum erro aconteceu. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center font-sans">
      {/* Background Image */}
      <img
        src="/assets/marmore3.png"
        alt="Marble background"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />

      {/* Login Card Container */}
      <div
        className="shadow-lg backdrop-blur-sm p-8 rounded-3xl w-full max-w-xl 
                   border-white/45 border-2 bg-black"
      >
        {/* --- Logo --- */}
        <div className="text-center mb-6">
          <a href="https://kombusiness.com.br/" target="_blank" rel="noopener noreferrer">
            <img
              src="/assets/logo-kb-escuro.png"
              alt="Kom Business Logo"
              className="w-auto h-16 mx-auto cursor-pointer transition-transform hover:scale-105"
            />
          </a>
        </div>

        {/* --- Login Form --- */}
        <Form<FormValues>
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="flex flex-col space-y-6"
        >
          {/* --- Username Field --- */}
          <Form.Item<FormValues>
            label={<span className="text-white font-medium">Email</span>}
            name="username"
            rules={[{ required: true, message: 'Por favor coloque seu email!' }]}
            className="mb-0"
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon text-gray-400" />}
              placeholder="exemplo@kombusiness.com"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          {/* --- Password Field --- */}
          <Form.Item<FormValues>
            label={<span className="text-white font-medium">Senha</span>}
            name="password"
            rules={[{ required: true, message: 'Por favor coloque seu senha!' }]}
            className="mb-0"
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
              placeholder="*********"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          {/* --- Submit Button --- */}
          <Form.Item className="p-16 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full border-none text-white font-bold rounded"
              size="large"
            >
              Entrar
            </Button>
          </Form.Item>

          {/* --- Error Message Display --- */}
          {errorMessage && (
             <Form.Item className="mb-0">
               <Alert message={errorMessage} type="error" showIcon />
             </Form.Item>
          )}
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;