import React, { useState, useMemo } from 'react';
import { BiopsychosocialData, BiopsychosocialEvaluation, Driver, User } from '../types';
import { calculateBiopsychosocialScore } from '../utils/scoring';
import { 
  getBiopsychosocialEvaluations, 
  saveBiopsychosocialEvaluation, 
  deleteBiopsychosocialEvaluation, 
  getDrivers 
} from '../utils/storage';
import {
  Activity,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Brain,
  Truck,
  HeartPulse,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Info,
  Calendar,
  Building,
  CreditCard,
  FileCheck2,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  FileText,
  Clock,
  Eye,
  Filter,
  BarChart3,
  ListFilter,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react';

interface BiopsychosocialFormProps {
  currentUser: User;
  onSaved: (evalId: string) => void;
  onOpenReport?: (evalId: string) => void;
  preselectedDriver?: Driver | null;
}

export const BiopsychosocialForm: React.FC<BiopsychosocialFormProps> = ({
  currentUser,
  onSaved,
  onOpenReport,
  preselectedDriver
}) => {
  const drivers = getDrivers();
  const [evaluations, setEvaluations] = useState<BiopsychosocialEvaluation[]>(() =>
    getBiopsychosocialEvaluations()
  );

  // UI state: List view vs Dashboard view vs Questionnaire answering mode
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [isAnswering, setIsAnswering] = useState<boolean>(Boolean(preselectedDriver));
  const [activeStep, setActiveStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilial, setFilterFilial] = useState('TODAS');
  const [filterRisk, setFilterRisk] = useState('ALL');

  // Form State for answering - Blank by default so evaluator fills step-by-step
  const [formData, setFormData] = useState<Partial<BiopsychosocialData>>({
    driverId: preselectedDriver?.id || '',
    driverName: preselectedDriver?.name || '',
    driverCpf: preselectedDriver?.cpf || '',
    driverFilial: preselectedDriver?.filial || '',
    driverPlate: preselectedDriver?.plate || '',
    dataAtendimento: new Date().toISOString().slice(0, 10),
    avaliador: currentUser.name,

    // Step 1: Anamnese Social
    idade: undefined,
    estadoCivil: '',
    filhos: undefined,
    escolaridade: '',
    tempoEmpresaMeses: undefined,
    tempoProfissaoAnos: undefined,
    resideCom: '',
    relatoAbertoSocial: '',

    // Step 2: Condições de Trabalho
    turnoHabitual: '',
    rotinaPausas: '',
    jornadaMediaHoras: undefined,
    tipoVeiculo: '',
    rotasHabituais: '',
    satisfacaoTrabalho: '',
    relacionamentoEquipe: '',
    percepcaoSuporte: '',
    trabalhoNoturnoFrequente: false,
    pressaoTempoPrazos: '',
    relatoAbertoTrabalho: '',

    // Step 3: Sono & Fadiga
    horasSonoPorNoite: undefined,
    qualidadeSono: '',
    dificuldadeAdormecer: '',
    acordaDuranteNoite: '',
    sensacaoSonoNaoReparador: '',
    roncaOuEngasga: '',
    sonolenciaDiurna: '',
    sonolenciaAoVolante: '',
    usoMedicamentosSono: '',
    consumoCfeinaEnergeticos: '',
    relatoAbertoSono: '',

    // Step 4: Saúde Mental
    nivelEstresse: '',
    sintomasAnsiedade: '',
    sintomasDepressivos: '',
    preocupacoesFinanceiras: '',
    conflitosFamiliares: '',
    eventosEstressoresRecentes: '',
    redeApoioSocial: '',
    relatoAbertoSaudeMental: '',

    // Step 5: Estilo de Vida
    praticaAtividadeFisica: '',
    padraoAlimentar: '',
    consumoAguaLitros: undefined,
    tabagismo: '',
    consumoAlcool: '',
    historicoDoencasCronicas: '',
    usoMedicamentosContinuos: '',
    relatoAbertoEstiloVida: '',

    // Observações
    observacoesGerais: '',
    parecerTecnicoResumido: ''
  });

  const reloadData = () => {
    setEvaluations(getBiopsychosocialEvaluations());
  };

  const handleStartNew = (driver?: Driver) => {
    const d = driver || (drivers.length > 0 ? drivers[0] : undefined);
    setFormData({
      driverId: d?.id || '',
      driverName: d?.name || '',
      driverCpf: d?.cpf || '',
      driverFilial: d?.filial || '',
      driverPlate: d?.plate || '',
      dataAtendimento: new Date().toISOString().slice(0, 10),
      avaliador: currentUser.name,
      idade: undefined,
      estadoCivil: '',
      filhos: undefined,
      escolaridade: '',
      tempoEmpresaMeses: undefined,
      tempoProfissaoAnos: undefined,
      resideCom: '',
      relatoAbertoSocial: '',
      turnoHabitual: '',
      rotinaPausas: '',
      jornadaMediaHoras: undefined,
      tipoVeiculo: '',
      rotasHabituais: '',
      satisfacaoTrabalho: '',
      relacionamentoEquipe: '',
      percepcaoSuporte: '',
      trabalhoNoturnoFrequente: false,
      pressaoTempoPrazos: '',
      relatoAbertoTrabalho: '',
      horasSonoPorNoite: undefined,
      qualidadeSono: '',
      dificuldadeAdormecer: '',
      acordaDuranteNoite: '',
      sensacaoSonoNaoReparador: '',
      roncaOuEngasga: '',
      sonolenciaDiurna: '',
      sonolenciaAoVolante: '',
      usoMedicamentosSono: '',
      consumoCfeinaEnergeticos: '',
      relatoAbertoSono: '',
      nivelEstresse: '',
      sintomasAnsiedade: '',
      sintomasDepressivos: '',
      preocupacoesFinanceiras: '',
      conflitosFamiliares: '',
      eventosEstressoresRecentes: '',
      redeApoioSocial: '',
      relatoAbertoSaudeMental: '',
      praticaAtividadeFisica: '',
      padraoAlimentar: '',
      consumoAguaLitros: undefined,
      tabagismo: '',
      consumoAlcool: '',
      historicoDoencasCronicas: '',
      usoMedicamentosContinuos: '',
      relatoAbertoEstiloVida: '',
      observacoesGerais: '',
      parecerTecnicoResumido: ''
    });
    setActiveStep(1);
    setIsAnswering(true);
  };

  const handleDriverChange = (driverId: string) => {
    const selected = drivers.find((d) => d.id === driverId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        driverId: selected.id,
        driverName: selected.name,
        driverCpf: selected.cpf,
        driverFilial: selected.filial,
        driverPlate: selected.plate,
        turnoHabitual: selected.preferredShift === 'NOTURNO' ? 'Noturno' : selected.preferredShift === 'MISTO' ? 'Misto' : 'Diurno'
      }));
    }
  };

  // Real-time score calculation
  const scoreResult = useMemo(() => {
    return calculateBiopsychosocialScore(formData);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.driverId || !formData.driverName) {
      alert('Selecione ou identifique o motorista avaliado.');
      return;
    }

    const evaluation: BiopsychosocialEvaluation = {
      ...(formData as BiopsychosocialData),
      ...scoreResult,
      id: `bio-eval-${Date.now()}`,
      objetivo:
        'A presente avaliação tem como objetivo mapear e analisar os fatores biopsicossociais, condições de trabalho e hábitos de vida do condutor, visando à identificação precoce de indicadores de desgaste ocupacional, sonolência excessiva e fadiga operacional, garantindo a segurança nas operações e o bem-estar do colaborador.',
      procedimento:
        'A avaliação foi conduzida por meio de entrevista técnica semiestruturada combinada à aplicação do protocolo de rastreio biopsicossocial do SELENE — Transparaná. Foram investigados aspectos pertinentes à rotina de trabalho, qualidade e arquitetura do sono, saúde mental, estilo de vida e percepção de suporte institucional.',
      analiseTecnica:
        scoreResult.classificacao === 'Risco alto'
          ? 'A análise dos indicadores obtidos aponta marcadores significativos de sobrecarga e risco elevado de fadiga. Observou-se acúmulo de queixas no domínio do sono e saúde mental que demandam intervenção preventiva e acompanhamento conjunto.'
          : scoreResult.classificacao === 'Risco moderado'
          ? 'A análise aponta indicadores pontuais de desgaste ou hábitos que demandam atenção na rotina de sono e estresse. Recomendam-se orientações de higiene do sono e pausas programadas.'
          : 'A análise dos indicadores obtidos durante a avaliação encontra-se consoante com os parâmetros estabelecidos para o acompanhamento preventivo da saúde ocupacional do colaborador. Não foram identificados marcadores de risco imediato que comprometam a prontidão operacional.',
      recomendacoes:
        scoreResult.classificacao === 'Risco alto'
          ? 'Encaminhamento para suporte especializado contínuo, avaliação médica especializada para distúrbios respiratórios/sono e revisão de escala de viagem.'
          : scoreResult.classificacao === 'Risco moderado'
          ? 'Reforço nas medidas de higiene do sono, manutenção de pausas ativas a cada duas horas e acompanhamento semestral.'
          : 'Com base nos dados coletados na avaliação biopsicossocial, não há necessidade de acompanhamento especializado no momento. Recomenda-se a manutenção dos hábitos saudáveis observados e a continuidade das ações preventivas de rotina da empresa.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveBiopsychosocialEvaluation(evaluation);
    reloadData();
    setIsAnswering(false);
    onSaved(evaluation.id);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente remover a avaliação biopsicossocial de ${name}?`)) {
      deleteBiopsychosocialEvaluation(id);
      reloadData();
    }
  };

  // Quick Preset Fills
  const handleApplyPreset = (type: 'BAIXO' | 'MODERADO' | 'ALTO') => {
    if (type === 'BAIXO') {
      setFormData((prev) => ({
        ...prev,
        rotinaPausas: 'Sim, a cada 2 a 3 horas',
        jornadaMediaHoras: 8,
        satisfacaoTrabalho: 'Muito satisfeito',
        relacionamentoEquipe: 'Excelente',
        percepcaoSuporte: 'Excelente',
        trabalhoNoturnoFrequente: false,
        pressaoTempoPrazos: 'Baixa',
        horasSonoPorNoite: 8,
        qualidadeSono: 'Muito boa',
        dificuldadeAdormecer: 'Nunca',
        acordaDuranteNoite: 'Nunca',
        sensacaoSonoNaoReparador: 'Nunca',
        roncaOuEngasga: 'Não',
        sonolenciaDiurna: 'Nunca',
        sonolenciaAoVolante: 'Nunca',
        usoMedicamentosSono: 'Não',
        consumoCfeinaEnergeticos: 'Baixo (1 café/dia)',
        nivelEstresse: 'Muito baixo',
        sintomasAnsiedade: 'Nunca',
        sintomasDepressivos: 'Nunca',
        preocupacoesFinanceiras: 'Não',
        conflitosFamiliares: 'Não',
        eventosEstressoresRecentes: 'Não',
        redeApoioSocial: 'Forte (Família e amigos presentes)',
        praticaAtividadeFisica: 'Regularmente (3x+ semana)',
        padraoAlimentar: 'Equilibrado / Saudável',
        consumoAguaLitros: 2.5,
        tabagismo: 'Não fumante',
        consumoAlcool: 'Não consome'
      }));
    } else if (type === 'MODERADO') {
      setFormData((prev) => ({
        ...prev,
        rotinaPausas: 'Às vezes, quando a rota permite',
        jornadaMediaHoras: 10,
        satisfacaoTrabalho: 'Regular / Neutro',
        relacionamentoEquipe: 'Regular',
        percepcaoSuporte: 'Regular',
        trabalhoNoturnoFrequente: true,
        pressaoTempoPrazos: 'Moderada',
        horasSonoPorNoite: 6,
        qualidadeSono: 'Regular',
        dificuldadeAdormecer: 'Às vezes',
        acordaDuranteNoite: 'Às vezes',
        sensacaoSonoNaoReparador: 'Às vezes',
        roncaOuEngasga: 'Às vezes',
        sonolenciaDiurna: 'Às vezes',
        sonolenciaAoVolante: 'Raramente',
        usoMedicamentosSono: 'Ocasionalmente',
        consumoCfeinaEnergeticos: 'Moderado (1 a 2 cafés/dia)',
        nivelEstresse: 'Moderado',
        sintomasAnsiedade: 'Às vezes',
        sintomasDepressivos: 'Raramente',
        preocupacoesFinanceiras: 'Sim, moderadas',
        conflitosFamiliares: 'Não',
        eventosEstressoresRecentes: 'Não',
        redeApoioSocial: 'Moderada',
        praticaAtividadeFisica: 'Ocasionalmente (1-2x semana)',
        padraoAlimentar: 'Regular',
        consumoAguaLitros: 1.5,
        tabagismo: 'Ex-fumante',
        consumoAlcool: 'Raramente / Socialmente'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        rotinaPausas: 'Raramente ou apenas quando solicitado',
        jornadaMediaHoras: 12,
        satisfacaoTrabalho: 'Insatisfeito',
        relacionamentoEquipe: 'Ruim',
        percepcaoSuporte: 'Fraco',
        trabalhoNoturnoFrequente: true,
        pressaoTempoPrazos: 'Alta / Muito alta',
        horasSonoPorNoite: 4.5,
        qualidadeSono: 'Muito ruim',
        dificuldadeAdormecer: 'Frequentemente / Sempre',
        acordaDuranteNoite: 'Frequentemente / Sempre',
        sensacaoSonoNaoReparador: 'Frequentemente / Sempre',
        roncaOuEngasga: 'Frequentemente / Ronco alto com pausas respiratórias',
        sonolenciaDiurna: 'Frequentemente / Sempre',
        sonolenciaAoVolante: 'Frequentemente (risco iminente)',
        usoMedicamentosSono: 'Sim, uso contínuo',
        consumoCfeinaEnergeticos: 'Excessivo (4+ doses/energéticos constantes)',
        nivelEstresse: 'Muito alto / Esgotamento',
        sintomasAnsiedade: 'Frequentemente / Constante',
        sintomasDepressivos: 'Frequentemente',
        preocupacoesFinanceiras: 'Sim, graves',
        conflitosFamiliares: 'Sim, frequentes',
        eventosEstressoresRecentes: 'Sim, luto ou doença familiar recente',
        redeApoioSocial: 'Fraca / Isolado',
        praticaAtividadeFisica: 'Sedentário',
        padraoAlimentar: 'Inadequado (Ultraprocessados e fast food na estrada)',
        consumoAguaLitros: 0.8,
        tabagismo: 'Fumante diário',
        consumoAlcool: 'Frequentemente'
      }));
    }
  };

  // Metrics for list header
  const totalCount = evaluations.length;
  const highRiskCount = evaluations.filter((e) => e.classificacao === 'Risco alto').length;
  const moderateRiskCount = evaluations.filter((e) => e.classificacao === 'Risco moderado').length;
  const lowRiskCount = evaluations.filter((e) => e.classificacao === 'Baixo risco').length;

  // Analytics for Biopsychosocial Dashboard
  const bioAnalytics = useMemo(() => {
    const total = evaluations.length;
    let sumScore = 0;
    let sumTrab = 0;
    let sumSono = 0;
    let sumMental = 0;
    let sumEstilo = 0;

    let sonolenciaCount = 0;
    let roncoCount = 0;
    let privacaoSonoCount = 0;
    let estresseAltoCount = 0;
    let sedentarioCount = 0;

    const filialMap: Record<string, { total: number; highRisk: number; sumScore: number }> = {
      Matriz: { total: 0, highRisk: 0, sumScore: 0 },
      Pernambuco: { total: 0, highRisk: 0, sumScore: 0 },
      Maranhão: { total: 0, highRisk: 0, sumScore: 0 },
      Mossoró: { total: 0, highRisk: 0, sumScore: 0 }
    };

    evaluations.forEach((item) => {
      sumScore += item.scoreTotal || 0;
      sumTrab += item.condicoesTrabalhoScore || 0;
      sumSono += item.sonoScore || 0;
      sumMental += item.saudeMentalScore || 0;
      sumEstilo += item.estiloVidaScore || 0;

      if (item.sonolenciaDiurna?.includes('Frequentemente') || item.sonolenciaAoVolante?.includes('Frequentemente')) {
        sonolenciaCount++;
      }
      if (item.roncaOuEngasga?.includes('Frequentemente') || item.roncaOuEngasga?.includes('Apneia')) {
        roncoCount++;
      }
      if ((item.horasSonoPorNoite || 7) < 6) {
        privacaoSonoCount++;
      }
      if (item.nivelEstresse?.includes('Alto') || item.nivelEstresse?.includes('Esgotamento')) {
        estresseAltoCount++;
      }
      if (item.praticaAtividadeFisica?.includes('Sedentário')) {
        sedentarioCount++;
      }

      const fil = item.driverFilial || 'Matriz';
      if (!filialMap[fil]) filialMap[fil] = { total: 0, highRisk: 0, sumScore: 0 };
      filialMap[fil].total++;
      filialMap[fil].sumScore += item.scoreTotal || 0;
      if (item.classificacao === 'Risco alto') filialMap[fil].highRisk++;
    });

    const avgScore = total > 0 ? (sumScore / total).toFixed(1) : '0';
    const avgTrab = total > 0 ? (sumTrab / total).toFixed(1) : '0';
    const avgSono = total > 0 ? (sumSono / total).toFixed(1) : '0';
    const avgMental = total > 0 ? (sumMental / total).toFixed(1) : '0';
    const avgEstilo = total > 0 ? (sumEstilo / total).toFixed(1) : '0';

    const highRiskDrivers = evaluations.filter((e) => e.classificacao === 'Risco alto');

    return {
      total,
      avgScore,
      avgTrab,
      avgSono,
      avgMental,
      avgEstilo,
      sonolenciaCount,
      roncoCount,
      privacaoSonoCount,
      estresseAltoCount,
      sedentarioCount,
      filialMap,
      highRiskDrivers
    };
  }, [evaluations]);

  // Filtered List
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      if (filterFilial !== 'TODAS' && item.driverFilial !== filterFilial) return false;
      if (filterRisk !== 'ALL' && item.classificacao !== filterRisk) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = item.driverName.toLowerCase().includes(q);
        const matchCpf = item.driverCpf.toLowerCase().includes(q);
        const matchEval = item.avaliador.toLowerCase().includes(q);
        if (!matchName && !matchCpf && !matchEval) return false;
      }
      return true;
    });
  }, [evaluations, filterFilial, filterRisk, searchTerm]);

  const stepsConfig = [
    { id: 1, title: 'Identificação', short: 'Perfil', icon: UserCheck },
    { id: 2, title: 'Condições de Trabalho', short: 'Trabalho', icon: Truck, max: 14, current: scoreResult.condicoesTrabalhoScore },
    { id: 3, title: 'Avaliação do Sono', short: 'Sono & Fadiga', icon: Moon, max: 29, current: scoreResult.sonoScore },
    { id: 4, title: 'Saúde Mental', short: 'Mental', icon: Brain, max: 20, current: scoreResult.saudeMentalScore },
    { id: 5, title: 'Estilo de Vida', short: 'Hábitos', icon: HeartPulse, max: 16, current: scoreResult.estiloVidaScore }
  ];

  // ==========================================
  // VIEW: ANSWERING QUESTIONNAIRE FORM
  // ==========================================
  if (isAnswering) {
    return (
      <div className="space-y-6">
        {/* Header Banner & Quick Action Suite */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnswering(false)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Voltar para a lista de avaliações"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#205857]">
                  <Activity className="w-4 h-4 text-[#00B7B5]" />
                </div>
                <h2 className="text-xl font-black text-[#205857] tracking-tight">
                  Responder Avaliação Biopsicossocial
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha os dados do questionário para classificar o risco de fadiga e gerar o parecer técnico.
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Exemplos rápidos:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('BAIXO')}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Baixo Risco
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('MODERADO')}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Risco Moderado
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('ALTO')}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              Risco Alto
            </button>
          </div>
        </div>

        {/* Interactive Stepper Wizard Navigation */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stepsConfig.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#205857] text-white border-[#205857] shadow-sm ring-2 ring-[#00B7B5]/30'
                      : isCompleted
                      ? 'bg-teal-50/60 text-slate-800 border-teal-200 hover:bg-teal-50'
                      : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isCompleted
                          ? 'bg-[#00B7B5] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    {step.max !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-white/20 text-teal-100' : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        {step.current}/{step.max}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={`text-[10px] font-medium block uppercase tracking-wider ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                      Etapa {step.id}
                    </span>
                    <span className="text-xs font-bold block truncate">{step.short}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Two-Column Layout: Form Questionnaire vs. Live Score Radar Sidebar */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Multi-Step Question Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: IDENTIFICAÇÃO DO MOTORISTA */}
            {activeStep === 1 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#205857] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#00B7B5]" />
                    1. Identificação do Motorista e Anamnese Geral
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dados cadastrais, tempo de profissão, histórico familiar e dados do atendimento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Selecionar Motorista Cadastrado *
                    </label>
                    <select
                      value={formData.driverId || ''}
                      onChange={(e) => handleDriverChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] outline-hidden cursor-pointer"
                    >
                      <option value="">Selecione um motorista da frota...</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — CPF: {d.cpf} | Placa: {d.plate} ({d.filial})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data do Atendimento *</label>
                    <input
                      type="date"
                      value={formData.dataAtendimento || ''}
                      onChange={(e) => setFormData({ ...formData, dataAtendimento: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Profissional Avaliador</label>
                    <input
                      type="text"
                      value={formData.avaliador || ''}
                      onChange={(e) => setFormData({ ...formData, avaliador: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Idade (Anos)</label>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      placeholder="Ex: 38"
                      value={formData.idade ?? ''}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado Civil</label>
                    <select
                      value={formData.estadoCivil || ''}
                      onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="União Estável">União Estável</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Número de Filhos/Dependentes</label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      placeholder="Ex: 2"
                      value={formData.filhos ?? ''}
                      onChange={(e) => setFormData({ ...formData, filhos: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Escolaridade</label>
                    <select
                      value={formData.escolaridade || ''}
                      onChange={(e) => setFormData({ ...formData, escolaridade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                      <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                      <option value="Ensino Médio Incompleto">Ensino Médio Incompleto</option>
                      <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                      <option value="Ensino Superior">Ensino Superior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempo de Empresa (Meses)</label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      placeholder="Ex: 24"
                      value={formData.tempoEmpresaMeses ?? ''}
                      onChange={(e) => setFormData({ ...formData, tempoEmpresaMeses: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempo de Profissão como Motorista (Anos)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      placeholder="Ex: 10"
                      value={formData.tempoProfissaoAnos ?? ''}
                      onChange={(e) => setFormData({ ...formData, tempoProfissaoAnos: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Reside com quem?</label>
                    <input
                      type="text"
                      value={formData.resideCom || ''}
                      onChange={(e) => setFormData({ ...formData, resideCom: e.target.value })}
                      placeholder="Ex: Cônjuge e dois filhos; Pais; Sozinho..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  {/* Open Response for Step 1 */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#205857] mb-1">
                      Anotações e Relato Livre: Contexto Familiar, Social e Moradia
                    </label>
                    <textarea
                      rows={2}
                      value={formData.relatoAbertoSocial || ''}
                      onChange={(e) => setFormData({ ...formData, relatoAbertoSocial: e.target.value })}
                      placeholder="Campo aberto para anotações do avaliador sobre o contexto social, arranjo familiar ou particularidades..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONDIÇÕES DE TRABALHO */}
            {activeStep === 2 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#205857] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#00B7B5]" />
                    2. Condições de Trabalho, Jornada e Rotina Operacional
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avaliação da sobrecarga laboral, escalas, ergonomia e satisfação no trabalho.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Turno Habitual de Condução</label>
                    <select
                      value={formData.turnoHabitual || ''}
                      onChange={(e) => setFormData({ ...formData, turnoHabitual: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Diurno">Diurno (06:00 às 18:00)</option>
                      <option value="Noturno">Noturno (18:00 às 06:00)</option>
                      <option value="Misto">Misto / Revezamento de horários</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jornada Média Diária (Horas)</label>
                    <input
                      type="number"
                      min={4}
                      max={16}
                      placeholder="Ex: 8"
                      value={formData.jornadaMediaHoras ?? ''}
                      onChange={(e) => setFormData({ ...formData, jornadaMediaHoras: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rotina de Pausas para Descanso</label>
                    <select
                      value={formData.rotinaPausas || ''}
                      onChange={(e) => setFormData({ ...formData, rotinaPausas: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim, a cada 2 a 3 horas">Sim, regulares a cada 2 a 3 horas (+0 pt)</option>
                      <option value="Às vezes, quando a rota permite">Às vezes, quando a rota permite (+1 pt)</option>
                      <option value="Raramente ou apenas quando solicitado">Raramente ou apenas quando solicitado (+2 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pressão por Prazos e Metas</label>
                    <select
                      value={formData.pressaoTempoPrazos || ''}
                      onChange={(e) => setFormData({ ...formData, pressaoTempoPrazos: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Baixa">Baixa / Tranquila (+0 pt)</option>
                      <option value="Moderada">Moderada (+1 pt)</option>
                      <option value="Alta / Muito alta">Alta / Muito alta (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Satisfação com o Trabalho</label>
                    <select
                      value={formData.satisfacaoTrabalho || ''}
                      onChange={(e) => setFormData({ ...formData, satisfacaoTrabalho: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Muito satisfeito">Muito satisfeito (+0 pt)</option>
                      <option value="Satisfeito">Satisfeito (+0 pt)</option>
                      <option value="Regular / Neutro">Regular / Neutro (+1 pt)</option>
                      <option value="Insatisfeito">Insatisfeito (+2 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Relacionamento com Equipe / Gestão</label>
                    <select
                      value={formData.relacionamentoEquipe || ''}
                      onChange={(e) => setFormData({ ...formData, relacionamentoEquipe: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Excelente">Excelente (+0 pt)</option>
                      <option value="Bom">Bom (+0 pt)</option>
                      <option value="Regular">Regular (+1 pt)</option>
                      <option value="Ruim">Ruim (+2 pts)</option>
                    </select>
                  </div>

                  {/* Open Response for Step 2 */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#205857] mb-1">
                      Anotações e Relato Livre: Rotina Operacional, Viagens e Condições de Trabalho
                    </label>
                    <textarea
                      rows={2}
                      value={formData.relatoAbertoTrabalho || ''}
                      onChange={(e) => setFormData({ ...formData, relatoAbertoTrabalho: e.target.value })}
                      placeholder="Espaço aberto para observações sobre rotas, tipo de carga, pernoite na cabine ou condições da frota..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AVALIAÇÃO DO SONO & FADIGA */}
            {activeStep === 3 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#205857] flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[#00B7B5]" />
                    3. Arquitetura do Sono, Sonolência e Indicadores de Fadiga
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mapeamento de apneia, ronco, sonolência diurna ao volante e qualidade subjetiva do sono.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Horas Médias de Sono / Noite</label>
                    <input
                      type="number"
                      step={0.5}
                      min={3}
                      max={12}
                      placeholder="Ex: 7.5"
                      value={formData.horasSonoPorNoite ?? ''}
                      onChange={(e) => setFormData({ ...formData, horasSonoPorNoite: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Qualidade Subjetiva do Sono</label>
                    <select
                      value={formData.qualidadeSono || ''}
                      onChange={(e) => setFormData({ ...formData, qualidadeSono: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Muito boa">Muito boa (+0 pt)</option>
                      <option value="Boa">Boa (+0 pt)</option>
                      <option value="Regular">Regular (+2 pts)</option>
                      <option value="Ruim">Ruim (+4 pts)</option>
                      <option value="Muito ruim">Muito ruim (+5 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sonolência Durante a Condução (Ao Volante)</label>
                    <select
                      value={formData.sonolenciaAoVolante || ''}
                      onChange={(e) => setFormData({ ...formData, sonolenciaAoVolante: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Nunca">Nunca (+0 pt)</option>
                      <option value="Raramente">Raramente (+1 pt)</option>
                      <option value="Às vezes">Às vezes (+3 pts)</option>
                      <option value="Frequentemente (risco iminente)">Frequentemente - Risco Crítico (+5 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sensação de Sono Não Reparador ao Acordar</label>
                    <select
                      value={formData.sensacaoSonoNaoReparador || ''}
                      onChange={(e) => setFormData({ ...formData, sensacaoSonoNaoReparador: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Nunca">Nunca (+0 pt)</option>
                      <option value="Raramente">Raramente (+0 pt)</option>
                      <option value="Às vezes">Às vezes (+2 pts)</option>
                      <option value="Frequentemente / Sempre">Frequentemente / Sempre (+4 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Relato de Ronco Alto ou Engasgos Noturnos</label>
                    <select
                      value={formData.roncaOuEngasga || ''}
                      onChange={(e) => setFormData({ ...formData, roncaOuEngasga: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Não">Não (+0 pt)</option>
                      <option value="Às vezes">Às vezes (+1 pt)</option>
                      <option value="Frequentemente / Ronco alto com pausas respiratórias">
                        Frequentemente / Suspeita de Apneia (+4 pts)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Consumo de Café e Energéticos na Rota</label>
                    <select
                      value={formData.consumoCfeinaEnergeticos || ''}
                      onChange={(e) => setFormData({ ...formData, consumoCfeinaEnergeticos: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Baixo (1 café/dia)">Baixo (1 café/dia) (+0 pt)</option>
                      <option value="Moderado (1 a 2 cafés/dia)">Moderado (1 a 2 cafés/dia) (+0 pt)</option>
                      <option value="Alto (3 a 4 cafés/dia)">Alto (3 a 4 cafés/dia) (+1 pt)</option>
                      <option value="Excessivo (4+ doses/energéticos constantes)">Excessivo / Energéticos constantes (+3 pts)</option>
                    </select>
                  </div>

                  {/* Open Response for Step 3 */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#205857] mb-1">
                      Anotações e Relato Livre: Queixas de Sono, Apneia, Ronco e Fadiga
                    </label>
                    <textarea
                      rows={2}
                      value={formData.relatoAbertoSono || ''}
                      onChange={(e) => setFormData({ ...formData, relatoAbertoSono: e.target.value })}
                      placeholder="Relato de episódios de cansaço, cochilos, sintomas de apneia percebidos pelo cônjuge ou queixas do motorista..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SAÚDE MENTAL */}
            {activeStep === 4 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#205857] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#00B7B5]" />
                    4. Saúde Mental, Estresse e Suporte Emocional
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rastreio de ansiedade, sobrecarga emocional, conflitos e rede de apoio social.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nível Percebido de Estresse</label>
                    <select
                      value={formData.nivelEstresse || ''}
                      onChange={(e) => setFormData({ ...formData, nivelEstresse: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Muito baixo">Muito baixo (+0 pt)</option>
                      <option value="Baixo">Baixo (+0 pt)</option>
                      <option value="Moderado">Moderado (+1 pt)</option>
                      <option value="Alto">Alto (+3 pts)</option>
                      <option value="Muito alto / Esgotamento">Muito alto / Esgotamento (+4 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sintomas Frequentes de Ansiedade</label>
                    <select
                      value={formData.sintomasAnsiedade || ''}
                      onChange={(e) => setFormData({ ...formData, sintomasAnsiedade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Nunca">Nunca (+0 pt)</option>
                      <option value="Raramente">Raramente (+0 pt)</option>
                      <option value="Às vezes">Às vezes (+1 pt)</option>
                      <option value="Frequentemente / Constante">Frequentemente / Constante (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preocupações Financeiras Relevantes</label>
                    <select
                      value={formData.preocupacoesFinanceiras || ''}
                      onChange={(e) => setFormData({ ...formData, preocupacoesFinanceiras: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Não">Não (+0 pt)</option>
                      <option value="Sim, moderadas">Sim, moderadas (+1 pt)</option>
                      <option value="Sim, graves">Sim, graves / Alto impacto (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rede de Apoio Social e Familiar</label>
                    <select
                      value={formData.redeApoioSocial || ''}
                      onChange={(e) => setFormData({ ...formData, redeApoioSocial: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Forte (Família e amigos presentes)">Forte (Família e amigos presentes) (+0 pt)</option>
                      <option value="Moderada">Moderada (+1 pt)</option>
                      <option value="Fraca / Isolado">Fraca / Isolado socialmente (+3 pts)</option>
                    </select>
                  </div>

                  {/* Open Response for Step 4 */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#205857] mb-1">
                      Anotações e Relato Livre: Aspectos Emocionais, Estresse e Clima Familiar
                    </label>
                    <textarea
                      rows={2}
                      value={formData.relatoAbertoSaudeMental || ''}
                      onChange={(e) => setFormData({ ...formData, relatoAbertoSaudeMental: e.target.value })}
                      placeholder="Relato espontâneo do motorista sobre preocupações, estado anímico, suporte familiar ou desabafos..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: ESTILO DE VIDA */}
            {activeStep === 5 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#205857] flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#00B7B5]" />
                    5. Estilo de Vida, Hábitos e Anotações Finais
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atividade física, alimentação na estrada, hidratação, tabagismo e observações gerais.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prática de Atividade Física</label>
                    <select
                      value={formData.praticaAtividadeFisica || ''}
                      onChange={(e) => setFormData({ ...formData, praticaAtividadeFisica: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Regularmente (3x+ semana)">Regularmente (3x+ por semana) (+0 pt)</option>
                      <option value="Ocasionalmente (1-2x semana)">Ocasionalmente (1 a 2x por semana) (+1 pt)</option>
                      <option value="Sedentário">Sedentário (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Padrão Alimentar na Estrada</label>
                    <select
                      value={formData.padraoAlimentar || ''}
                      onChange={(e) => setFormData({ ...formData, padraoAlimentar: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Equilibrado / Saudável">Equilibrado / Saudável (+0 pt)</option>
                      <option value="Regular">Regular (+1 pt)</option>
                      <option value="Inadequado (Ultraprocessados e fast food na estrada)">Inadequado (Ultraprocessados e gorduras) (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tabagismo</label>
                    <select
                      value={formData.tabagismo || ''}
                      onChange={(e) => setFormData({ ...formData, tabagismo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Não fumante">Não fumante (+0 pt)</option>
                      <option value="Ex-fumante">Ex-fumante (+1 pt)</option>
                      <option value="Fumante diário">Fumante diário (+3 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Consumo de Bebidas Alcoólicas</label>
                    <select
                      value={formData.consumoAlcool || ''}
                      onChange={(e) => setFormData({ ...formData, consumoAlcool: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    >
                      <option value="">Selecione...</option>
                      <option value="Não consome">Não consome (+0 pt)</option>
                      <option value="Raramente / Socialmente">Raramente / Socialmente (+0 pt)</option>
                      <option value="Frequentemente">Frequentemente (+3 pts)</option>
                    </select>
                  </div>

                  {/* Open Response for Step 5 */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-[#205857] mb-1">
                      Anotações e Relato Livre: Hábitos de Vida, Alimentação e Histórico de Saúde
                    </label>
                    <textarea
                      rows={2}
                      value={formData.relatoAbertoEstiloVida || ''}
                      onChange={(e) => setFormData({ ...formData, relatoAbertoEstiloVida: e.target.value })}
                      placeholder="Comentários sobre hidratação, medicamentos em uso, queixas de dores posturais ou doenças crônicas..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Anotações Técnicas / Observações Clínicas Complementares (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.observacoesGerais || ''}
                      onChange={(e) => setFormData({ ...formData, observacoesGerais: e.target.value })}
                      placeholder="Registre observações adicionais levantadas durante a avaliação..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00B7B5] outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons (Bottom Bar) */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => s - 1)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Etapa Anterior
                </button>
              ) : (
                <div />
              )}

              {activeStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => s + 1)}
                  className="px-5 py-2.5 bg-[#205857] hover:bg-[#184443] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
                >
                  Próxima Etapa
                  <ArrowRight className="w-4 h-4 text-[#00B7B5]" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00B7B5] hover:bg-[#009e9c] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Concluir Avaliação e Gerar Parecer
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Live Score Meter & Domain Radar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-20 space-y-4">
              {/* Live Score Counter Card */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Escore Biopsicossocial
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    Tempo Real
                  </span>
                </div>

                {/* Central Gauge Display */}
                <div className="text-center py-2">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#205857] tracking-tight">
                      {scoreResult.scoreTotal}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 79 pts</span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
                        scoreResult.classificacao === 'Risco alto'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : scoreResult.classificacao === 'Risco moderado'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {scoreResult.classificacao === 'Risco alto' ? (
                        <Zap className="w-3.5 h-3.5" />
                      ) : scoreResult.classificacao === 'Risco moderado' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      {scoreResult.classificacao}
                    </span>
                  </div>
                </div>

                {/* Domain Bars */}
                <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        Condições de Trabalho
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {scoreResult.condicoesTrabalhoScore} / 14
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#205857] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(scoreResult.condicoesTrabalhoScore / 14) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Moon className="w-3.5 h-3.5 text-slate-400" />
                        Qualidade do Sono & Fadiga
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {scoreResult.sonoScore} / 29
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00B7B5] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(scoreResult.sonoScore / 29) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Brain className="w-3.5 h-3.5 text-slate-400" />
                        Saúde Mental & Estresse
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {scoreResult.saudeMentalScore} / 20
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(scoreResult.saudeMentalScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                        Estilo de Vida & Hábitos
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {scoreResult.estiloVidaScore} / 16
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-700 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(scoreResult.estiloVidaScore / 16) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Selected Mini Card */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Motorista em Avaliação
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#205857] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {formData.driverName?.charAt(0) || 'M'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {formData.driverName || 'Selecione um motorista'}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-mono">
                      CPF: {formData.driverCpf || '---'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Filial:</span>
                    <strong className="text-slate-800">{formData.driverFilial || '---'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Placa:</span>
                    <strong className="text-slate-800 font-mono">{formData.driverPlate || '---'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW: UNIFIED EVALUATIONS LIST / DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Banner with Action Button */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#205857]">
              <Activity className="w-5 h-5 text-[#00B7B5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#205857] tracking-tight">
                Avaliações Biopsicossociais
              </h2>
              <p className="text-xs text-slate-500">
                Histórico de avaliações, rastreio de fadiga, qualidade do sono e pareceres técnicos
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#205857] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista de Avaliações
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
              Dashboard Analítico
            </button>
          </div>

          <button
            onClick={() => handleStartNew()}
            className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#00B7B5]" />
            Responder Nova Avaliação
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total de Avaliações
          </span>
          <span className="text-2xl font-black text-[#205857] mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Aplicadas na frota</span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Baixo Risco
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{lowRiskCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {totalCount > 0 ? Math.round((lowRiskCount / totalCount) * 100) : 0}% da base
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Risco Moderado
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{moderateRiskCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {totalCount > 0 ? Math.round((moderateRiskCount / totalCount) * 100) : 0}% da base
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
            Risco Alto (Atenção)
          </span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{highRiskCount}</span>
          <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
            {totalCount > 0 ? Math.round((highRiskCount / totalCount) * 100) : 0}% demandam intervenção
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: DEDICATED DASHBOARD VIEW */}
      {/* ============================================================== */}
      {viewMode === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Analytics Row: 4 Domain Markers & Branch Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marcadores dos 4 Domínios Biopsicossociais */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#205857]" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Marcadores dos 4 Domínios Biopsicossociais
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">Média Geral: {bioAnalytics.avgScore} / 79 pts</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* 1. Condições de Trabalho */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#205857]" />
                      <strong className="text-xs font-bold text-slate-800">1. Condições de Trabalho</strong>
                    </div>
                    <span className="font-mono font-bold text-[#205857] text-xs">
                      {bioAnalytics.avgTrab} <span className="text-[10px] text-slate-400 font-normal">/ 14 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#205857] transition-all duration-500"
                      style={{ width: `${Math.min(100, (Number(bioAnalytics.avgTrab) / 14) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>Jornada, pausas programadas e percepção de suporte</span>
                    <span className="font-semibold text-slate-700">{totalCount > 0 ? Math.round((Number(bioAnalytics.avgTrab) / 14) * 100) : 0}% de carga</span>
                  </p>
                </div>

                {/* 2. Qualidade do Sono & Fadiga */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#00B7B5]" />
                      <strong className="text-xs font-bold text-slate-800">2. Qualidade do Sono & Fadiga</strong>
                    </div>
                    <span className="font-mono font-bold text-[#00B7B5] text-xs">
                      {bioAnalytics.avgSono} <span className="text-[10px] text-slate-400 font-normal">/ 29 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#00B7B5] transition-all duration-500"
                      style={{ width: `${Math.min(100, (Number(bioAnalytics.avgSono) / 29) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>Privação de sono, sonolência diurna/trânsito e ronco</span>
                    <span className="font-semibold text-slate-700">{totalCount > 0 ? Math.round((Number(bioAnalytics.avgSono) / 29) * 100) : 0}% de carga</span>
                  </p>
                </div>

                {/* 3. Saúde Mental & Estresse */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-600" />
                      <strong className="text-xs font-bold text-slate-800">3. Saúde Mental & Estresse</strong>
                    </div>
                    <span className="font-mono font-bold text-amber-700 text-xs">
                      {bioAnalytics.avgMental} <span className="text-[10px] text-slate-400 font-normal">/ 20 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (Number(bioAnalytics.avgMental) / 20) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>Sobrecarga emocional, ansiedade e rede de apoio social</span>
                    <span className="font-semibold text-slate-700">{totalCount > 0 ? Math.round((Number(bioAnalytics.avgMental) / 20) * 100) : 0}% de carga</span>
                  </p>
                </div>

                {/* 4. Estilo de Vida & Hábitos */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <strong className="text-xs font-bold text-slate-800">4. Estilo de Vida & Hábitos</strong>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {bioAnalytics.avgEstilo} <span className="text-[10px] text-slate-400 font-normal">/ 16 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, (Number(bioAnalytics.avgEstilo) / 16) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>Atividade física, hidratação e nutrição na estrada</span>
                    <span className="font-semibold text-slate-700">{totalCount > 0 ? Math.round((Number(bioAnalytics.avgEstilo) / 16) * 100) : 0}% de carga</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filiais Breakdown */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#205857]" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Métricas Biopsicossociais por Filial
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#205857]">4 Unidades</span>
              </div>

              <div className="space-y-3 pt-2">
                {(Object.entries(bioAnalytics.filialMap) as [string, { total: number; highRisk: number; sumScore: number }][]).map(([filial, data]) => {
                  const avgFilial = data.total > 0 ? (data.sumScore / data.total).toFixed(1) : '0';

                  return (
                    <div key={filial} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{filial}</span>
                          <span className="text-[10px] text-slate-500">({data.total} avaliações)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-600 font-semibold">
                            Média: {avgFilial} pts
                          </span>
                          {data.highRisk > 0 && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md text-[10px]">
                              {data.highRisk} Risco Alto
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#205857] transition-all duration-500"
                          style={{
                            width: `${totalCount > 0 ? (data.total / totalCount) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Priority Attention List (Risco Alto) */}
          {bioAnalytics.highRiskDrivers.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-rose-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
                    Plano de Ação Imediato — Condutores em Risco Alto ({bioAnalytics.highRiskDrivers.length})
                  </h3>
                </div>
                <span className="text-xs text-rose-700 font-semibold">Acompanhamento Prioritário</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bioAnalytics.highRiskDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <strong className="font-bold text-slate-900 truncate">{driver.driverName}</strong>
                        <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-black rounded-md text-[10px] shrink-0 font-mono">
                          {driver.scoreTotal} pts
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block font-mono">CPF: {driver.driverCpf} · {driver.driverFilial}</span>
                    </div>

                    <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {new Date(driver.dataAtendimento).toLocaleDateString('pt-BR')}
                      </span>
                      {onOpenReport && (
                        <button
                          onClick={() => onOpenReport(driver.id)}
                          className="px-2.5 py-1 bg-[#205857] hover:bg-[#184443] text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-[10px]"
                        >
                          <FileText className="w-3 h-3 text-[#00B7B5]" />
                          Ver Parecer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: OPERATIONAL EVALUATIONS LIST VIEW */}
      {/* ============================================================== */}
      {viewMode === 'LIST' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do motorista, CPF ou avaliador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00B7B5] outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={filterFilial}
                  onChange={(e) => setFilterFilial(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] outline-hidden"
                >
                  <option value="TODAS">Todas as Filiais</option>
                  <option value="Matriz">Matriz</option>
                  <option value="Pernambuco">Pernambuco</option>
                  <option value="Maranhão">Maranhão</option>
                  <option value="Mossoró">Mossoró</option>
                </select>

                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] outline-hidden"
                >
                  <option value="ALL">Todos os Riscos</option>
                  <option value="Baixo risco">Baixo Risco</option>
                  <option value="Risco moderado">Risco Moderado</option>
                  <option value="Risco alto">Risco Alto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evaluations Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {filteredEvaluations.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Activity className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-700">Nenhuma avaliação biopsicossocial encontrada</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no botão acima para responder uma nova avaliação ou ajuste seus termos de busca.
                </p>
                <button
                  onClick={() => handleStartNew()}
                  className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#00B7B5]" />
                  Responder Nova Avaliação Agora
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Motorista / Documento</th>
                      <th className="py-3 px-4">Filial</th>
                      <th className="py-3 px-4">Data Atendimento</th>
                      <th className="py-3 px-4">Avaliador</th>
                      <th className="py-3 px-4">Escores por Domínio</th>
                      <th className="py-3 px-4">Classificação de Risco</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvaluations.map((item) => {
                      let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      if (item.classificacao === 'Risco alto') badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                      else if (item.classificacao === 'Risco moderado') badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{item.driverName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">CPF: {item.driverCpf}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {item.driverFilial || 'Matriz'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            {new Date(item.dataAtendimento).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.avaliador}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono" title="Condições de Trabalho">
                                Trab: {item.condicoesTrabalhoScore}/14
                              </span>
                              <span className="px-1.5 py-0.5 bg-teal-50 text-[#205857] rounded font-mono" title="Sono & Fadiga">
                                Sono: {item.sonoScore}/29
                              </span>
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 rounded font-mono" title="Saúde Mental">
                                Mental: {item.saudeMentalScore}/20
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-flex items-center gap-1 ${badgeClass}`}>
                              {item.classificacao} ({item.scoreTotal} pts)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onOpenReport && (
                                <button
                                  onClick={() => onOpenReport(item.id)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors inline-flex items-center gap-1 text-[11px]"
                                  title="Ver Parecer Técnico"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#00B7B5]" />
                                  Parecer
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(item.id, item.driverName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                                title="Excluir avaliação"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
