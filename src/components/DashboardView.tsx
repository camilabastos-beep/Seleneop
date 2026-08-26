import React from 'react';
import { User, Driver } from '../types';
import { getDrivers, getBiopsychosocialEvaluations, getCronotipoEvaluations, getFatigueInterventions } from '../utils/storage';
import { parseMinutes, formatMinutesToHHMM } from '../utils/scoring';
import {
  Users, Activity, Sun, Clock, AlertTriangle, CheckCircle,
  Upload, ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: any) => void;
  onOpenSyncModal: () => void;
  onSelectDriverForBio: (driver: Driver) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onOpenSyncModal,
  onSelectDriverForBio
}) => {
  const drivers = getDrivers();
  const bioEvals = getBiopsychosocialEvaluations();
  const cronoEvals = getCronotipoEvaluations();
  const fatigueInterventions = getFatigueInterventions();

  // Biopsychosocial Risk Distribution
  const bioRiskCounts = {
    baixo: bioEvals.filter((b) => b.classificacao === 'Baixo risco').length,
    moderado: bioEvals.filter((b) => b.classificacao === 'Risco moderado').length,
    alto: bioEvals.filter((b) => b.classificacao === 'Risco alto').length
  };

  // Cronotipo Distribution
  const cronoCounts = {
    matutinoExtremo: cronoEvals.filter((c) => c.classificacao === 'Matutino extremo').length,
    modMatutino: cronoEvals.filter((c) => c.classificacao === 'Moderadamente Matutino').length,
    intermediario: cronoEvals.filter((c) => c.classificacao === 'Intermediário').length,
    modVespertino: cronoEvals.filter((c) => c.classificacao === 'Moderadamente Vespertino').length,
    vespertinoExtremo: cronoEvals.filter((c) => c.classificacao === 'Vespertino extremo').length
  };

  // Fatigue KPIs
  let totalFatigueMinutes = 0;
  let countRealizadas = 0;
  let breachedSlaCount = 0;

  fatigueInterventions.forEach((f) => {
    const mins = parseMinutes(f.diffEventoIntervencao);
    if (mins > 0 && f.statusRegistro !== 'ENCERRADA') {
      totalFatigueMinutes += mins;
      countRealizadas++;
    }
    if (mins > 90) breachedSlaCount++;
  });

  const avgFatigueTime = countRealizadas > 0 ? formatMinutesToHHMM(totalFatigueMinutes / countRealizadas) : '00:00';

  // High Risk Drivers
  const highRiskDrivers = drivers.filter((d) => d.riskLevel === 'ALTO' || bioEvals.some(b => b.driverId === d.id && b.classificacao === 'Risco alto'));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#205857] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#00B7B5] bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
              Transparaná Cuidando de Quem Conduz
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel Executivo de Gestão e Prevenção de Fadiga
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed">
              Bem-vindo(a), <span className="text-white font-bold">{currentUser.name}</span> ({currentUser.role}). Centralize o monitoramento biopsicossocial, gestão circadiana e tempos de resposta aos eventos de fadiga.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            <button
              onClick={onOpenSyncModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 border border-white/15 backdrop-blur-xs"
            >
              <Upload className="w-4 h-4 text-[#00B7B5]" />
              Sincronizar Google Sheets
            </button>
          </div>
        </div>

        {/* Decorative subtle background accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('DRIVERS')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#00B7B5] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Efetivo de Motoristas</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#205857] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{drivers.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Cadastrados nas filiais</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('BIOPSYCHOSOCIAL')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#00B7B5] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avaliações Biopsicossociais</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{bioEvals.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Laudos emitidos</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('CRONOTIPO')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#00B7B5] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfis de Cronotipo</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{cronoEvals.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Horne-Östberg mapeados</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('FATIGUE_INTERVENTIONS')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#00B7B5] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempo Médio Resposta</span>
            <div className="w-9 h-9 rounded-lg bg-[#205857]/10 text-[#205857] flex items-center justify-center font-mono">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#205857] font-mono">{avgFatigueTime}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Evento → Intervenção realizada</span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biopsychosocial Risk Breakdown */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#205857] text-sm">Distribuição de Risco Biopsicossocial</h3>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-700">Baixo Risco (0–26 pts)</span>
                <span className="text-slate-700 font-bold">{bioRiskCounts.baixo} motoristas</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${bioEvals.length > 0 ? (bioRiskCounts.baixo / bioEvals.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">Risco Moderado (27–53 pts)</span>
                <span className="text-slate-700 font-bold">{bioRiskCounts.moderado} motoristas</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${bioEvals.length > 0 ? (bioRiskCounts.moderado / bioEvals.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-700">Risco Alto (54–79 pts)</span>
                <span className="text-slate-700 font-bold">{bioRiskCounts.alto} motoristas</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${bioEvals.length > 0 ? (bioRiskCounts.alto / bioEvals.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-snug">
            Motoristas classificados com risco alto demandam plano de ação prioritário e acompanhamento da saúde ocupacional.
          </p>
        </div>

        {/* Circadian Profile Breakdown */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#205857] text-sm">Perfis de Cronotipo (Horne-Östberg)</h3>
            <Sun className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-orange-900 font-medium">Matutino Extremo (70–86)</span>
              <span className="font-bold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full text-[11px]">
                {cronoCounts.matutinoExtremo}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-amber-900 font-medium">Mod. Matutino (59–69)</span>
              <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px]">
                {cronoCounts.modMatutino}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#205857] font-medium">Intermediário (42–58)</span>
              <span className="font-bold bg-teal-100 text-[#205857] px-2 py-0.5 rounded-full text-[11px]">
                {cronoCounts.intermediario}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-blue-900 font-medium">Mod. Vespertino (31–41)</span>
              <span className="font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[11px]">
                {cronoCounts.modVespertino}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-indigo-900 font-medium">Vespertino Extremo (16–30)</span>
              <span className="font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full text-[11px]">
                {cronoCounts.vespertinoExtremo}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-snug">
            Adequação de escalas e turnos conforme o perfil circadiano previne microssonolência e acidentes.
          </p>
        </div>

        {/* Priority Attention / Attention List */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#205857] text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Atenção & Risco Operacional
            </h3>
          </div>

          {highRiskDrivers.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nenhum condutor em estado crítico no momento.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {highRiskDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{driver.name}</h4>
                    <span className="text-[10px] text-slate-500">Placa: {driver.plate} · Filial: {driver.filial}</span>
                  </div>
                  <button
                    onClick={() => onSelectDriverForBio(driver)}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded text-[10px] transition-colors"
                  >
                    Avaliar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('FATIGUE_INTERVENTIONS')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              Ver Tabela de Eventos de Fadiga
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
