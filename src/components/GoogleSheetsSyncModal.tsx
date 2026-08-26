import React, { useState } from 'react';
import { DEFAULT_SHEET_URL, exportInterventionsToCSV, getFatigueInterventions, importInterventionsFromCSV, downloadCSV, getDrivers, getBiopsychosocialEvaluations, getCronotipoEvaluations } from '../utils/storage';
import { ExternalLink, FileSpreadsheet, Upload, Download, Check, AlertCircle, RefreshCw, X, Database, ShieldCheck } from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  onClose: () => void;
  onDataChanged: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({ onClose, onDataChanged }) => {
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'import' | 'export'>('info');

  const handleExportInterventions = () => {
    setIsExporting(true);
    const interventions = getFatigueInterventions();
    const csvContent = exportInterventionsToCSV(interventions);
    downloadCSV(`SELENE_Intervencoes_Fadiga_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    setIsExporting(false);
  };

  const handleExportAll = () => {
    // Generate multi-section consolidated data
    const interventions = getFatigueInterventions();
    const drivers = getDrivers();
    const biopsychosocial = getBiopsychosocialEvaluations();
    const cronotipo = getCronotipoEvaluations();

    const summaryJson = {
      sistema: 'SELENE | Transparaná - Gestão de Fadiga & Fator Humano',
      dataExportacao: new Date().toISOString(),
      motoristasTotal: drivers.length,
      biopsicossocialTotal: biopsychosocial.length,
      cronotipoTotal: cronotipo.length,
      intervencoesFadigaTotal: interventions.length,
      motoristas: drivers,
      biopsicossocial: biopsychosocial,
      cronotipo: cronotipo,
      intervencoes: interventions
    };

    const blob = new Blob([JSON.stringify(summaryJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SELENE_Backup_Completo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    if (!csvInput.trim()) return;
    const result = importInterventionsFromCSV(csvInput);
    setImportStatus(result);
    if (result.success > 0) {
      onDataChanged();
      setCsvInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvInput(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00B7B5]/20 text-[#00B7B5]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Banco de Dados — Google Sheets</h3>
              <p className="text-xs text-slate-200">SELENE & Transparaná Transportes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-[#00B7B5] text-[#205857] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Planilha Oficial Conectada
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-[#00B7B5] text-[#205857] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Dados (Excel / CSV)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-[#00B7B5] text-[#205857] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Importar / Sincronizar em Lote
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Integração Direta com Google Drive</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    O SELENE está configurado para operar com a base na planilha oficial da Transparaná, permitindo que a equipe de gestão de frotas e psicologia consulte, audite e filtre dados sem necessidade de intervenção técnica.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link da Planilha Oficial Google Sheets:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-600 select-all"
                  />
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#00B7B5] hover:bg-[#009b99] rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Planilha
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-[#205857] block mb-1">
                    Como funciona o sincronismo?
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você pode baixar o arquivo CSV com um clique e colar ou importar na planilha, ou importar dados da planilha para atualizar os cálculos automáticos e SLAs do sistema.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-[#205857] block mb-1">
                    Benefícios operacionais
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Elimina planilhas manuais com fórmulas quebradas mês a mês, centralizando tudo em uma base unificada com tempos calculados e sem retrabalho.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-1">Exportação de Intervenções de Fadiga</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Gera arquivo CSV compatível com Google Sheets e Microsoft Excel com todos os registros e colunas calculadas (Evento→Chegada, Solicitação→Resposta, SLA, etc.).
                </p>
                <button
                  onClick={handleExportInterventions}
                  disabled={isExporting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#205857] hover:bg-[#184443] rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Baixar Planilha de Intervenções (.CSV)
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-1">Backup Completo do Sistema (JSON)</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Exporta Motoristas, Avaliações Biopsicossociais, Cronotipos e Intervenções em arquivo consolidado para segurança da informação.
                </p>
                <button
                  onClick={handleExportAll}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  Baixar Backup Geral (.JSON)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              {importStatus && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  importStatus.success > 0
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {importStatus.success > 0 ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    Importação finalizada: <strong>{importStatus.success} registros importados com sucesso</strong>.
                    {importStatus.failed > 0 && ` (${importStatus.failed} linhas ignoradas/inválidas)`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Carregar Arquivo .CSV da Planilha:
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00B7B5] file:text-white hover:file:bg-[#009b99] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ou cole o conteúdo CSV / dados da planilha aqui:
                </label>
                <textarea
                  rows={5}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Data,ID,Placa,Motorista,Evento e chegada,Chegada e solicitação,Solicitação e resposta,Parada e intervenção,Solicitação e intervenção,Evento e intervenção,Motivo para não realização,Status"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleImportCSV}
                  disabled={!csvInput.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#205857] hover:bg-[#184443] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  Processar e Sincronizar Linhas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Banco Conectado: Google Sheets / Transparaná Transportes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
