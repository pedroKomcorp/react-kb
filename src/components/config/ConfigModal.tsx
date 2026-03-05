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

const SHELL_COLORS = {
  deep: '#05060a',
  panel: '#1f1e27',
  accent: '#BA8364',
  accentStrong: '#775343',
  accentShadow: '#452D2C',
  white: '#fff',
};

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

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#0f1118',
    borderColor: '#2b2f3a',
    color: SHELL_COLORS.white,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={loading}
      title={(
        <div className="flex flex-col">
          <span className="text-base font-semibold text-white">Configurações do Usuário</span>
          <span className="text-xs text-slate-300 mt-0.5">Atualize seu perfil e credenciais de acesso.</span>
        </div>
      )}
      okButtonProps={{
        style: {
          backgroundColor: SHELL_COLORS.accent,
          borderColor: SHELL_COLORS.accentStrong,
          color: SHELL_COLORS.white,
        },
      }}
      cancelButtonProps={{
        style: {
          backgroundColor: '#12151e',
          borderColor: '#2b2f3a',
          color: SHELL_COLORS.white,
        },
      }}
      styles={{
        header: {
          background: `linear-gradient(180deg, ${SHELL_COLORS.panel} 0%, ${SHELL_COLORS.deep} 100%)`,
          borderBottom: `1px solid ${SHELL_COLORS.accentShadow}`,
          color: SHELL_COLORS.white,
        },
        body: {
          background: `linear-gradient(180deg, ${SHELL_COLORS.panel} 0%, ${SHELL_COLORS.deep} 100%)`,
          color: SHELL_COLORS.white,
        },
        content: {
          border: `1px solid ${SHELL_COLORS.accentShadow}`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        },
        footer: {
          background: `linear-gradient(180deg, ${SHELL_COLORS.panel} 0%, ${SHELL_COLORS.deep} 100%)`,
          borderTop: `1px solid ${SHELL_COLORS.accentShadow}`,
        },
      }}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Identificação</p>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Nome</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} maxLength={50} style={inputStyle} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <Input value={currentUser?.email || ''} disabled style={inputStyle} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Segurança</p>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Senha Atual ou Nova Senha</label>
            <Input.Password value={password || senha} onChange={e => { setPassword(e.target.value); setSenha(e.target.value); }} maxLength={50} placeholder="Digite sua senha atual ou nova senha" style={inputStyle} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-200 mb-1">Confirmar Nova Senha (opcional)</label>
            <Input.Password value={password2} onChange={e => setPassword2(e.target.value)} maxLength={50} placeholder="Repita a nova senha se for trocar" style={inputStyle} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfigModal;
