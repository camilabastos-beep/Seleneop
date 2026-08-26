import React, { useState } from 'react';
import { User, UserRole, UserPermissions } from '../types';
import { getUsers, saveUser, getRolePermissions, saveRolePermissions, DEFAULT_ROLE_PERMISSIONS, getEffectivePermissions } from '../utils/storage';
import { EditPasswordModal } from './EditPasswordModal';
import { Users, Plus, Shield, KeyRound, Check, Lock, Settings, Save, AlertCircle, Sliders, RotateCcw, CheckCircle2 } from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  onRefresh: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onRefresh }) => {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, UserPermissions>>(getRolePermissions());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [userForCustomPerms, setUserForCustomPerms] = useState<User | null>(null);
  const [tempCustomPerms, setTempCustomPerms] = useState<UserPermissions | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'permissions'>('users');
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<UserRole>('GESTOR');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('PSICOLOGO');
  const [newUserFilial, setNewUserFilial] = useState('Matriz');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setUsers(getUsers());
    setRolePermissions(getRolePermissions());
    onRefresh();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (existing) {
      setFormError('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword,
      role: newUserRole,
      filial: newUserFilial,
      active: true,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    refreshList();
  };

  const toggleUserActive = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Você não pode desativar seu próprio usuário administrador.');
      return;
    }
    const updated = { ...user, active: !user.active };
    saveUser(updated);
    refreshList();
  };

  const handlePermissionToggle = (role: UserRole, key: keyof UserPermissions) => {
    const updated = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [key]: !rolePermissions[role][key]
      }
    };
    setRolePermissions(updated);
  };

  const handleSavePermissions = () => {
    saveRolePermissions(rolePermissions);
    setSaveSuccessMsg('Matriz de permissões atualizada com sucesso para todos os usuários!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    refreshList();
  };

  const handleResetDefaultPermissions = () => {
    if (confirm('Deseja restaurar as permissões de acesso aos padrões de fábrica?')) {
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      saveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      setSaveSuccessMsg('Permissões restauradas aos padrões recomendados.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      refreshList();
    }
  };

  // Open individual access modal
  const openCustomPermsModal = (user: User) => {
    setUserForCustomPerms(user);
    const effective = getEffectivePermissions(user);
    setTempCustomPerms({ ...effective });
  };

  const handleToggleTempPerm = (key: keyof UserPermissions) => {
    if (!tempCustomPerms) return;
    setTempCustomPerms({
      ...tempCustomPerms,
      [key]: !tempCustomPerms[key]
    });
  };

  const handleSaveCustomUserPerms = () => {
    if (!userForCustomPerms || !tempCustomPerms) return;
    const updatedUser: User = {
      ...userForCustomPerms,
      customPermissions: tempCustomPerms
    };
    saveUser(updatedUser);
    setUserForCustomPerms(null);
    setTempCustomPerms(null);
    setSaveSuccessMsg(`Acessos customizados salvos com sucesso para ${updatedUser.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
    refreshList();
  };

  const handleResetCustomUserPermsToRole = () => {
    if (!userForCustomPerms) return;
    const baseRolePerms = rolePermissions[userForCustomPerms.role] || DEFAULT_ROLE_PERMISSIONS[userForCustomPerms.role];
    setTempCustomPerms({ ...baseRolePerms });
  };

  const handleClearCustomOverrides = () => {
    if (!userForCustomPerms) return;
    const updatedUser: User = {
      ...userForCustomPerms,
      customPermissions: undefined
    };
    saveUser(updatedUser);
    setUserForCustomPerms(null);
    setTempCustomPerms(null);
    setSaveSuccessMsg(`Permissões de ${updatedUser.name} restauradas ao padrão do perfil ${updatedUser.role}.`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
    refreshList();
  };

  const permissionLabels: { key: keyof UserPermissions; label: string; desc: string; isConfidential?: boolean }[] = [
    { key: 'canViewDashboard', label: 'Visualizar Dashboard', desc: 'Acesso à aba principal de indicadores operacionais' },
    { key: 'canViewDrivers', label: 'Visualizar Motoristas', desc: 'Acesso ao cadastro e lista de motoristas carreteiros' },
    { key: 'canEditDrivers', label: 'Cadastrar / Editar Motoristas', desc: 'Permissão para criar ou alterar dados cadastrais de motoristas' },
    { key: 'canViewBiopsychosocial', label: 'Visualizar Biopsicossocial', desc: 'Acesso aos resultados e fichas biopsicossociais' },
    { key: 'canCreateBiopsychosocial', label: 'Criar Avaliação Biopsicossocial', desc: 'Permissão para aplicar e salvar nova avaliação biopsicossocial' },
    { key: 'canViewCronotipo', label: 'Visualizar Cronotipo', desc: 'Acesso aos pareceres e questionários Horne-Östberg' },
    { key: 'canCreateCronotipo', label: 'Criar Avaliação de Cronotipo', desc: 'Permissão para aplicar o questionário de cronotipo Horne-Östberg' },
    { key: 'canViewInterventions', label: 'Visualizar Intervenções de Fadiga', desc: 'Acesso ao módulo de eventos e controle de tempo de fadiga' },
    { key: 'canCreateInterventions', label: 'Registrar / Editar Intervenções', desc: 'Permissão para registrar novos eventos operacionais e anexar laudos' },
    { key: 'canViewReports', label: 'Visualizar Pareceres Técnicos & Relatórios', desc: 'Acesso aos relatórios e laudos gerados' },
    { key: 'canExportReports', label: 'Exportar Pareceres (Word .doc / PDF)', desc: 'Permissão para download de relatórios e documentos' },
    { key: 'canViewClinicalDetails', label: 'Confidencialidade: Respostas Clínicas Individuais', desc: 'Visualização das respostas completas de cada pergunta do formulário', isConfidential: true },
    { key: 'canViewEmotionalDetails', label: 'Confidencialidade: Eventos Emocionais e Saúde Mental', desc: 'Visualização dos relatos descritivos de saúde mental e impacto emocional', isConfidential: true },
    { key: 'canManageUsers', label: 'Administração de Usuários & Senhas', desc: 'Cadastrar usuários, alterar senhas e controlar acessos' },
    { key: 'canViewAuditLogs', label: 'Visualizar Logs de Auditoria', desc: 'Acesso ao histórico de quem acessou e editou dados no sistema' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Administração de Usuários & Controle de Acessos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie credenciais, defina permissões sob medida para cada usuário e configure a matriz de papéis (ADMIN, PSICÓLOGO, GESTOR, CONSULTA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-6 pt-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'border-[#00B7B5] text-[#205857]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários Cadastrados ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'permissions'
              ? 'border-[#00B7B5] text-[#205857]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Matriz de Permissões Granulares por Perfil
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-medium animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: USERS LIST */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-t-0 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil & Acessos</th>
                  <th className="py-3 px-4">Filial</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const roleBadgeColors: Record<UserRole, string> = {
                    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
                    PSICOLOGO: 'bg-teal-100 text-[#205857] border-teal-200',
                    GESTOR: 'bg-amber-100 text-amber-800 border-amber-200',
                    CONSULTA: 'bg-slate-100 text-slate-700 border-slate-200'
                  };

                  const hasCustomPerms = !!user.customPermissions && Object.keys(user.customPermissions).length > 0;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#205857]/10 text-[#205857] font-bold flex items-center justify-center text-xs shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{user.name}</span>
                          {user.id === currentUser.id && (
                            <span className="ml-2 text-[10px] bg-[#00B7B5]/20 text-[#205857] px-1.5 py-0.5 rounded-full font-bold">
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${roleBadgeColors[user.role]}`}>
                            {user.role}
                          </span>
                          {hasCustomPerms ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1" title="Usuário possui permissões customizadas além do perfil base">
                              <Sliders className="w-2.5 h-2.5" />
                              Acessos Personalizados
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Padrão do Perfil)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{user.filial || 'Matriz'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {/* Controlar Acessos Button */}
                        <button
                          onClick={() => openCustomPermsModal(user)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#205857] border border-teal-200 font-bold rounded-md transition-colors text-[11px] inline-flex items-center gap-1 shadow-2xs"
                          title="Ajustar permissões individuais deste usuário"
                        >
                          <Sliders className="w-3 h-3 text-[#00B7B5]" />
                          Controlar Acessos
                        </button>

                        <button
                          onClick={() => setPasswordModalUser(user)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors text-[11px] inline-flex items-center gap-1"
                          title="Alterar Senha"
                        >
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          Senha
                        </button>

                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => toggleUserActive(user)}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors inline-flex items-center gap-1 ${
                              user.active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GRANULAR PERMISSIONS MATRIX */}
      {activeSubTab === 'permissions' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-t-0 border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Configuração de Acesso por Papel de Usuário</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina com precisão quais abas, ações e níveis de confidencialidade cada perfil padrão pode acessar no SELENE.
              </p>
            </div>

            {/* Role switcher pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              {(['ADMIN', 'PSICOLOGO', 'GESTOR', 'CONSULTA'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleForPerms(role)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    selectedRoleForPerms === role
                      ? 'bg-[#205857] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Role Description Callout */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#00B7B5] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">
                Diretrizes do Perfil {selectedRoleForPerms}:
              </span>
              {selectedRoleForPerms === 'ADMIN' && (
                <p>Acesso completo e irrestrito ao sistema, administração de usuários e logs de auditoria.</p>
              )}
              {selectedRoleForPerms === 'PSICOLOGO' && (
                <p>Acesso clínico completo a todas as avaliações biopsicossociais, cronotipo e pareceres técnicos.</p>
              )}
              {selectedRoleForPerms === 'GESTOR' && (
                <p>
                  Acesso <strong>somente às informações gerenciais e ocupacionais autorizadas</strong>. Por princípio de confidencialidade (sigilo psicológico), <strong>não visualiza respostas individuais, observações clínicas, eventos emocionais ou relatos de saúde mental</strong>.
                </p>
              )}
              {selectedRoleForPerms === 'CONSULTA' && (
                <p>Acesso restrito para consulta de informações resumidas sem permissão de edição clínica.</p>
              )}
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissionLabels.map(({ key, label, desc, isConfidential }) => {
              const isChecked = rolePermissions[selectedRoleForPerms]?.[key] ?? false;
              const isBlockedAdminOnly = (key === 'canManageUsers' || key === 'canViewAuditLogs') && selectedRoleForPerms !== 'ADMIN';

              return (
                <div
                  key={key}
                  onClick={() => !isBlockedAdminOnly && handlePermissionToggle(selectedRoleForPerms, key)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                    isChecked
                      ? isConfidential
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                        : 'bg-teal-50/60 border-teal-200 hover:border-teal-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                  } ${isBlockedAdminOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                        {label}
                      </span>
                      {isConfidential && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Sigilo Clínico
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </div>

                  <div className="shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isBlockedAdminOnly}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#00B7B5] focus:ring-[#00B7B5] border-slate-300 pointer-events-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaultPermissions}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Restaurar Padrões de Fábrica do Sistema
            </button>

            <button
              type="button"
              onClick={handleSavePermissions}
              className="px-6 py-2.5 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração de Permissões
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM INDIVIDUAL USER PERMISSIONS */}
      {userForCustomPerms && tempCustomPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#00B7B5]" />
                <div>
                  <h3 className="font-bold text-base leading-tight">Controlar Acessos do Usuário</h3>
                  <p className="text-xs text-teal-200 font-medium mt-0.5">
                    {userForCustomPerms.name} · Perfil Base: <span className="underline font-bold">{userForCustomPerms.role}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserForCustomPerms(null)}
                className="text-slate-300 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Context Explanation */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-[#205857] mb-1">
                  Customização Granular de Permissões
                </p>
                O usuário mantém a função base <strong>{userForCustomPerms.role}</strong>, mas você pode marcar ou desmarcar qualquer ação individualmente (por exemplo: permitir que um usuário de Consulta possa cadastrar motoristas, ou restringir exportação).
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Permissões Específicas:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCustomUserPermsToRole}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resetar p/ Perfil Base ({userForCustomPerms.role})
                  </button>
                  {userForCustomPerms.customPermissions && (
                    <button
                      type="button"
                      onClick={handleClearCustomOverrides}
                      className="text-[11px] px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors"
                    >
                      Remover Customizações
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {permissionLabels.map(({ key, label, desc, isConfidential }) => {
                  const isChecked = tempCustomPerms[key] ?? false;

                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleTempPerm(key)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start justify-between gap-2.5 ${
                        isChecked
                          ? isConfidential
                            ? 'bg-rose-50/70 border-rose-300 text-slate-900'
                            : 'bg-teal-50/80 border-teal-300 text-slate-900'
                          : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                            {label}
                          </span>
                          {isConfidential && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-rose-100 text-rose-800">
                              Sigilo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                      </div>

                      <div className="shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#00B7B5] focus:ring-[#00B7B5] border-slate-300 pointer-events-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUserForCustomPerms(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomUserPerms}
                className="px-5 py-2.5 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00B7B5]" />
                Salvar Acessos de {userForCustomPerms.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00B7B5]" />
                <h3 className="font-bold text-base">Cadastrar Novo Usuário</h3>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Santos"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  placeholder="juliana.santos@etp-transparana.com.br"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Senha Inicial *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perfil Base *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                  >
                    <option value="PSICOLOGO">Psicólogo(a)</option>
                    <option value="GESTOR">Gestor de Frota / RH</option>
                    <option value="CONSULTA">Consulta (Leitura)</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Filial Oficial Transparaná</label>
                  <select
                    value={newUserFilial}
                    onChange={(e) => setNewUserFilial(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Pernambuco">Pernambuco</option>
                    <option value="Maranhão">Maranhão</option>
                    <option value="Mossoró">Mossoró</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD MODAL */}
      {passwordModalUser && (
        <EditPasswordModal
          user={passwordModalUser}
          isOpen={!!passwordModalUser}
          onClose={() => setPasswordModalUser(null)}
          onSuccess={() => {
            setPasswordModalUser(null);
            setSaveSuccessMsg('Senha atualizada com sucesso!');
            setTimeout(() => setSaveSuccessMsg(''), 3000);
            refreshList();
          }}
        />
      )}
    </div>
  );
};
