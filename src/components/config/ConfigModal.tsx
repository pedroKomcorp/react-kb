import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import type { Usuario } from '../../types/usuario';
import { updateUsuario } from '../../services/usuarios';

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
  currentUser?: Usuario;
  onUpdateProfile: (user: Usuario) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ open, onClose, currentUser, onUpdateProfile }) => {
  const [nome, setNome] = useState(currentUser?.nome || '');
  const [senha, setSenha] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setNome(currentUser?.nome || '');
  }, [currentUser]);

  const handleSave = async () => {
    if (!nome.trim()) {
      message.error('O nome não pode estar vazio.');
      return;
    }
    if (password && password !== password2) {
      message.error('As senhas não coincidem.');
      return;
    }
    if (!senha && !password) {
      message.error('Digite sua senha atual ou uma nova senha.');
      return;
    }
    setLoading(true);
    try {
      // Update name
      const updatedUser = { ...currentUser, nome } as Usuario;
      if (currentUser?.id && currentUser?.email) {
        await updateUsuario({
          id: currentUser.id,
          nome,
          email: currentUser.email,
          senha: password || senha
        });
      }
      onUpdateProfile(updatedUser);
      message.success('Dados atualizados com sucesso!');
      onClose();
    } catch (e) {
      message.error(`Erro ao atualizar dados. ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={loading}
      title="Configurações do Usuário"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <Input value={nome} onChange={e => setNome(e.target.value)} maxLength={50} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input value={currentUser?.email || ''} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual ou Nova Senha</label>
          <Input.Password value={password || senha} onChange={e => { setPassword(e.target.value); setSenha(e.target.value); }} maxLength={50} placeholder="Digite sua senha atual ou nova senha" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha (opcional)</label>
          <Input.Password value={password2} onChange={e => setPassword2(e.target.value)} maxLength={50} placeholder="Repita a nova senha se for trocar" />
        </div>
      </div>
    </Modal>
  );
};

export default ConfigModal;
