import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, Avatar, message, Space, Divider } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { updateUserProfile, uploadProfilePhoto, deleteProfilePhoto } from '../services/usuarios';
import type { Usuario } from '../types/usuario';

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
  currentUser?: Usuario;
  onUpdateProfile: (updatedUser: Usuario) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  open,
  onClose,
  currentUser,
  onUpdateProfile
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(currentUser?.profilePhoto);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Debug: Log when modal open state changes
  React.useEffect(() => {
    console.log('ConfigModal open prop changed:', open);
  }, [open]);

  // Initialize form with current user data
  React.useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        nome: currentUser.nome,
        email: currentUser.email,
      });
      setProfilePhoto(currentUser.profilePhoto);
    }
  }, [currentUser, form]);

  const handleImageUpload = async (file: File) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('A imagem deve ter no máximo 5MB');
      return false;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      message.error('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.');
      return false;
    }

    try {
      // Upload via API
      const photoUrl = await uploadProfilePhoto(file);
      setProfilePhoto(photoUrl);
      message.success('Imagem carregada com sucesso!');
    } catch (error) {
      // Fallback to local Base64 if API fails (for development)
      console.warn('API upload failed, using local Base64:', error);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePhoto(result);
        message.success('Imagem carregada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
    
    return false; // Prevent default upload
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleImageUpload,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    accept: 'image/*',
    showUploadList: false,
    maxCount: 1,
  };

  const handleRemovePhoto = async () => {
    try {
      await deleteProfilePhoto();
      setProfilePhoto(undefined);
      setFileList([]);
      message.success('Foto removida com sucesso!');
    } catch (error) {
      console.warn('API delete failed, removing locally:', error);
      setProfilePhoto(undefined);
      setFileList([]);
      message.success('Foto removida com sucesso!');
    }
  };

  const handleSubmit = async (values: { nome: string; email: string }) => {
    try {
      setLoading(true);
      
      // Update profile via API
      const updatedUser = await updateUserProfile({
        nome: values.nome,
        email: values.email,
        profilePhoto,
      });
      
      // Update local state via callback
      onUpdateProfile(updatedUser);
      
      message.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      message.error('Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setProfilePhoto(currentUser?.profilePhoto);
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-blue-500" />
          <span>Configurações do Perfil</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={null}
      className="config-modal"
      styles={{
        body: { padding: '20px' },
        header: { borderBottom: '1px solid #f0f0f0', marginBottom: '20px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Profile Photo Section */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar
                size={120}
                src={profilePhoto}
                icon={<UserOutlined />}
                className="border-4 border-gray-200 shadow-lg"
              />
              {profilePhoto && (
                <Button
                  type="text"
                  danger
                  size="small"
                  className="absolute top-0 right-0 rounded-full bg-red-500 text-white hover:bg-red-600"
                  onClick={handleRemovePhoto}
                  style={{ minWidth: '24px', height: '24px', padding: '0' }}
                >
                  ×
                </Button>
              )}
            </div>
            
            <Space>
              <Upload {...uploadProps}>
                <Button icon={<CameraOutlined />} type="default">
                  {profilePhoto ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
              </Upload>
              {profilePhoto && (
                <Button type="text" onClick={handleRemovePhoto}>
                  Remover Foto
                </Button>
              )}
            </Space>
            
            <p className="text-gray-500 text-sm">
              Recomendamos uma imagem quadrada de pelo menos 200x200px
            </p>
          </div>
        </div>

        <Divider />

        {/* Profile Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Informações Pessoais
          </h3>
          
          <Form.Item
            label="Nome"
            name="nome"
            rules={[
              { required: true, message: 'Por favor, insira seu nome!' },
              { min: 2, message: 'Nome deve ter pelo menos 2 caracteres!' }
            ]}
          >
            <Input
              size="large"
              placeholder="Digite seu nome completo"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Por favor, insira um email válido!' }
            ]}
          >
            <Input
              size="large"
              type="email"
              placeholder="Digite seu email"
              className="rounded-md"
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button size="large" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Salvar Alterações
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ConfigModal;