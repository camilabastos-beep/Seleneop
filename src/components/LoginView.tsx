import React, { useState } from 'react';
import { TransparanaLogo } from './TransparanaLogo';
import { User } from '../types';
import { getUsers, setCurrentUserSession, logAction } from '../utils/storage';
import { Lock, Mail, ArrowRight, ShieldCheck, HelpCircle, CheckCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg('Usuário não encontrado. Verifique o e-mail digitado.');
      return;
    }

    if (!user.active) {
      setErrorMsg('Este usuário está inativo. Entre em contato com o administrador.');
      return;
    }

    if (user.password && user.password !== cleanPass) {
      setErrorMsg('Senha incorreta. Tente novamente ou use "Esqueci minha senha".');
      return;
    }

    // Success
    setCurrentUserSession(user);
    logAction(user.id, user.name, user.role, 'LOGIN', 'SISTEMA', undefined, `Login realizado com sucesso por ${user.name}`);
    onLoginSuccess(user);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-800 selection:bg-[#00B7B5] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Institutional Branding Container */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="mb-3">
            <TransparanaLogo size="xl" showSlogan={false} />
          </div>
          <h1 className="text-2xl font-black text-[#205857] tracking-tight">SELENE</h1>
          <p className="text-xs font-semibold text-[#00B7B5] uppercase tracking-widest mt-0.5">
            Cuidando de Quem Conduz
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Plataforma Integrada de Avaliação Biopsicossocial, Mapeamento Circadiano e Gestão de Fadiga
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-shake">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Institucional</label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="exemplo@etp-transparana.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Senha</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-[#00B7B5] hover:text-[#205857] transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white bg-[#00B7B5] hover:bg-[#009e9c] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#00B7B5] transition-all"
              >
                <span>Entrar no SELENE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Institutional Compliance Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-[#9F9F9F]">
            <ShieldCheck className="w-4 h-4 text-[#205857]" />
            <span>Acesso restrito · Confidencialidade e LGPD</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#205857]">Recuperação de Acesso</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {!forgotSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Informe o seu e-mail institucional da Transparaná para solicitar a redefinição de senha ao administrador.
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#00B7B5]"
                    placeholder="exemplo@etp-transparana.com.br"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00B7B5] hover:bg-[#009e9c] text-white font-bold rounded-lg"
                  >
                    Solicitar Redefinição
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Solicitação Enviada</h4>
                <p className="text-xs text-slate-600">
                  As orientações para redefinição foram registradas para o e-mail <strong>{forgotEmail}</strong>. Por favor, contate o administrador do sistema.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-[#205857] text-white font-bold rounded-lg text-xs"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
