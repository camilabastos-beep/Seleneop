import React, { useState } from 'react';
import { Driver, User } from '../types';
import {
  getDrivers,
  saveDriver,
  deleteDriver,
  getBiopsychosocialEvaluations,
  getCronotipoEvaluations,
  getFatigueInterventions,
  exportDriversToCSV,
  importDriversFromCSV,
  downloadCSV
} from '../utils/storage';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Clock,
  Phone,
  MapPin,
  Truck,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

interface DriversListProps {
  currentUser: User;
  onSelectBiopsychosocial: (driver: Driver) => void;
  onSelectCronotipo: (driver: Driver) => void;
}

export const DriversList: React.FC<DriversListProps> = ({
  currentUser,
  onSelectBiopsychosocial,
  onSelectCronotipo
}) => {
  const [drivers, setDrivers] = useState<Driver[]>(getDrivers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilial, setSelectedFilial] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverDetail, setDriverDetail] = useState<Driver | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    cpf: '',
    filial: 'Matriz',
    status: 'ATIVO',
    phone: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    preferredShift: 'DIURNO',
    riskLevel: 'BAIXO',
    notes: ''
  });

  const reloadData = () => {
    setDrivers(getDrivers());
  };

  const handleOpenCreate = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      cpf: '',
      filial: 'Matriz',
      status: 'ATIVO',
      phone: '',
      admissionDate: new Date().toISOString().slice(0, 10),
      preferredShift: 'DIURNO',
      riskLevel: 'BAIXO',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setFormData({
      id: d.id,
      name: d.name,
      cpf: d.cpf,
      filial: d.filial,
      status: d.status,
      phone: d.phone,
      admissionDate: d.admissionDate,
      preferredShift: d.preferredShift,
      riskLevel: d.riskLevel,
      notes: d.notes
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.cpf?.trim()) {
      alert('Preencha os campos obrigatórios: Nome e CPF.');
      return;
    }

    const driverToSave: Driver = {
      id: editingDriver ? editingDriver.id : `drv-${Date.now()}`,
      name: formData.name.trim().toUpperCase(),
      cpf: formData.cpf.trim(),
      filial: formData.filial || 'Matriz',
      status: (formData.status as any) || 'ATIVO',
      phone: formData.phone || '',
      admissionDate: formData.admissionDate || new Date().toISOString().slice(0, 10),
      preferredShift: (formData.preferredShift as any) || 'DIURNO',
      riskLevel: (formData.riskLevel as any) || 'BAIXO',
      notes: formData.notes || '',
      createdAt: editingDriver ? editingDriver.createdAt : new Date().toISOString()
    };

    saveDriver(driverToSave);
    setShowModal(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir o cadastro deste motorista?')) {
      deleteDriver(id);
      reloadData();
    }
  };

  const officialFiliais = ['Matriz', 'Pernambuco', 'Maranhão', 'Mossoró'];

  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cpf.includes(searchTerm);

    const matchFilial = selectedFilial === 'ALL' || d.filial === selectedFilial;
    const matchRisk = selectedRisk === 'ALL' || d.riskLevel === selectedRisk;

    return matchSearch && matchFilial && matchRisk;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'ALTO':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MODERADO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  // Driver details data
  const allBio = getBiopsychosocialEvaluations();
  const allCrono = getCronotipoEvaluations();
  const allInterventions = getFatigueInterventions();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Cadastro e Prontuários dos Motoristas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão do efetivo de motoristas carreteiros da Transparaná, histórico de avaliações, riscos e prontuários.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              const csv = exportDriversToCSV(drivers);
              downloadCSV(`SELENE_Relacao_Motoristas_${new Date().toISOString().slice(0, 10)}.csv`, csv);
            }}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Exportar relação completa de motoristas em CSV / Excel"
          >
            <Download className="w-4 h-4 text-[#00B7B5]" />
            Exportar Relação (CSV)
          </button>

          <button
            onClick={() => {
              setImportResult(null);
              setImportCsvText('');
              setShowImportModal(true);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Importar lista de motoristas em lote"
          >
            <Upload className="w-4 h-4 text-[#00B7B5]" />
            Importar em Lote
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#00B7B5]" />
            Novo Motorista
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, CPF ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedFilial}
            onChange={(e) => setSelectedFilial(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
          >
            <option value="ALL">Todas as Filiais</option>
            {officialFiliais.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-hidden"
          >
            <option value="ALL">Todos os Níveis de Risco</option>
            <option value="BAIXO">Baixo Risco</option>
            <option value="MODERADO">Risco Moderado</option>
            <option value="ALTO">Alto Risco</option>
          </select>
        </div>
      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const driverBioCount = allBio.filter((b) => b.driverId === driver.id || b.driverCpf === driver.cpf).length;
          const driverCronoCount = allCrono.filter((c) => c.driverId === driver.id || c.driverCpf === driver.cpf).length;
          const driverFatigueCount = allInterventions.filter((i) => i.motorista.toLowerCase().includes(driver.name.toLowerCase()) || i.placa === driver.plate).length;

          return (
            <div
              key={driver.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 hover:border-[#00B7B5]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{driver.name}</h3>
                    <span className="text-[11px] font-mono text-slate-500">CPF: {driver.cpf}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(driver.riskLevel)}`}>
                    {driver.riskLevel} RISCO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Placa</span>
                    <strong className="text-slate-800 font-mono">{driver.plate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Filial</span>
                    <strong className="text-slate-800">{driver.filial}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Turno Pref.</span>
                    <strong className="text-slate-800">{driver.preferredShift}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <strong className="text-emerald-700">{driver.status}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span title="Avaliações Biopsicossociais">{driverBioCount} Biopsicossociais</span>
                  <span>•</span>
                  <span title="Testes de Cronotipo">{driverCronoCount} Cronotipos</span>
                  <span>•</span>
                  <span title="Eventos de Fadiga">{driverFatigueCount} Fadiga</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => onSelectBiopsychosocial(driver)}
                    className="px-2.5 py-1.5 bg-[#205857]/10 hover:bg-[#205857]/20 text-[#205857] text-[11px] font-bold rounded-md transition-colors"
                    title="Avaliação Biopsicossocial"
                  >
                    + Bio
                  </button>
                  <button
                    onClick={() => onSelectCronotipo(driver)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-md transition-colors"
                    title="Teste de Cronotipo"
                  >
                    + Crono
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setDriverDetail(driver)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Ver Histórico Completo"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(driver)}
                    className="p-1.5 text-slate-500 hover:text-[#205857] hover:bg-slate-100 rounded-md transition-colors"
                    title="Editar Motorista"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT DRIVER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00B7B5]" />
                <h3 className="font-bold text-sm">
                  {editingDriver ? 'Editar Dados do Motorista' : 'Cadastrar Novo Motorista Carreteiro'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do motorista..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Filial Transparaná *</label>
                  <select
                    value={formData.filial}
                    onChange={(e) => setFormData({ ...formData, filial: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 outline-hidden font-medium"
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Pernambuco">Pernambuco</option>
                    <option value="Maranhão">Maranhão</option>
                    <option value="Mossoró">Mossoró</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / Contato</label>
                  <input
                    type="text"
                    placeholder="(41) 99999-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placa Referência (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Informada nas intervenções"
                    value={formData.plate || ''}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turno Habitual</label>
                  <select
                    value={formData.preferredShift}
                    onChange={(e) => setFormData({ ...formData, preferredShift: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 outline-hidden"
                  >
                    <option value="DIURNO">DIURNO</option>
                    <option value="NOTURNO">NOTURNO</option>
                    <option value="MISTO">MISTO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 outline-hidden"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="AFASTADO">AFASTADO</option>
                    <option value="FERIAS">FÉRIAS</option>
                    <option value="DESLIGADO">DESLIGADO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classificação Risco</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 outline-hidden"
                  >
                    <option value="BAIXO">BAIXO</option>
                    <option value="MODERADO">MODERADO</option>
                    <option value="ALTO">ALTO</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#205857] hover:bg-[#184443] rounded-lg transition-colors shadow-xs"
                >
                  Salvar Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER DETAIL MODAL */}
      {driverDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-[#205857] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{driverDetail.name}</h3>
                <p className="text-xs text-teal-200 font-mono">CPF: {driverDetail.cpf} · Placa: {driverDetail.plate} · Filial: {driverDetail.filial}</p>
              </div>
              <button onClick={() => setDriverDetail(null)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div>
                <h4 className="font-bold text-[#205857] text-xs uppercase tracking-wider mb-2">
                  Histórico de Avaliações Biopsicossociais
                </h4>
                {allBio.filter((b) => b.driverId === driverDetail.id || b.driverCpf === driverDetail.cpf).length === 0 ? (
                  <p className="text-slate-400 italic">Nenhuma avaliação biopsicossocial registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {allBio
                      .filter((b) => b.driverId === driverDetail.id || b.driverCpf === driverDetail.cpf)
                      .map((b) => (
                        <div key={b.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{new Date(b.dataAtendimento).toLocaleDateString('pt-BR')}</span>
                            <span className="text-slate-500 ml-2">Avaliador: {b.avaliador}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#205857]/10 text-[#205857]">
                            Score: {b.scoreTotal}/79 ({b.classificacao})
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#205857] text-xs uppercase tracking-wider mb-2">
                  Histórico de Avaliações de Cronotipo
                </h4>
                {allCrono.filter((c) => c.driverId === driverDetail.id || c.driverCpf === driverDetail.cpf).length === 0 ? (
                  <p className="text-slate-400 italic">Nenhum teste de cronotipo registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {allCrono
                      .filter((c) => c.driverId === driverDetail.id || c.driverCpf === driverDetail.cpf)
                      .map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{new Date(c.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
                            <span className="text-slate-500 ml-2">Avaliador: {c.avaliador}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {c.classificacao} ({c.totalScore} pts)
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#205857] text-xs uppercase tracking-wider mb-2">
                  Intervenções em Eventos de Fadiga Registradas
                </h4>
                {allInterventions.filter((i) => i.motorista.toLowerCase().includes(driverDetail.name.toLowerCase()) || i.placa === driverDetail.plate).length === 0 ? (
                  <p className="text-slate-400 italic">Nenhum evento de fadiga registrado para este motorista.</p>
                ) : (
                  <div className="space-y-2">
                    {allInterventions
                      .filter((i) => i.motorista.toLowerCase().includes(driverDetail.name.toLowerCase()) || i.placa === driverDetail.plate)
                      .map((i) => (
                        <div key={i.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{i.data} (ID: {i.eventoId})</span>
                            <span className="text-slate-500 ml-2">Tempo total: {i.diffEventoIntervencao}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            Status: {i.statusRegistro}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDriverDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* BULK IMPORT DRIVERS MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#205857] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#00B7B5]" />
                <h3 className="font-bold text-sm">Importação de Relação de Motoristas em Lote</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 leading-relaxed">
                <span className="font-bold block mb-1">Dica de Importação Rápida:</span>
                Você pode colar diretamente as colunas copiadas da sua planilha ou selecionar um arquivo <strong>.CSV</strong>. Se o CPF já existir, o cadastro será atualizado automaticamente com as novas informações.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Carregar Arquivo CSV de Motoristas:
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const text = evt.target?.result as string;
                      if (text) setImportCsvText(text);
                    };
                    reader.readAsText(file);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#205857] file:text-white hover:file:bg-[#184443] cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ou Cole o Texto/Colunas do Excel/Google Sheets:
                </label>
                <textarea
                  rows={7}
                  placeholder={`Nome,CPF,Filial,Placa,Telefone,Status,Turno,Risco\nMARCOS VINICIOS SANTOS,382.910.448-12,Matriz,SEN9B52,(41) 98722-1049,ATIVO,DIURNO,BAIXO\nSILAS FERREIRA DE ARAGAO,491.029.381-55,Pernambuco,RPL7I46,(81) 97611-3920,ATIVO,DIURNO,BAIXO`}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] outline-hidden focus:ring-2 focus:ring-[#00B7B5]"
                />
              </div>

              {importResult && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                  importResult.success > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Importação concluída: <strong>{importResult.success}</strong> motoristas importados/atualizados com sucesso.
                    {importResult.failed > 0 && ` (${importResult.failed} linhas inválidas ignoradas)`}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!importCsvText.trim()) return;
                    const res = importDriversFromCSV(importCsvText);
                    setImportResult(res);
                    if (res.success > 0) {
                      reloadData();
                    }
                  }}
                  className="px-5 py-2 bg-[#205857] hover:bg-[#184443] text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-[#00B7B5]" />
                  Processar Importação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
