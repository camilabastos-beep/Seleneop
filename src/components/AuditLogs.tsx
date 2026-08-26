import React, { useState } from 'react';
import { AuditLog } from '../types';
import { getAuditLogs, downloadCSV } from '../utils/storage';
import { History, Search, Download, Filter, Shield, User, Clock } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedResource, setSelectedResource] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetName && log.targetName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesResource = selectedResource === 'ALL' || log.resource === selectedResource;

    return matchesSearch && matchesAction && matchesResource;
  });

  const handleExportLogs = () => {
    const headers = ['Data e Hora', 'Usuário', 'Perfil', 'Ação', 'Módulo / Recurso', 'Alvo', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.targetName || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    downloadCSV(`SELENE_Log_Auditoria_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const actionColors: Record<string, string> = {
    LOGIN: 'bg-blue-100 text-blue-800 border-blue-200',
    CREATE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    UPDATE: 'bg-amber-100 text-amber-800 border-amber-200',
    DELETE: 'bg-rose-100 text-rose-800 border-rose-200',
    VIEW: 'bg-slate-100 text-slate-700 border-slate-200',
    PASSWORD_CHANGE: 'bg-purple-100 text-purple-800 border-purple-200',
    EXPORT: 'bg-teal-100 text-teal-800 border-teal-200'
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Rastreabilidade & Log de Auditoria</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico e imutável de todas as ações, visualizações de prontuários, cadastros e alterações realizadas no SELENE.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-[#00B7B5]" />
          Exportar Relatório de Auditoria (.CSV)
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por usuário, motorista ou detalhes da ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE">CREATE (Criação)</option>
            <option value="UPDATE">UPDATE (Alteração)</option>
            <option value="DELETE">DELETE (Exclusão)</option>
            <option value="VIEW">VIEW (Visualização)</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
          </select>

          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
          >
            <option value="ALL">Todos os Módulos</option>
            <option value="MOTORISTA">Motoristas</option>
            <option value="BIOPSICOSSOCIAL">Biopsicossocial</option>
            <option value="CRONOTIPO">Cronotipo</option>
            <option value="INTERVENCAO_FADIGA">Intervenção Fadiga</option>
            <option value="USUARIO">Usuários & Senhas</option>
            <option value="SISTEMA">Sistema Geral</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Descrição da Atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.userName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span>{log.details}</span>
                      {log.targetName && (
                        <span className="ml-1 text-[#205857] font-semibold">
                          [Alvo: {log.targetName}]
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
