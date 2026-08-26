import React, { useState } from 'react';
import { User, Driver, BiopsychosocialEvaluation, CronotipoEvaluation, FatigueIntervention } from '../types';
import {
  getDrivers,
  getBiopsychosocialEvaluations,
  getCronotipoEvaluations,
  getFatigueInterventions
} from '../utils/storage';
import {
  History,
  Search,
  UserCheck,
  Activity,
  Sun,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Paperclip,
  Download,
  Eye,
  Filter,
  Shield,
  ArrowRight
} from 'lucide-react';

interface HistoryViewProps {
  currentUser: User;
  onNavigateToBio: (driver: Driver) => void;
  onNavigateToCrono: (driver: Driver) => void;
  onOpenReport: (evalId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  onNavigateToBio,
  onNavigateToCrono,
  onOpenReport
}) => {
  const drivers = getDrivers();
  const bioEvals = getBiopsychosocialEvaluations();
  const cronoEvals = getCronotipoEvaluations();
  const fatigueInterventions = getFatigueInterventions();

  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    drivers.length > 0 ? drivers[0].id : ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('ALL');

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || (drivers.length > 0 ? drivers[0] : null);

  // Driver specific data
  const driverBio = selectedDriver
    ? bioEvals.filter((b) => b.driverId === selectedDriver.id || b.driverCpf === selectedDriver.cpf)
    : [];

  const driverCrono = selectedDriver
    ? cronoEvals.filter((c) => c.driverId === selectedDriver.id || c.driverCpf === selectedDriver.cpf)
    : [];

  const driverFatigue = selectedDriver
    ? fatigueInterventions.filter(
        (i) =>
          i.driverId === selectedDriver.id ||
          (selectedDriver.name && i.motorista.toLowerCase().includes(selectedDriver.name.toLowerCase())) ||
          i.placa === selectedDriver.plate
      )
    : [];

  // Build unified chronological timeline items
  interface TimelineItem {
    id: string;
    type: 'BIO' | 'CRONO' | 'FATIGUE';
    date: string;
    title: string;
    description: string;
    badgeText: string;
    badgeClass: string;
    rawDate: number;
    pdfUrl?: string;
    pdfName?: string;
    evalId?: string;
  }

  const timelineItems: TimelineItem[] = [];

  driverBio.forEach((b) => {
    timelineItems.push({
      id: `bio-${b.id}`,
      type: 'BIO',
      date: b.dataAtendimento,
      title: 'Avaliação Biopsicossocial',
      description: `Escore Total: ${b.scoreTotal}/79 | Sono: ${b.sonoScore} | Mental: ${b.saudeMentalScore} | Trabalho: ${b.condicoesTrabalhoScore} | Estilo: ${b.estiloVidaScore}`,
      badgeText: b.classificacao,
      badgeClass:
        b.classificacao === 'Risco alto'
          ? 'bg-rose-100 text-rose-800 border-rose-200'
          : b.classificacao === 'Risco moderado'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rawDate: new Date(b.dataAtendimento).getTime() || 0,
      evalId: b.id
    });
  });

  driverCrono.forEach((c) => {
    timelineItems.push({
      id: `crono-${c.id}`,
      type: 'CRONO',
      date: c.dataAvaliacao,
      title: 'Avaliação de Cronotipo (Horne-Östberg)',
      description: `Pontuação: ${c.totalScore} pontos | Turno recomendado compatível`,
      badgeText: c.classificacao,
      badgeClass: 'bg-teal-100 text-[#205857] border-teal-200',
      rawDate: new Date(c.dataAvaliacao).getTime() || 0
    });
  });

  driverFatigue.forEach((f) => {
    timelineItems.push({
      id: `fatigue-${f.id}`,
      type: 'FATIGUE',
      date: f.data,
      title: `Intervenção em Evento de Fadiga (ID: ${f.eventoId})`,
      description: `Tempo Total: ${f.diffEventoIntervencao || '--:--'} | Status: ${f.statusRegistro} ${
        f.motivoNaoRealizacao ? `| Motivo: ${f.motivoNaoRealizacao}` : ''
      }`,
      badgeText: f.pdfAttachment ? 'Devolutiva Anexada' : 'Devolutiva Pendente',
      badgeClass: f.pdfAttachment
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      rawDate: new Date(f.createdAt).getTime() || 0,
      pdfName: f.pdfAttachment?.name,
      pdfUrl: f.pdfAttachment?.url
    });
  });

  // Sort descending by date
  timelineItems.sort((a, b) => b.rawDate - a.rawDate);

  const filteredTimeline = timelineItems.filter((item) => {
    if (selectedFilterType === 'ALL') return true;
    return item.type === selectedFilterType;
  });

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cpf.includes(searchTerm) ||
      d.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Prontuário e Histórico Longitudinal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento contínuo da saúde ocupacional, evolução temporal de scores, intervenções e evidências documentais.
          </p>
        </div>

        {selectedDriver && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToBio(selectedDriver)}
              className="px-3 py-1.5 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-[#00B7B5]" />
              Nova Avaliação
            </button>
            <button
              onClick={() => onNavigateToCrono(selectedDriver)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              Novo Cronotipo
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Driver Selector vs. Driver Longitudinal Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Driver Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Selecionar Motorista</h3>
              <span className="text-[11px] font-bold text-[#205857]">{drivers.length} no efetivo</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#00B7B5]"
              />
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredDrivers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">Nenhum motorista encontrado.</div>
              ) : (
                filteredDrivers.map((d) => {
                  const isSelected = selectedDriver?.id === d.id;
                  const bioCount = bioEvals.filter((b) => b.driverId === d.id || b.driverCpf === d.cpf).length;
                  const fatigueCount = fatigueInterventions.filter(
                    (i) => i.driverId === d.id || i.motorista.toLowerCase().includes(d.name.toLowerCase()) || i.placa === d.plate
                  ).length;

                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDriverId(d.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-50/70 border-[#00B7B5] shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-bold text-slate-900 truncate">{d.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <span>{d.cpf}</span>
                          <span>•</span>
                          <span>{d.plate}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            d.riskLevel === 'ALTO'
                              ? 'bg-rose-100 text-rose-800'
                              : d.riskLevel === 'MODERADO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {d.riskLevel || 'BAIXO'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {bioCount} bio · {fatigueCount} fadiga
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Longitudinal Profile & Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDriver ? (
            <>
              {/* Driver Header Summary Card */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedDriver.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-mono">CPF: {selectedDriver.cpf}</span>
                      <span>•</span>
                      <span>Placa: <strong className="text-slate-800 font-mono">{selectedDriver.plate}</strong></span>
                      <span>•</span>
                      <span>Filial: <strong className="text-slate-800">{selectedDriver.filial}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        selectedDriver.riskLevel === 'ALTO'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : selectedDriver.riskLevel === 'MODERADO'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {selectedDriver.riskLevel || 'BAIXO'} RISCO
                    </span>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Biopsicossociais</span>
                    <span className="text-xl font-black text-[#205857]">{driverBio.length}</span>
                    <span className="text-[10px] text-slate-500 block">avaliados</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cronotipo</span>
                    <span className="text-xl font-black text-amber-700">{driverCrono.length}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {driverCrono[0]?.classificacao || 'Pendente'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Eventos Fadiga</span>
                    <span className="text-xl font-black text-slate-800">{driverFatigue.length}</span>
                    <span className="text-[10px] text-slate-500 block">intervenções</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Devolutivas</span>
                    <span className="text-xl font-black text-emerald-700">
                      {driverFatigue.filter((f) => f.pdfAttachment).length} / {driverFatigue.length}
                    </span>
                    <span className="text-[10px] text-slate-500 block">comprovadas</span>
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-[#205857] text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#00B7B5]" />
                      Linha do Tempo Longitudinal
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evolução dos laudos, cronotipos, intervenções e planos de ação.
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => setSelectedFilterType('ALL')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedFilterType === 'ALL' ? 'bg-white shadow-2xs text-[#205857] font-bold' : 'text-slate-600'
                      }`}
                    >
                      Todos ({timelineItems.length})
                    </button>
                    <button
                      onClick={() => setSelectedFilterType('BIO')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedFilterType === 'BIO' ? 'bg-white shadow-2xs text-[#205857] font-bold' : 'text-slate-600'
                      }`}
                    >
                      Bio ({driverBio.length})
                    </button>
                    <button
                      onClick={() => setSelectedFilterType('CRONO')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedFilterType === 'CRONO' ? 'bg-white shadow-2xs text-[#205857] font-bold' : 'text-slate-600'
                      }`}
                    >
                      Crono ({driverCrono.length})
                    </button>
                    <button
                      onClick={() => setSelectedFilterType('FATIGUE')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedFilterType === 'FATIGUE' ? 'bg-white shadow-2xs text-[#205857] font-bold' : 'text-slate-600'
                      }`}
                    >
                      Fadiga ({driverFatigue.length})
                    </button>
                  </div>
                </div>

                {filteredTimeline.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-slate-700">Nenhum registro histórico encontrado.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Inicie uma avaliação ou importe eventos de fadiga para registrar este motorista.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {filteredTimeline.map((item) => (
                      <div key={item.id} className="relative group">
                        {/* Timeline Bullet Node */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                            item.type === 'BIO'
                              ? 'border-[#205857] text-[#205857]'
                              : item.type === 'CRONO'
                              ? 'border-amber-500 text-amber-600'
                              : 'border-[#00B7B5] text-[#00B7B5]'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.type === 'BIO'
                                ? 'bg-[#205857]'
                                : item.type === 'CRONO'
                                ? 'bg-amber-500'
                                : 'bg-[#00B7B5]'
                            }`}
                          />
                        </div>

                        {/* Card Content */}
                        <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 border border-slate-200 transition-all space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{item.title}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeClass}`}>
                                {item.badgeText}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.date}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                          {/* Action links / Attachment View */}
                          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/60">
                            {item.evalId && (
                              <button
                                onClick={() => onOpenReport(item.evalId!)}
                                className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 rounded-md text-[11px] font-bold text-[#205857] transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-[#00B7B5]" />
                                Visualizar Parecer Enxuto
                              </button>
                            )}

                            {item.pdfName && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold">
                                <Paperclip className="w-3 h-3 text-emerald-600" />
                                {item.pdfName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Nenhum Motorista Selecionado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Selecione um motorista à esquerda para visualizar seu prontuário longitudinal completo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
