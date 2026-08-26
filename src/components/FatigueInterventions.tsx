import React, { useState, useMemo } from 'react';
import { FatigueIntervention, User } from '../types';
import {
  getFatigueInterventions,
  saveFatigueIntervention,
  deleteFatigueIntervention,
  getDrivers,
  exportInterventionsToCSV,
  downloadCSV
} from '../utils/storage';
import { calculateTimeDiff, parseMinutes, formatMinutesToHHMM, evaluateSla } from '../utils/scoring';
import {
  Clock,
  Plus,
  Search,
  Download,
  Upload,
  Paperclip,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BarChart3,
  ListFilter,
  Filter,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Moon,
  Sun,
  Sunset,
  Sunrise,
  Truck
} from 'lucide-react';

interface FatigueInterventionsProps {
  currentUser: User;
  onOpenSyncModal: () => void;
}

export const FatigueInterventions: React.FC<FatigueInterventionsProps> = ({
  currentUser,
  onOpenSyncModal
}) => {
  const [interventions, setInterventions] = useState<FatigueIntervention[]>(() =>
    getFatigueInterventions()
  );
  const drivers = getDrivers();

  // View Mode: Table vs Dashboard
  const [viewMode, setViewMode] = useState<'TABLE' | 'DASHBOARD'>('TABLE');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMotivo, setSelectedMotivo] = useState('ALL');
  const [onlyBreachedSla, setOnlyBreachedSla] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FatigueIntervention | null>(null);

  // Attachment Preview Modal
  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    size?: string;
    uploadedAt: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FatigueIntervention>>({
    eventoId: '',
    data: new Date().toLocaleDateString('pt-BR'),
    placa: '',
    motorista: '',
    horaEvento: '08:00',
    horaChegada: '08:05',
    horaSolicitacao: '08:15',
    horaRespostaGR: '08:20',
    horaParadaMotorista: '08:35',
    horaRealizacao: '08:50',
    motivoNaoRealizacao: '',
    statusRegistro: 'SIM',
    observacoes: ''
  });

  const reloadData = () => {
    setInterventions(getFatigueInterventions());
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      eventoId: `EVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      data: new Date().toLocaleDateString('pt-BR'),
      placa: '',
      motorista: '',
      horaEvento: '08:00',
      horaChegada: '08:05',
      horaSolicitacao: '08:15',
      horaRespostaGR: '08:20',
      horaParadaMotorista: '08:35',
      horaRealizacao: '08:50',
      motivoNaoRealizacao: '',
      statusRegistro: 'SIM',
      observacoes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: FatigueIntervention) => {
    setEditingItem(item);
    setFormData({
      ...item
    });
    setShowModal(true);
  };

  const handleDriverSelect = (driverName: string) => {
    const matched = drivers.find((d) => d.name.toLowerCase() === driverName.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      motorista: driverName,
      placa: matched?.plate || prev.placa || ''
    }));
  };

  // Live interval calculations for Form Modal
  const liveIntervals = useMemo(() => {
    const eventoChegada = calculateTimeDiff(formData.horaEvento, formData.horaChegada);
    const chegadaSolicitacao = calculateTimeDiff(formData.horaChegada, formData.horaSolicitacao);
    const solicitacaoResposta = calculateTimeDiff(formData.horaSolicitacao, formData.horaRespostaGR);
    const paradaIntervencao = calculateTimeDiff(formData.horaParadaMotorista, formData.horaRealizacao);
    const solicitacaoIntervencao = calculateTimeDiff(formData.horaSolicitacao, formData.horaRealizacao);
    const eventoIntervencao = calculateTimeDiff(formData.horaEvento, formData.horaRealizacao);

    return {
      eventoChegada,
      chegadaSolicitacao,
      solicitacaoResposta,
      paradaIntervencao,
      solicitacaoIntervencao,
      eventoIntervencao
    };
  }, [
    formData.horaEvento,
    formData.horaChegada,
    formData.horaSolicitacao,
    formData.horaRespostaGR,
    formData.horaParadaMotorista,
    formData.horaRealizacao
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      pdfAttachment: {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString()
      }
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motorista?.trim()) {
      alert('Selecione ou informe o nome do motorista.');
      return;
    }
    if (!formData.placa?.trim()) {
      alert('Informe a placa do veículo para a intervenção.');
      return;
    }

    const itemToSave: FatigueIntervention = {
      id: editingItem ? editingItem.id : `int-${Date.now()}`,
      eventoId: formData.eventoId?.trim() || `EVT-${Date.now().toString().slice(-6)}`,
      data: formData.data?.trim() || new Date().toLocaleDateString('pt-BR'),
      placa: formData.placa.trim().toUpperCase(),
      motorista: formData.motorista.trim().toUpperCase(),
      horaEvento: formData.horaEvento,
      horaChegada: formData.horaChegada,
      horaSolicitacao: formData.horaSolicitacao,
      horaRespostaGR: formData.horaRespostaGR,
      horaParadaMotorista: formData.horaParadaMotorista,
      horaRealizacao: formData.horaRealizacao,
      diffEventoChegada: liveIntervals.eventoChegada,
      diffChegadaSolicitacao: liveIntervals.chegadaSolicitacao,
      diffSolicitacaoResposta: liveIntervals.solicitacaoResposta,
      diffParadaIntervencao: liveIntervals.paradaIntervencao,
      diffSolicitacaoIntervencao: liveIntervals.solicitacaoIntervencao,
      diffEventoIntervencao: liveIntervals.eventoIntervencao,
      motivoNaoRealizacao: formData.motivoNaoRealizacao,
      statusRegistro: formData.statusRegistro,
      observacoes: formData.observacoes,
      pdfAttachment: formData.pdfAttachment,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    saveFatigueIntervention(itemToSave);
    setShowModal(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este registro de intervenção de fadiga?')) {
      deleteFatigueIntervention(id);
      reloadData();
    }
  };

  // Month extraction helper
  const availableMonths = useMemo(() => {
    const setM = new Set<string>();
    interventions.forEach((i) => {
      if (i.data && i.data.includes('/')) {
        const parts = i.data.split('/');
        if (parts.length >= 2) {
          const monthYear = `${parts[1]}/${parts[2] || '2026'}`;
          setM.add(monthYear);
        }
      }
    });
    return Array.from(setM).sort().reverse();
  }, [interventions]);

  // Motivos options list (Requested by user)
  const motivosNaoRealizacaoList = [
    'Sem retorno do motorista',
    'Sem retorno da torre de fadiga',
    'Sem retorno da empresa',
    'Motorista finalizou a jornada',
    'Motorista em area de sem sinal',
    'Sem o devido acompanhamento',
    'Outro motivo operacional'
  ];

  // Filtered List
  const filteredInterventions = useMemo(() => {
    return interventions.filter((item) => {
      const matchSearch =
        item.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.eventoId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMonth =
        selectedMonth === 'ALL' ||
        (item.data && item.data.includes(`/${selectedMonth}`));

      const matchStatus =
        selectedStatus === 'ALL' || item.statusRegistro === selectedStatus;

      const matchMotivo =
        selectedMotivo === 'ALL' ||
        (selectedMotivo === 'WITH_MOTIVO' ? Boolean(item.motivoNaoRealizacao) : item.motivoNaoRealizacao === selectedMotivo);

      const totalMins = parseMinutes(item.diffEventoIntervencao);
      const isBreached = totalMins > 120; // SLA total > 2h

      if (onlyBreachedSla && !isBreached) return false;

      // Date Range Filtering (supports DD/MM/YYYY and YYYY-MM-DD)
      if (startDate || endDate) {
        if (!item.data) return false;
        let itemDateObj: Date | null = null;
        if (item.data.includes('/')) {
          const parts = item.data.split('/');
          if (parts.length === 3) {
            itemDateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        } else if (item.data.includes('-')) {
          itemDateObj = new Date(item.data);
        }

        if (itemDateObj && !isNaN(itemDateObj.getTime())) {
          if (startDate) {
            const startObj = new Date(startDate);
            startObj.setHours(0, 0, 0, 0);
            if (itemDateObj < startObj) return false;
          }
          if (endDate) {
            const endObj = new Date(endDate);
            endObj.setHours(23, 59, 59, 999);
            if (itemDateObj > endObj) return false;
          }
        }
      }

      return matchSearch && matchMonth && matchStatus && matchMotivo;
    });
  }, [interventions, searchTerm, selectedMonth, selectedStatus, selectedMotivo, onlyBreachedSla, startDate, endDate]);

  // Dashboard Stats for Fatigue Interventions (calculated on filteredInterventions)
  const stats = useMemo(() => {
    let countRealizadas = 0;
    let enceradasCount = 0;

    let slaEventoChegadaOk = 0;
    let slaRespostaGrOk = 0;
    let slaTotalOk = 0;
    let breachedSlaCount = 0;

    let totalMinsTotal = 0;
    let totalMinsEventoChegada = 0;
    let totalMinsSolicitacaoResposta = 0;
    let totalMinsSolicitacaoIntervencao = 0;

    // Time-of-day counts
    let madrugadaCount = 0; // 00:00 - 06:00
    let manhaCount = 0;     // 06:00 - 12:00
    let tardeCount = 0;     // 12:00 - 18:00
    let noiteCount = 0;     // 18:00 - 00:00

    // Motivos counts
    const motivosMap: Record<string, number> = {
      'Sem retorno do motorista': 0,
      'Sem retorno da torre de fadiga': 0,
      'Sem retorno da empresa': 0,
      'Motorista finalizou a jornada': 0,
      'Motorista em area de sem sinal': 0,
      'Sem o devido acompanhamento': 0,
      'Outro motivo operacional': 0
    };

    // Plates frequency map
    const plateCounts: Record<string, { plate: string; driver: string; count: number }> = {};

    const listToProcess = filteredInterventions;

    listToProcess.forEach((item) => {
      if (item.statusRegistro === 'ENCERRADA' || item.motivoNaoRealizacao) {
        enceradasCount++;
        const mot = item.motivoNaoRealizacao || 'Outro motivo operacional';
        if (motivosMap[mot] !== undefined) {
          motivosMap[mot]++;
        } else {
          motivosMap['Outro motivo operacional'] = (motivosMap['Outro motivo operacional'] || 0) + 1;
        }
      } else {
        const minsTotal = parseMinutes(item.diffEventoIntervencao);
        if (minsTotal > 0) {
          totalMinsTotal += minsTotal;
          countRealizadas++;
        }
      }

      // Hour categorization
      if (item.horaEvento) {
        const hour = parseInt(item.horaEvento.split(':')[0], 10);
        if (!isNaN(hour)) {
          if (hour >= 0 && hour < 6) madrugadaCount++;
          else if (hour >= 6 && hour < 12) manhaCount++;
          else if (hour >= 12 && hour < 18) tardeCount++;
          else noiteCount++;
        }
      }

      // Plate categorization
      if (item.placa) {
        const p = item.placa.toUpperCase();
        if (!plateCounts[p]) {
          plateCounts[p] = { plate: p, driver: item.motorista, count: 0 };
        }
        plateCounts[p].count++;
      }

      const minsEvCheg = parseMinutes(item.diffEventoChegada);
      if (minsEvCheg <= 10 && minsEvCheg > 0) slaEventoChegadaOk++;

      const minsResp = parseMinutes(item.diffSolicitacaoResposta);
      if (minsResp <= 10 && minsResp > 0) slaRespostaGrOk++;

      const minsTotalAll = parseMinutes(item.diffEventoIntervencao);
      if (minsTotalAll <= 120 && minsTotalAll > 0) {
        slaTotalOk++;
      } else if (minsTotalAll > 120) {
        breachedSlaCount++;
      }

      totalMinsEventoChegada += minsEvCheg;
      totalMinsSolicitacaoResposta += minsResp;
      totalMinsSolicitacaoIntervencao += parseMinutes(item.diffSolicitacaoIntervencao);
    });

    const avgTotal = countRealizadas > 0 ? formatMinutesToHHMM(totalMinsTotal / countRealizadas) : '00:00';
    const avgEventoChegada = listToProcess.length > 0 ? formatMinutesToHHMM(totalMinsEventoChegada / listToProcess.length) : '00:00';
    const avgSolResp = listToProcess.length > 0 ? formatMinutesToHHMM(totalMinsSolicitacaoResposta / listToProcess.length) : '00:00';
    const avgSolInt = listToProcess.length > 0 ? formatMinutesToHHMM(totalMinsSolicitacaoIntervencao / listToProcess.length) : '00:00';

    const topPlates = Object.values(plateCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const complianceRate = listToProcess.length > 0
      ? Math.round((slaTotalOk / listToProcess.length) * 100)
      : 100;

    return {
      total: listToProcess.length,
      realizadas: countRealizadas,
      encerradas: enceradasCount,
      breachedSlaCount,
      slaEventoChegadaOk,
      slaRespostaGrOk,
      slaTotalOk,
      complianceRate,
      avgTotal,
      avgEventoChegada,
      avgSolResp,
      avgSolInt,
      madrugadaCount,
      manhaCount,
      tardeCount,
      noiteCount,
      motivosMap,
      topPlates
    };
  }, [filteredInterventions]);

  const handleExportTable = () => {
    const csv = exportInterventionsToCSV(filteredInterventions);
    downloadCSV(`SELENE_Intervencoes_Fadiga_Filtradas_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with View Mode Switcher */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#205857]">
              <Clock className="w-5 h-5 text-[#00B7B5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#205857]">Intervenções em Eventos de Fadiga</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoramento de SLA (Evento-Chegada ≤10m, Resposta GR 5-10m, Solicit.-Intervenção e Total 1h30 a 2h), cálculo automático e motivos de não realização.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-white text-[#205857] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Tabela Operacional
            </button>
            <button
              onClick={() => setViewMode('DASHBOARD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'DASHBOARD'
                  ? 'bg-[#205857] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00B7B5]" />
              Dashboard de Fadiga
            </button>
          </div>

          <button
            onClick={onOpenSyncModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-4 h-4 text-[#00B7B5]" />
            Google Sheets
          </button>

          <button
            onClick={handleExportTable}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#00B7B5]" />
            CSV
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#00B7B5]" />
            Nova Intervenção
          </button>
        </div>
      </div>

      {/* SLA BENCHMARKS SUMMARY BANNER */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#205857]">
            Parâmetros Oficiais de SLA de Intervenção de Fadiga (Transparaná)
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Metas de Gestão Operacional</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Evento → Chegada</span>
            <span className="text-xs font-bold text-emerald-700">Meta: até 10 minutos</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tempo de Resposta (GR)</span>
            <span className="text-xs font-bold text-emerald-700">Meta: 5 a 10 minutos</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Chegada → Intervenção</span>
            <span className="text-xs font-bold text-emerald-700">Meta: até 10 minutos</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total (Evento → Intervenção)</span>
            <span className="text-xs font-bold text-teal-800">Meta: 1h30 a 2h00</span>
          </div>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Total Eventos</span>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{stats.total}</span>
          <span className="text-[10px] text-slate-400">Registrados na base</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">Intervenções Realizadas</span>
          <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">{stats.realizadas}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Com parada segura</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">Não Realizadas</span>
          <span className="text-xl font-extrabold text-amber-800 mt-0.5 block">{stats.encerradas}</span>
          <span className="text-[10px] text-slate-400">Encerradas / Sem contato</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 block uppercase tracking-wider">SLA Excedido (&gt;2h)</span>
          <span className="text-xl font-extrabold text-rose-700 mt-0.5 block">{stats.breachedSlaCount}</span>
          <span className="text-[10px] text-rose-500">Fora do limite operacional</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#205857] block uppercase tracking-wider">Média Evento → Chegada</span>
          <span className="text-xl font-extrabold text-[#205857] mt-0.5 block font-mono">{stats.avgEventoChegada}</span>
          <span className="text-[10px] text-slate-400">Meta: ≤ 10 min</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#00B7B5] block uppercase tracking-wider">Tempo Médio Total</span>
          <span className="text-xl font-extrabold text-[#205857] mt-0.5 block font-mono">{stats.avgTotal}</span>
          <span className="text-[10px] text-slate-400">Meta: 1h30 a 2h00</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: DEDICATED DASHBOARD VIEW */}
      {/* ============================================================== */}
      {viewMode === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dashboard Date & Period Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#205857]" />
              <span className="font-bold text-slate-800">Filtrar Dashboard por Período:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">De:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#00B7B5] outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Até:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#00B7B5] outline-hidden bg-slate-50/50"
                />
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#00B7B5] outline-hidden bg-slate-50/50"
              >
                <option value="ALL">Todos os Meses</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    Mês {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#00B7B5] outline-hidden bg-slate-50/50"
              >
                <option value="ALL">Todos os Status</option>
                <option value="SIM">Realizadas (SIM)</option>
                <option value="NÃO">Não Realizadas (NÃO)</option>
                <option value="ENCERRADA">Encerradas</option>
              </select>

              {(startDate || endDate || selectedMonth !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedMonth('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Exibindo <strong className="text-slate-800">{filteredInterventions.length}</strong> de {interventions.length} eventos
            </span>
          </div>

          {/* Top Row: Motivos de Não Realização & Horários de Fadiga */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Motivos para Não Realização */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Motivos de Não Realização de Intervenções
                  </h3>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {stats.encerradas} Ocorrências
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Distribuição das justificativas operacionais registradas quando a intervenção preventiva não foi realizada com parada do veículo.
              </p>

              <div className="space-y-3 pt-2">
                {motivosNaoRealizacaoList.map((motivo) => {
                  const count = stats.motivosMap[motivo] || 0;
                  const percent = stats.encerradas > 0 ? Math.round((count / stats.encerradas) * 100) : 0;

                  return (
                    <div key={motivo} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 truncate pr-2">{motivo}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-slate-900">{count}</span>
                          <span className="text-[11px] text-slate-400 font-mono w-10 text-right">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            count > 0 ? 'bg-[#205857]' : 'bg-transparent'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Janela Circadiana e Horários dos Eventos */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Incidência de Fadiga por Faixa Horária
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#205857]">Janela 24h</span>
              </div>

              <p className="text-xs text-slate-500">
                Detecção de picos de sonolência na telemetria por turno de condução. A madrugada representa a zona de maior vulnerabilidade circadiana.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-800">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-bold">Madrugada (00h-06h)</span>
                  </div>
                  <span className="text-2xl font-black text-indigo-950 mt-1 block font-mono">
                    {stats.madrugadaCount}
                  </span>
                  <span className="text-[10px] text-indigo-700 font-medium">
                    {stats.total > 0 ? Math.round((stats.madrugadaCount / stats.total) * 100) : 0}% dos eventos
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Sunrise className="w-4 h-4" />
                    <span className="text-xs font-bold">Manhã (06h-12h)</span>
                  </div>
                  <span className="text-2xl font-black text-amber-950 mt-1 block font-mono">
                    {stats.manhaCount}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">
                    {stats.total > 0 ? Math.round((stats.manhaCount / stats.total) * 100) : 0}% dos eventos
                  </span>
                </div>

                <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2 text-[#205857]">
                    <Sun className="w-4 h-4" />
                    <span className="text-xs font-bold">Tarde (12h-18h)</span>
                  </div>
                  <span className="text-2xl font-black text-[#205857] mt-1 block font-mono">
                    {stats.tardeCount}
                  </span>
                  <span className="text-[10px] text-[#205857] font-medium">
                    {stats.total > 0 ? Math.round((stats.tardeCount / stats.total) * 100) : 0}% dos eventos
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Sunset className="w-4 h-4" />
                    <span className="text-xs font-bold">Noite (18h-00h)</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                    {stats.noiteCount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {stats.total > 0 ? Math.round((stats.noiteCount / stats.total) * 100) : 0}% dos eventos
                  </span>
                </div>
              </div>

              {/* SLA Compliance Gauge */}
              <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Taxa de Conformidade de SLA Geral
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Atendimentos concluídos em até 2h00
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-800 font-mono">
                  {stats.complianceRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: SLA Stages Comparison & Top Plates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SLA Stages Funnel */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00B7B5]" />
                Funil dos 4 Intervalos de Tempo Operacionais (Médias Reais x Metas)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">1. Evento → Chegada CCO</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#205857] font-mono">{stats.avgEventoChegada}</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Meta: ≤ 10 min</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Tempo entre o disparo do alerta na cabine e a recepção pela torre.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">2. Solicitação → Resposta GR</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#205857] font-mono">{stats.avgSolResp}</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Meta: 5 a 10 min</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Tempo de retorno da central de Gerenciamento de Risco.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">3. Solicitação → Intervenção</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#205857] font-mono">{stats.avgSolInt}</span>
                    <span className="text-teal-700 font-bold text-[11px]">Meta: ≤ 45 min</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Tempo até contato efetivo com motorista e parada realizada.</p>
                </div>

                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1">
                  <span className="text-[#205857] font-bold uppercase text-[10px]">4. Total Geral (Evento → Intervenção)</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#205857] font-mono">{stats.avgTotal}</span>
                    <span className="text-[#205857] font-bold text-[11px]">Meta: 1h30 a 2h00</span>
                  </div>
                  <p className="text-[10px] text-[#205857]/80">Ciclo completo de proteção contra o risco de fadiga.</p>
                </div>
              </div>
            </div>

            {/* Top Plates with Alerts */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00B7B5]" />
                Veículos com Mais Alertas
              </h3>

              <div className="space-y-2.5">
                {stats.topPlates.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum evento registrado.</p>
                ) : (
                  stats.topPlates.map((item, idx) => (
                    <div
                      key={item.plate}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#205857] text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-mono font-bold text-slate-900 block">{item.plate}</span>
                          <span className="text-[10px] text-slate-500 truncate block">{item.driver}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md text-xs">
                        {item.count} {item.count === 1 ? 'evento' : 'eventos'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: OPERATIONAL TABLE VIEW */}
      {/* ============================================================== */}
      {viewMode === 'TABLE' && (
        <div className="space-y-4">
          {/* FILTER BAR */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por motorista, placa ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
                />
              </div>

              {/* Date Range Inputs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">De:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs text-slate-800 bg-transparent outline-hidden cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">Até:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs text-slate-800 bg-transparent outline-hidden cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {/* Month selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
                >
                  <option value="ALL">Todos os Meses</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      Mês: {m}
                    </option>
                  ))}
                </select>

                {/* Status selector */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="SIM">SIM (Realizada)</option>
                  <option value="NÃO">NÃO (Não Realizada)</option>
                  <option value="ENCERRADA">ENCERRADA</option>
                </select>

                {/* Motivo selector */}
                <select
                  value={selectedMotivo}
                  onChange={(e) => setSelectedMotivo(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden max-w-[180px]"
                >
                  <option value="ALL">Todos os Motivos</option>
                  <option value="WITH_MOTIVO">Com Motivo Informado</option>
                  {motivosNaoRealizacaoList.map((mot) => (
                    <option key={mot} value={mot}>
                      {mot}
                    </option>
                  ))}
                </select>

                {/* Breached SLA button toggle */}
                <button
                  type="button"
                  onClick={() => setOnlyBreachedSla(!onlyBreachedSla)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    onlyBreachedSla
                      ? 'bg-rose-100 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Fora do SLA (&gt;2h)
                </button>

                {(startDate || endDate || selectedMonth !== 'ALL' || selectedStatus !== 'ALL' || selectedMotivo !== 'ALL' || onlyBreachedSla || searchTerm) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSelectedMonth('ALL');
                      setSelectedStatus('ALL');
                      setSelectedMotivo('ALL');
                      setOnlyBreachedSla(false);
                      setSearchTerm('');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                Exibindo <strong className="text-slate-800 font-bold">{filteredInterventions.length}</strong> de {interventions.length} registros
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#205857] text-white font-semibold">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">ID Evento</th>
                    <th className="py-3 px-3">Placa</th>
                    <th className="py-3 px-3">Motorista</th>
                    <th className="py-3 px-2 text-center" title="Meta: até 10 minutos">
                      Ev → Cheg
                    </th>
                    <th className="py-3 px-2 text-center">Cheg → Sol</th>
                    <th className="py-3 px-2 text-center" title="Meta: 5 a 10 minutos">
                      Sol → Resp
                    </th>
                    <th className="py-3 px-2 text-center">Par → Int</th>
                    <th className="py-3 px-2 text-center">Sol → Int</th>
                    <th className="py-3 px-3 text-center" title="Meta: 1h30 a 2h00">
                      Total Geral
                    </th>
                    <th className="py-3 px-3">Status / Motivo</th>
                    <th className="py-3 px-3 text-center">Anexo</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInterventions.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-12 text-slate-400">
                        Nenhum registro de intervenção encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredInterventions.map((item) => {
                      const evChegSla = evaluateSla('EVENTO_CHEGADA', item.diffEventoChegada);
                      const respSla = evaluateSla('RESPOSTA_GR', item.diffSolicitacaoResposta);
                      const totalSla = evaluateSla('EVENTO_INTERVENCAO', item.diffEventoIntervencao);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors font-sans">
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">{item.data}</td>
                          <td className="py-3 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[110px]" title={item.eventoId}>
                            {item.eventoId}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#205857]">{item.placa}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800 truncate max-w-[180px]" title={item.motorista}>
                            {item.motorista}
                          </td>
                          
                          {/* Evento -> Chegada */}
                          <td className="py-3 px-2 text-center font-mono">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${evChegSla.badgeClass}`} title={evChegSla.targetDescription}>
                              {item.diffEventoChegada || '00:00'}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-center font-mono text-slate-600">{item.diffChegadaSolicitacao || '00:00'}</td>

                          {/* Solicitação -> Resposta GR */}
                          <td className="py-3 px-2 text-center font-mono">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${respSla.badgeClass}`} title={respSla.targetDescription}>
                              {item.diffSolicitacaoResposta || '00:00'}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-center font-mono text-slate-600">{item.diffParadaIntervencao || '00:00'}</td>
                          <td className="py-3 px-2 text-center font-mono text-slate-600">{item.diffSolicitacaoIntervencao || '00:00'}</td>

                          {/* Total Geral */}
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] border ${totalSla.badgeClass}`} title={totalSla.targetDescription}>
                              {item.diffEventoIntervencao || '00:00'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-[11px]">
                            {item.motivoNaoRealizacao ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-amber-800">{item.motivoNaoRealizacao}</span>
                                <span className="text-[10px] text-slate-400">Encerrada sem parada</span>
                              </div>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  item.statusRegistro === 'SIM'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {item.statusRegistro}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {item.pdfAttachment ? (
                              <button
                                onClick={() => setPreviewAttachment(item.pdfAttachment!)}
                                className="p-1.5 bg-teal-50 hover:bg-teal-100 text-[#00B7B5] rounded-md transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                                title={`Visualizar: ${item.pdfAttachment.name}`}
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                PDF
                              </button>
                            ) : (
                              <span className="text-slate-300 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1 text-slate-500 hover:text-[#205857] hover:bg-slate-100 rounded-md transition-colors inline-block"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-block"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#205857] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00B7B5]" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Editar Intervenção de Fadiga' : 'Novo Registro de Intervenção de Fadiga'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: ID, Data, Motorista, Placa */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID do Evento</label>
                  <input
                    type="text"
                    value={formData.eventoId}
                    onChange={(e) => setFormData({ ...formData, eventoId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50 outline-hidden"
                    placeholder="Ex: EVT-9281A"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="text"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                    placeholder="DD/MM/AAAA"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Buscar Motorista por Nome *
                  </label>
                  <input
                    type="text"
                    list="drivers-list-options"
                    value={formData.motorista}
                    onChange={(e) => handleDriverSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold outline-hidden focus:ring-2 focus:ring-[#00B7B5]"
                    placeholder="Digite para pesquisar motorista..."
                    required
                  />
                  <datalist id="drivers-list-options">
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.cpf ? `CPF: ${d.cpf} - Placa: ${d.plate || 'N/A'}` : ''}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placa *</label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase outline-hidden focus:ring-2 focus:ring-[#00B7B5]"
                    placeholder="ABC-1234"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Sequential Timers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-[#205857] block text-xs">
                  Horários do Fluxo Operacional (HH:MM)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">1. Hora Evento (Cabine)</label>
                    <input
                      type="time"
                      value={formData.horaEvento}
                      onChange={(e) => setFormData({ ...formData, horaEvento: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">2. Hora Chegada do Evento</label>
                    <input
                      type="time"
                      value={formData.horaChegada}
                      onChange={(e) => setFormData({ ...formData, horaChegada: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">3. Hora Solicitação de Parada</label>
                    <input
                      type="time"
                      value={formData.horaSolicitacao}
                      onChange={(e) => setFormData({ ...formData, horaSolicitacao: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">4. Hora Resposta</label>
                    <input
                      type="time"
                      value={formData.horaRespostaGR}
                      onChange={(e) => setFormData({ ...formData, horaRespostaGR: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">5. Hora Parada Motorista</label>
                    <input
                      type="time"
                      value={formData.horaParadaMotorista}
                      onChange={(e) => setFormData({ ...formData, horaParadaMotorista: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">6. Hora Realização Intervenção</label>
                    <input
                      type="time"
                      value={formData.horaRealizacao}
                      onChange={(e) => setFormData({ ...formData, horaRealizacao: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Auto Calculated Intervals Preview */}
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Evento → Chegada</span>
                    <span className="font-mono font-bold text-slate-800">{liveIntervals.eventoChegada}</span>
                    <span className={`block text-[9px] font-bold ${parseMinutes(liveIntervals.eventoChegada) <= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {parseMinutes(liveIntervals.eventoChegada) <= 10 ? 'SLA OK (≤10m)' : 'SLA Excedido'}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Sol. → Resposta GR</span>
                    <span className="font-mono font-bold text-slate-800">{liveIntervals.solicitacaoResposta}</span>
                    <span className={`block text-[9px] font-bold ${parseMinutes(liveIntervals.solicitacaoResposta) <= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {parseMinutes(liveIntervals.solicitacaoResposta) <= 10 ? 'SLA OK (5-10m)' : 'SLA Excedido'}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Sol. → Intervenção</span>
                    <span className="font-mono font-bold text-slate-800">{liveIntervals.solicitacaoIntervencao}</span>
                  </div>

                  <div className="p-2 bg-teal-50/80 rounded-lg border border-[#205857]/30">
                    <span className="text-[#205857] font-bold block">TOTAL GERAL</span>
                    <span className="font-mono font-black text-xs text-[#205857]">
                      {liveIntervals.eventoIntervencao}
                    </span>
                    <span className={`block text-[9px] font-bold mt-0.5 ${parseMinutes(liveIntervals.eventoIntervencao) <= 120 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {parseMinutes(liveIntervals.eventoIntervencao) <= 90 ? 'Excelente (≤1h30)' : parseMinutes(liveIntervals.eventoIntervencao) <= 120 ? 'Dentro da Meta (≤2h)' : 'SLA Excedido (>2h)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Status and Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Motivo para Não Realização</label>
                  <select
                    value={formData.motivoNaoRealizacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        motivoNaoRealizacao: e.target.value,
                        statusRegistro: e.target.value ? 'ENCERRADA' : formData.statusRegistro
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
                  >
                    <option value="">Nenhum (Intervenção realizada normalmente)</option>
                    <option value="Sem retorno do motorista">Sem retorno do motorista</option>
                    <option value="Sem retorno da torre de fadiga">Sem retorno da torre de fadiga</option>
                    <option value="Sem retorno da empresa">Sem retorno da empresa</option>
                    <option value="Motorista finalizou a jornada">Motorista finalizou a jornada</option>
                    <option value="Motorista em area de sem sinal">Motorista em area de sem sinal</option>
                    <option value="Sem o devido acompanhamento">Sem o devido acompanhamento</option>
                    <option value="Outro motivo operacional">Outro motivo operacional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status da Intervenção *</label>
                  <select
                    value={formData.statusRegistro}
                    onChange={(e) => setFormData({ ...formData, statusRegistro: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden font-semibold"
                  >
                    <option value="SIM">SIM — Intervenção Concluída com Parada</option>
                    <option value="NÃO">NÃO — Intervenção Não Realizada</option>
                    <option value="ENCERRADA">ENCERRADA — Finalizada sem Intervenção</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Observações */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações Operacionais da Intervenção</label>
                <textarea
                  rows={2}
                  placeholder="Relato do contato com motorista, orientações passadas e ações preventivas tomadas..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                />
              </div>

              {/* Row 6: PDF Attachment */}
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <label className="block font-semibold text-slate-700 mb-1">
                  Anexo de Documento / Laudo / Comprovante (PDF)
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#205857] file:text-white hover:file:bg-[#184443] cursor-pointer"
                  />
                  {formData.pdfAttachment && (
                    <span className="text-[11px] text-teal-700 font-semibold truncate max-w-[200px]">
                      {formData.pdfAttachment.name} ({formData.pdfAttachment.size})
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#205857] hover:bg-[#184443] text-white rounded-lg font-bold"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF ATTACHMENT PREVIEW MODAL */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-[#205857] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-[#00B7B5]" />
                <h3 className="font-bold text-sm">Visualização de Documento Anexo</h3>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm">
                  PDF
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{previewAttachment.name}</h4>
                  <span className="text-[11px] text-slate-500 block">
                    Tamanho: {previewAttachment.size || 'N/A'} · Carregado em:{' '}
                    {new Date(previewAttachment.uploadedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-slate-50/50 text-slate-600 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-medium text-slate-700">
                  Documento validado e vinculado ao evento operacional de fadiga Transparaná.
                </p>
                <p className="text-[11px] text-slate-400">
                  O arquivo está armazenado de forma segura no registro eletrônico do SELENE.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="px-4 py-2 bg-[#205857] text-white rounded-lg font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
