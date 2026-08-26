import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, updateUserPassword } from '../utils/storage';
import { KeyRound, Check, X, Shield, AlertCircle } from 'lucide-react';

interface EditPasswordModalProps {
  currentUser: User;
  onClose: () => void;
  targetUser?: User;
}

export const EditPasswordModal: React.FC<EditPasswordModalProps> = ({
  currentUser,
  onClose,
  targetUser
}) => {
  const users = getUsers();
  const selectedUser = targetUser || currentUser;
  const [selectedUserId, setSelectedUserId] = useState(selectedUser.id);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    const ok = updateUserPassword(selectedUserId, newPassword);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setError('Não foi possível atualizar a senha.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00B7B5]/20 text-[#00B7B5]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Editar Senha de Acesso</h3>
              <p className="text-xs text-slate-200">SELENE — Controle de Acesso e Segurança</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800 text-sm">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Senha atualizada com sucesso!</p>
                <p className="text-xs text-emerald-700">A nova credencial já está ativa no sistema.</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Admin target user selection */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Selecionar Usuário
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden transition-all"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — Perfil: {u.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isAdmin && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00B7B5]" />
                  <span>
                    Alterando credencial para: <strong>{currentUser.name}</strong> ({currentUser.email})
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha..."
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha..."
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#205857] hover:bg-[#184443] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar Nova Senha
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
