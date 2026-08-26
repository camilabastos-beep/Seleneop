import React, { useState, useEffect } from 'react';
import { User, Driver } from './types';
import {
  getCurrentUser,
  setCurrentUserSession,
  getUsers,
  getEffectivePermissions,
  logAction,
  getDrivers
} from './utils/storage';
import { TransparanaLogo } from './components/TransparanaLogo';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { BiopsychosocialForm } from './components/BiopsychosocialForm';
import { CronotipoForm } from './components/CronotipoForm';
import { FatigueInterventions } from './components/FatigueInterventions';
import { ReportsView } from './components/ReportsView';
import { DriversList } from './components/DriversList';
import { HistoryView } from './components/HistoryView';
import { UserManagement } from './components/UserManagement';
import { AuditLogs } from './components/AuditLogs';
import { SettingsView } from './components/SettingsView';
import { EditPasswordModal } from './components/EditPasswordModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';

import {
  LayoutDashboard,
  Users,
  Activity,
  Sun,
  History,
  Clock,
  FileText,
  Shield,
  Settings,
  LogOut,
  Key,
  Menu,
  X,
  Upload,
  CheckCircle2,
  ChevronRight,
  Bell,
  Search,
  UserCheck
} from 'lucide-react';

export type NavigationTab =
  | 'DASHBOARD'
  | 'DRIVERS'
  | 'BIOPSYCHOSOCIAL'
  | 'CRONOTIPO'
  | 'HISTORY'
  | 'FATIGUE_INTERVENTIONS'
  | 'REPORTS'
  | 'USERS'
  | 'AUDIT_LOGS'
  | 'SETTINGS';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Modals
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // State passing for evaluations & reports
  const [selectedDriverForBio, setSelectedDriverForBio] = useState<Driver | null>(null);
  const [selectedDriverForCrono, setSelectedDriverForCrono] = useState<Driver | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadAppData = () => {
    setDataVersion((v) => v + 1);
  };

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Bem-vindo(a), ${user.name}!`);
        }}
      />
    );
  }

  const permissions = getEffectivePermissions(currentUser);
  const usersList = getUsers();

  const handleLogout = () => {
    logAction(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'LOGOUT',
      'SISTEMA',
      undefined,
      `Logout realizado pelo usuário ${currentUser.name}`
    );
    localStorage.removeItem('SELENE_CURRENT_USER_ID');
    setCurrentUser(null);
    setShowAccountDropdown(false);
  };

  const handleSwitchUser = (userId: string) => {
    const u = usersList.find((x) => x.id === userId);
    if (u) {
      setCurrentUserSession(u);
      setCurrentUser(u);
      logAction(u.id, u.name, u.role, 'LOGIN', 'SISTEMA', undefined, `Usuário ${u.name} autenticado`);
      showToast(`Conectado como: ${u.name} (${u.role})`);
      setShowAccountDropdown(false);
    }
  };

  const handleStartBiopsychosocial = (driver?: Driver) => {
    setSelectedDriverForBio(driver || null);
    setCurrentTab('BIOPSYCHOSOCIAL');
    setMobileMenuOpen(false);
  };

  const handleStartCronotipo = (driver?: Driver) => {
    setSelectedDriverForCrono(driver || null);
    setCurrentTab('CRONOTIPO');
    setMobileMenuOpen(false);
  };

  const handleEvaluationSaved = (evalId: string) => {
    showToast('Avaliação salva com sucesso e parecer gerado!');
    reloadAppData();
    setCurrentTab('REPORTS');
  };

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'DASHBOARD':
        return 'Visão Geral & Indicadores';
      case 'DRIVERS':
        return 'Cadastro de Motoristas Carreteiros';
      case 'BIOPSYCHOSOCIAL':
        return 'Avaliação Biopsicossocial (4 Domínios)';
      case 'CRONOTIPO':
        return 'Avaliação de Cronotipo (Horne-Östberg)';
      case 'HISTORY':
        return 'Histórico Longitudinal & Prontuários';
      case 'FATIGUE_INTERVENTIONS':
        return 'Intervenções em Eventos de Fadiga';
      case 'REPORTS':
        return 'Pareceres Técnicos Enxutos & Relatórios';
      case 'USERS':
        return 'Gestão de Usuários & Permissões';
      case 'AUDIT_LOGS':
        return 'Rastreabilidade & Auditoria de Acesso';
      case 'SETTINGS':
        return 'Configurações do Sistema & SLA';
      default:
        return 'SELENE';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-slate-800 font-sans flex antialiased selection:bg-[#00B7B5] selection:text-white">
      {/* 1. FIXED DESKTOP SIDEBAR (Layout Principal - Item 8) */}
      <aside className="print:hidden hidden lg:flex w-64 bg-[#205857] text-white flex-col shrink-0 border-r border-[#184443] select-none z-30">
        {/* Sidebar Top: Transparaná Logo, SELENE, Slogan */}
        <div className="p-4 border-b border-white/10 bg-[#1a4746]/50">
          <div className="flex items-center gap-3">
            <TransparanaLogo size="sm" variant="light" showSlogan={false} />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                SELENE
              </span>
              <span className="text-[10px] text-[#00B7B5] uppercase font-bold tracking-wider block">
                Transparaná
              </span>
            </div>
          </div>
          <p className="text-[10px] text-teal-200 mt-2 font-normal leading-tight">
            Cuidando de Quem Conduz
          </p>
        </div>

        {/* Sidebar Navigation Menu (Dynamic according to permissions) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setCurrentTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'DASHBOARD'
                ? 'bg-[#00B7B5] text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {permissions.canViewDrivers && (
            <button
              onClick={() => setCurrentTab('DRIVERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'DRIVERS'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Motoristas</span>
            </button>
          )}

          {permissions.canCreateBiopsychosocial && (
            <button
              onClick={() => handleStartBiopsychosocial()}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'BIOPSYCHOSOCIAL'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Avaliações</span>
            </button>
          )}

          {permissions.canCreateCronotipo && (
            <button
              onClick={() => handleStartCronotipo()}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'CRONOTIPO'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Cronotipo</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('HISTORY')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'HISTORY'
                ? 'bg-[#00B7B5] text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </button>

          {permissions.canViewInterventions && (
            <button
              onClick={() => setCurrentTab('FATIGUE_INTERVENTIONS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'FATIGUE_INTERVENTIONS'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Intervenções</span>
            </button>
          )}

          {permissions.canViewReports && (
            <button
              onClick={() => setCurrentTab('REPORTS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'REPORTS'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatórios</span>
            </button>
          )}

          {(currentUser.role === 'ADMIN' || permissions.canManageUsers) && (
            <button
              onClick={() => setCurrentTab('USERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'USERS'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Usuários</span>
            </button>
          )}

          {(currentUser.role === 'ADMIN' || permissions.canViewAuditLogs) && (
            <button
              onClick={() => setCurrentTab('AUDIT_LOGS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'AUDIT_LOGS'
                  ? 'bg-[#00B7B5] text-white shadow-xs'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Auditoria</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('SETTINGS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'SETTINGS'
                ? 'bg-[#00B7B5] text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </nav>

        {/* Sidebar Footer: Logged in User Card */}
        <div className="p-3 border-t border-white/10 bg-black/20 text-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <span className="font-bold text-white block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-[#00B7B5] font-bold block uppercase">{currentUser.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Main Viewport Header (Layout - Item 9) */}
        <header className="print:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">SELENE</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-[#205857]">{getPageTitle(currentTab)}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Google Sheets Sync Button */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors border border-slate-200"
              title="Sincronizar com Planilha Google Sheets"
            >
              <Upload className="w-3.5 h-3.5 text-[#00B7B5]" />
              <span>Google Sheets</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#205857] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 hidden md:inline truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] bg-teal-100 text-[#205857] px-1.5 py-0.5 rounded-full font-bold uppercase hidden sm:inline">
                  {currentUser.role}
                </span>
              </button>

              {/* Account Dropdown Menu */}
              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono block truncate">{currentUser.email}</span>
                    <span className="text-[10px] text-[#00B7B5] font-bold uppercase mt-0.5 block">
                      Perfil: {currentUser.role}
                    </span>
                  </div>

                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block px-2 mb-1">
                      Trocar Perfil de Acesso:
                    </label>
                    <select
                      value={currentUser.id}
                      onChange={(e) => handleSwitchUser(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden font-semibold cursor-pointer"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setPasswordModalUser(currentUser);
                      setShowAccountDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Key className="w-3.5 h-3.5 text-[#00B7B5]" />
                    Alterar Minha Senha
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('SETTINGS');
                      setShowAccountDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Configurações do Sistema
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Encerrar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1a4746] text-white p-4 space-y-2 text-xs border-b border-[#184443] animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setCurrentTab('DASHBOARD');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
            >
              Dashboard
            </button>

            {permissions.canViewDrivers && (
              <button
                onClick={() => {
                  setCurrentTab('DRIVERS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Motoristas
              </button>
            )}

            {permissions.canCreateBiopsychosocial && (
              <button
                onClick={() => handleStartBiopsychosocial()}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Avaliações Biopsicossociais
              </button>
            )}

            {permissions.canCreateCronotipo && (
              <button
                onClick={() => handleStartCronotipo()}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Avaliações de Cronotipo
              </button>
            )}

            <button
              onClick={() => {
                setCurrentTab('HISTORY');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
            >
              Histórico Longitudinal
            </button>

            {permissions.canViewInterventions && (
              <button
                onClick={() => {
                  setCurrentTab('FATIGUE_INTERVENTIONS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Intervenções em Fadiga
              </button>
            )}

            {permissions.canViewReports && (
              <button
                onClick={() => {
                  setCurrentTab('REPORTS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Pareceres & Relatórios
              </button>
            )}

            {(currentUser.role === 'ADMIN' || permissions.canManageUsers) && (
              <button
                onClick={() => {
                  setCurrentTab('USERS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Usuários & Permissões
              </button>
            )}

            {(currentUser.role === 'ADMIN' || permissions.canViewAuditLogs) && (
              <button
                onClick={() => {
                  setCurrentTab('AUDIT_LOGS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
              >
                Auditoria
              </button>
            )}

            <button
              onClick={() => {
                setCurrentTab('SETTINGS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg font-bold hover:bg-white/10"
            >
              Configurações
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#205857] text-white px-4 py-3 rounded-xl shadow-xl border border-teal-500/30 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#00B7B5]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'DASHBOARD' && (
              <DashboardView
                currentUser={currentUser}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenSyncModal={() => setShowSyncModal(true)}
                onSelectDriverForBio={(d) => handleStartBiopsychosocial(d)}
              />
            )}

            {currentTab === 'DRIVERS' && (
              <DriversList
                currentUser={currentUser}
                onSelectBiopsychosocial={(d) => handleStartBiopsychosocial(d)}
                onSelectCronotipo={(d) => handleStartCronotipo(d)}
              />
            )}

            {currentTab === 'BIOPSYCHOSOCIAL' && (
              <BiopsychosocialForm
                currentUser={currentUser}
                onSaved={handleEvaluationSaved}
                onOpenReport={() => setCurrentTab('REPORTS')}
                preselectedDriver={selectedDriverForBio}
              />
            )}

            {currentTab === 'CRONOTIPO' && (
              <CronotipoForm
                currentUser={currentUser}
                onSaved={handleEvaluationSaved}
                onOpenReport={() => setCurrentTab('REPORTS')}
                preselectedDriver={selectedDriverForCrono}
              />
            )}

            {currentTab === 'HISTORY' && (
              <HistoryView
                currentUser={currentUser}
                onNavigateToBio={(d) => handleStartBiopsychosocial(d)}
                onNavigateToCrono={(d) => handleStartCronotipo(d)}
                onOpenReport={() => setCurrentTab('REPORTS')}
              />
            )}

            {currentTab === 'FATIGUE_INTERVENTIONS' && (
              <FatigueInterventions
                currentUser={currentUser}
                onOpenSyncModal={() => setShowSyncModal(true)}
              />
            )}

            {currentTab === 'REPORTS' && <ReportsView currentUser={currentUser} />}

            {currentTab === 'USERS' && currentUser.role === 'ADMIN' && (
              <UserManagement
                currentUser={currentUser}
                onEditPassword={(u) => setPasswordModalUser(u)}
              />
            )}

            {currentTab === 'AUDIT_LOGS' && currentUser.role === 'ADMIN' && (
              <AuditLogs />
            )}

            {currentTab === 'SETTINGS' && (
              <SettingsView
                currentUser={currentUser}
                onRefreshAll={() => {
                  showToast('Base de dados atualizada.');
                  reloadAppData();
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODAL: EDIT PASSWORD */}
      {passwordModalUser && (
        <EditPasswordModal
          user={passwordModalUser}
          currentUser={currentUser}
          onClose={() => setPasswordModalUser(null)}
          onSuccess={() => {
            showToast(`Senha de ${passwordModalUser.name} alterada com sucesso!`);
            setCurrentUser(getCurrentUser());
          }}
        />
      )}

      {/* MODAL: GOOGLE SHEETS SYNC */}
      {showSyncModal && (
        <GoogleSheetsSyncModal
          onClose={() => setShowSyncModal(false)}
          onDataChanged={() => {
            showToast('Dados sincronizados com sucesso da planilha Google Sheets!');
            reloadAppData();
          }}
        />
      )}
    </div>
  );
}

export default App;
