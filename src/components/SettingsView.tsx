import React, { useState } from 'react';
import { User } from '../types';
import { logAction, clearAllData, seedDemoData } from '../utils/storage';
import {
  Settings,
  Database,
  Clock,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onRefreshAll }) => {
  const [googleSheetUrl, setGoogleSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1ITtQW2lu_6iUxvM72JlHPLwTkJCftFA9nXf4Fv93ycI/edit?usp=sharing'
  );
  const [slaTargetMinutes, setSlaTargetMinutes] = useState(90);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('SELENE_SHEET_URL', googleSheetUrl);
    localStorage.setItem('SELENE_SLA_MINUTES', slaTargetMinutes.toString());
    logAction(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE',
      'SISTEMA',
      undefined,
      'Configurações do sistema e parâmetros de SLA atualizados'
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearData = () => {
    if (confirm('Tem certeza de que deseja limpar todos os registros e iniciar a plataforma completamente vazia?')) {
      clearAllData();
      logAction(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'DELETE',
        'SISTEMA',
        undefined,
        'Base de dados limpa (início vazio conforme Regra 18)'
      );
      setConfirmClear(false);
      onRefreshAll();
    }
  };

  const handleSeedData = () => {
    if (confirm('Deseja carregar a base de dados de demonstração com motoristas e eventos operacionais?')) {
      seedDemoData();
      logAction(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'CREATE',
        'SISTEMA',
        undefined,
        'Dados operacionais de demonstração carregados'
      );
      onRefreshAll();
    }
  };

  const handleBackupExport = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.name,
      drivers: JSON.parse(localStorage.getItem('SELENE_DRIVERS') || '[]'),
      biopsychosocial: JSON.parse(localStorage.getItem('SELENE_BIOPSYCHOSOCIAL') || '[]'),
      cronotipo: JSON.parse(localStorage.getItem('SELENE_CRONOTIPO') || '[]'),
      interventions: JSON.parse(localStorage.getItem('SELENE_FATIGUE_INTERVENTIONS') || '[]')
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selene_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logAction(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'EXPORT',
      'SISTEMA',
      undefined,
      'Backup completo do sistema exportado'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Configurações da Plataforma SELENE</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de integração com Google Sheets, parâmetros de tempo/SLA de fadiga, exportação de backup e estado da base.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Configurações salvas!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Sheets Database Configuration */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-[#205857]" />
            <h3 className="font-bold text-sm text-[#205857]">Banco de Dados Google Sheets</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Conforme a Regra 15, o Google Sheets atua como repositório de persistência e armazenamento das informações de motoristas, intervenções e avaliações.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">URL da Planilha Oficial</label>
              <input
                type="url"
                required
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#00B7B5] font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#00B7B5] hover:text-[#205857] flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir Planilha no Google Drive
              </a>

              <button
                type="submit"
                className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                Salvar Conexão
              </button>
            </div>
          </form>
        </div>

        {/* SLA and Operational Parameters */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-[#205857]" />
            <h3 className="font-bold text-sm text-[#205857]">Parâmetros de SLA de Fadiga</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Configure o limite de tolerância operacional para a realização da intervenção desde o momento em que o evento de fadiga foi gerado (Tempo Total: Evento → Intervenção).
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Limite Crítico de SLA (Minutos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={15}
                  max={240}
                  step={5}
                  value={slaTargetMinutes}
                  onChange={(e) => setSlaTargetMinutes(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#00B7B5] font-mono font-bold"
                />
                <span className="text-slate-500 font-semibold">
                  (Padrão: 90 minutos / 01:30)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Classificações no Dashboard:</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>🟢 Dentro do SLA: Até {Math.round(slaTargetMinutes * 0.75)} minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>🟡 Próximo ao Limite: {Math.round(slaTargetMinutes * 0.75)} a {slaTargetMinutes} minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>🔴 Acima do SLA (Crítico): Mais de {slaTargetMinutes} minutos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database State Management & Reset (Rule 18) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <RefreshCw className="w-5 h-5 text-[#205857]" />
            <h3 className="font-bold text-sm text-[#205857]">Gestão da Base de Dados (Regra 18 & 39)</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Conforme as diretrizes do projeto, o sistema pode ser inicializado totalmente vazio ou recarregado com dados operacionais para testes e demonstrações.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Limpar Base (Iniciar Vazio)
            </button>

            <button
              onClick={handleSeedData}
              className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#205857] border border-teal-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-[#00B7B5]" />
              Restaurar Dados Operacionais
            </button>
          </div>
        </div>

        {/* System Backup & JSON Export */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-[#205857]" />
            <h3 className="font-bold text-sm text-[#205857]">Backup e Segurança da Informação</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Gere uma cópia completa de todos os motoristas, avaliações biopsicossociais, cronotipos e intervenções em formato JSON seguro para arquivamento.
          </p>

          <div className="pt-2">
            <button
              onClick={handleBackupExport}
              className="px-4 py-2 bg-[#00B7B5] hover:bg-[#009e9c] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Baixar Arquivo de Backup Completo (.JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
