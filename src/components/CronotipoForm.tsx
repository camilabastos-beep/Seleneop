import React, { useState, useMemo } from 'react';
import { CronotipoAnswers, CronotipoEvaluation, Driver, User } from '../types';
import { calculateCronotipoScore } from '../utils/scoring';
import { 
  getCronotipoEvaluations, 
  saveCronotipoEvaluation, 
  deleteCronotipoEvaluation, 
  getDrivers 
} from '../utils/storage';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Check, 
  Save, 
  UserCheck, 
  Shield, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  ArrowLeft,
  BarChart3,
  ListFilter,
  Building,
  AlertTriangle,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';

interface CronotipoFormProps {
  currentUser: User;
  onSaved: (evalId: string) => void;
  onOpenReport?: (evalId: string) => void;
  preselectedDriver?: Driver | null;
}

export const CronotipoForm: React.FC<CronotipoFormProps> = ({
  currentUser,
  onSaved,
  onOpenReport,
  preselectedDriver
}) => {
  const drivers = getDrivers();
  const [evaluations, setEvaluations] = useState<CronotipoEvaluation[]>(() =>
    getCronotipoEvaluations()
  );

  // UI state: List view vs Dashboard view vs Questionnaire answering mode
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [isAnswering, setIsAnswering] = useState<boolean>(Boolean(preselectedDriver));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilial, setFilterFilial] = useState('TODAS');
  const [filterProfile, setFilterProfile] = useState('ALL');

  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    preselectedDriver?.id || ''
  );
  const [dataAvaliacao, setDataAvaliacao] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [avaliador, setAvaliador] = useState<string>(currentUser.name);

  // 19 questions initial state (starts blank so user answers manually)
  const [answers, setAnswers] = useState<Partial<CronotipoAnswers>>({});

  const reloadData = () => {
    setEvaluations(getCronotipoEvaluations());
  };

  const handleStartNew = (driver?: Driver) => {
    setSelectedDriverId(driver?.id || '');
    setDataAvaliacao(new Date().toISOString().slice(0, 10));
    setAvaliador(currentUser.name);
    setAnswers({});
    setIsAnswering(true);
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const scoreResult = useMemo(() => {
    return calculateCronotipoScore(answers as CronotipoAnswers);
  }, [answers]);

  const handleAnswerChange = (questionKey: keyof CronotipoAnswers, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriver) {
      alert('Selecione um motorista da frota para vincular a avaliação de cronotipo.');
      return;
    }

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 19) {
      alert(`Por favor, responda a todas as 19 questões do questionário antes de concluir. Questões respondidas: ${answeredCount} de 19.`);
      return;
    }

    const evalData: CronotipoEvaluation = {
      id: `crono-eval-${Date.now()}`,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverCpf: selectedDriver.cpf,
      driverFilial: selectedDriver.filial,
      driverPlate: selectedDriver.plate,
      dataAvaliacao,
      avaliador,
      answers,
      totalScore: scoreResult.totalScore,
      classificacao: scoreResult.classificacao,
      descricaoPerfil: scoreResult.descricao,
      objetivo:
        'Apresentar o mapeamento detalhado da preferência circadiana (cronotipo) do colaborador através do protocolo padronizado Horne-Östberg. A identificação do perfil biológico visa fundamentar a adequação dos horários operacionais, otimizar a gestão de turnos e mitigar preventivamente os riscos de fadiga e sonolência no exercício da função de motorista.',
      procedimento:
        'Aplicação e mensuração do Questionário de Cronotipo de Horne-Östberg (composto por 19 questões objetivas validadas). O instrumento avalia hábitos de sono, horários preferenciais de despertar e repouso, além do nível de alerta fisiológico e pico de capacidade cognitiva ao longo do ciclo de 24 horas.',
      analiseTecnica:
        'A análise da preferência circadiana constitui uma ferramenta estratégica na prevenção de acidentes e na preservação da saúde ocupacional. A adequação entre o cronotipo do condutor e a sua escala de trabalho minimiza lapsos de atenção, diminui o tempo de reação ao volante e favorece a manutenção do estado de vigília durante a condução.',
      recomendacoes:
        scoreResult.classificacao.includes('Vespertino')
          ? 'Recomenda-se, quando possível, evitar escalas com início muito precoce (antes das 06:00) e assegurar intervalo suficiente entre a última jornada e o novo início. Manter 7 a 8 horas de sono reparador e pausas ativas regulares.'
          : scoreResult.classificacao.includes('Matutino')
          ? 'Recomenda-se priorizar escalas no turno diurno/matutino. Evitar escalas noturnas contínuas após as 21:00 e reforçar a atenção nos trechos finais de viagem.'
          : 'Recomenda-se manter rotina estável de repouso, evitar alternâncias bruscas de escalas e realizar paradas preventivas de 15 minutos a cada duas horas de direção.',
      createdAt: new Date().toISOString()
    };

    saveCronotipoEvaluation(evalData);
    reloadData();
    setIsAnswering(false);
    onSaved(evalData.id);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente remover a avaliação de cronotipo de ${name}?`)) {
      deleteCronotipoEvaluation(id);
      reloadData();
    }
  };

  const handleApplyPreset = (type: 'MATUTINO' | 'INTERMEDIARIO' | 'VESPERTINO') => {
    if (type === 'MATUTINO') {
      setAnswers({
        q1: 5, q2: 5, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4,
        q11: 4, q12: 4, q13: 4, q14: 4, q15: 4, q16: 4, q17: 5, q18: 5, q19: 5
      });
    } else if (type === 'INTERMEDIARIO') {
      setAnswers({
        q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3,
        q11: 3, q12: 3, q13: 3, q14: 3, q15: 3, q16: 3, q17: 3, q18: 3, q19: 3
      });
    } else {
      setAnswers({
        q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1,
        q11: 1, q12: 1, q13: 1, q14: 1, q15: 1, q16: 1, q17: 1, q18: 1, q19: 1
      });
    }
  };

  const cronoBadgeStyles: Record<string, string> = {
    'Vespertino extremo': 'bg-indigo-100 text-indigo-900 border-indigo-300',
    'Moderadamente Vespertino': 'bg-blue-100 text-blue-900 border-blue-300',
    'Intermediário': 'bg-teal-100 text-[#205857] border-teal-300',
    'Moderadamente Matutino': 'bg-amber-100 text-amber-900 border-amber-300',
    'Matutino extremo': 'bg-orange-100 text-orange-900 border-orange-300'
  };

  // Filtered List
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      if (filterFilial !== 'TODAS' && item.driverFilial !== filterFilial) return false;
      if (filterProfile !== 'ALL' && item.classificacao !== filterProfile) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = item.driverName.toLowerCase().includes(q);
        const matchCpf = item.driverCpf.toLowerCase().includes(q);
        const matchEval = item.avaliador.toLowerCase().includes(q);
        if (!matchName && !matchCpf && !matchEval) return false;
      }
      return true;
    });
  }, [evaluations, filterFilial, filterProfile, searchTerm]);

  // General Metrics
  const totalCount = evaluations.length;
  const matutinosCount = evaluations.filter((e) => e.classificacao.includes('Matutino')).length;
  const intermediariosCount = evaluations.filter((e) => e.classificacao === 'Intermediário').length;
  const vespertinosCount = evaluations.filter((e) => e.classificacao.includes('Vespertino')).length;

  // Analytics for Cronotipo Dashboard
  const cronoAnalytics = useMemo(() => {
    let sumScore = 0;
    let matutinoExtremo = 0;
    let modMatutino = 0;
    let intermediario = 0;
    let modVespertino = 0;
    let vespertinoExtremo = 0;

    const filialMap: Record<string, { total: number; matutinos: number; intermediarios: number; vespertinos: number; sumScore: number }> = {
      Matriz: { total: 0, matutinos: 0, intermediarios: 0, vespertinos: 0, sumScore: 0 },
      Pernambuco: { total: 0, matutinos: 0, intermediarios: 0, vespertinos: 0, sumScore: 0 },
      Maranhão: { total: 0, matutinos: 0, intermediarios: 0, vespertinos: 0, sumScore: 0 },
      Mossoró: { total: 0, matutinos: 0, intermediarios: 0, vespertinos: 0, sumScore: 0 }
    };

    evaluations.forEach((item) => {
      sumScore += item.totalScore || 0;

      if (item.classificacao === 'Matutino extremo') matutinoExtremo++;
      else if (item.classificacao === 'Moderadamente Matutino') modMatutino++;
      else if (item.classificacao === 'Intermediário') intermediario++;
      else if (item.classificacao === 'Moderadamente Vespertino') modVespertino++;
      else if (item.classificacao === 'Vespertino extremo') vespertinoExtremo++;

      const fil = item.driverFilial || 'Matriz';
      if (!filialMap[fil]) filialMap[fil] = { total: 0, matutinos: 0, intermediarios: 0, vespertinos: 0, sumScore: 0 };
      filialMap[fil].total++;
      filialMap[fil].sumScore += item.totalScore || 0;

      if (item.classificacao.includes('Matutino')) filialMap[fil].matutinos++;
      else if (item.classificacao === 'Intermediário') filialMap[fil].intermediarios++;
      else if (item.classificacao.includes('Vespertino')) filialMap[fil].vespertinos++;
    });

    const avgScore = totalCount > 0 ? (sumScore / totalCount).toFixed(1) : '0';
    const vespertinosList = evaluations.filter((e) => e.classificacao.includes('Vespertino'));

    return {
      avgScore,
      matutinoExtremo,
      modMatutino,
      intermediario,
      modVespertino,
      vespertinoExtremo,
      filialMap,
      vespertinosList
    };
  }, [evaluations, totalCount]);

  // ==========================================
  // VIEW: ANSWERING QUESTIONNAIRE FORM (19 Questions)
  // ==========================================
  if (isAnswering) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnswering(false)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Voltar para a lista de cronotipos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Sun className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-xl font-black text-[#205857] tracking-tight">
                  Responder Avaliação de Cronotipo (Horne-Östberg)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instrumento padronizado de 19 questões para identificação do perfil biológico e pico de alerta do condutor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium">Preenchimento rápido:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('MATUTINO')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 rounded-lg font-bold border border-slate-200 transition-colors"
              >
                Matutino
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('INTERMEDIARIO')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 text-[#205857] rounded-lg font-bold border border-slate-200 transition-colors mx-1"
              >
                Intermediário
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('VESPERTINO')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-900 rounded-lg font-bold border border-slate-200 transition-colors"
              >
                Vespertino
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driver Selection & Metadata Header */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00B7B5]" />
              Identificação do Motorista Avaliado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motorista Selecionado *
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] outline-hidden font-semibold text-slate-900"
                >
                  <option value="">Selecione um motorista da frota...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — CPF: {d.cpf} ({d.filial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Avaliação *
                </label>
                <input
                  type="date"
                  value={dataAvaliacao}
                  onChange={(e) => setDataAvaliacao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avaliador Responsável
                </label>
                <input
                  type="text"
                  value={avaliador}
                  onChange={(e) => setAvaliador(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Real-time score indicator */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl font-mono text-[#00B7B5] border border-white/15">
                {scoreResult.totalScore}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    Escore Total Horne-Östberg
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 text-white">
                    {scoreResult.classificacao}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {scoreResult.descricao}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pico de Alerta:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">{scoreResult.picoAlerta}</span>
              </div>
              <div className="border-l border-white/20 pl-4">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Escala Recomendada:</span>
                <span className="text-xs font-bold text-teal-300">{scoreResult.faixaHorarioIdeal}</span>
              </div>
            </div>
          </div>

          {/* 19 Questions Grid */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-[#00B7B5]" />
              Questionário Padronizado Horne-Östberg (19 Questões)
            </h3>

            <div className="space-y-6">
              {/* Q1 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    1. Considerando apenas o seu bem-estar pessoal, se você fosse inteiramente livre para planejar o seu dia, a que horas se levantaria?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q1} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { val: 5, label: '05:00 – 06:30 h' },
                    { val: 4, label: '06:30 – 07:45 h' },
                    { val: 3, label: '07:45 – 09:45 h' },
                    { val: 2, label: '09:45 – 11:00 h' },
                    { val: 1, label: '11:00 – 12:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q1', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q1 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    2. Considerando apenas o seu bem-estar pessoal, a que horas se deitaria se fosse inteiramente livre para planejar a sua noite?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q2} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { val: 5, label: '20:00 – 21:00 h' },
                    { val: 4, label: '21:00 – 22:15 h' },
                    { val: 3, label: '22:15 – 00:30 h' },
                    { val: 2, label: '00:30 – 01:45 h' },
                    { val: 1, label: '01:45 – 03:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q2', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q2 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    3. Se você tiver de se levantar a uma hora determinada pela manhã, em que medida depende do despertador?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q3} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 4, label: 'Nada dependente' },
                    { val: 3, label: 'Pouco dependente' },
                    { val: 2, label: 'Razoavelmente dependente' },
                    { val: 1, label: 'Muito dependente' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q3', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q3 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    4. Se as condições forem adequadas, quão fácil acha o levantar pela manhã?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q4} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Nada fácil' },
                    { val: 2, label: 'Não muito fácil' },
                    { val: 3, label: 'Razoavelmente fácil' },
                    { val: 4, label: 'Muito fácil' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q4', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q4 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    5. Como se sente durante a primeira meia hora após acordar de manhã?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q5} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Muito sonolento' },
                    { val: 2, label: 'Razoavelmente sonolento' },
                    { val: 3, label: 'Razoavelmente desperto' },
                    { val: 4, label: 'Completamente desperto' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q5', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q5 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q6 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    6. Como é o seu apetite durante a primeira meia hora após levantar?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q6} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Muito fraco' },
                    { val: 2, label: 'Fraco' },
                    { val: 3, label: 'Razoavelmente bom' },
                    { val: 4, label: 'Muito bom' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q6', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q6 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q7 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    7. Durante a primeira meia hora após levantar de manhã, como se sente?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q7} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Muito cansado' },
                    { val: 2, label: 'Razoavelmente cansado' },
                    { val: 3, label: 'Razoavelmente descansado' },
                    { val: 4, label: 'Completamente descansado' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q7', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q7 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q8 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    8. Se não tiver compromissos no dia seguinte, a que horas se deitará comparado ao habitual?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q8} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 4, label: 'Nunca ou muito raramente mais tarde' },
                    { val: 3, label: 'Menos de 1 hora mais tarde' },
                    { val: 2, label: '1 a 2 horas mais tarde' },
                    { val: 1, label: 'Mais de 2 horas mais tarde' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q8', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q8 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q9 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    9. Você decidiu praticar exercícios físicos. Um amigo propõe treinar 2 vezes por semana, das 07:00 às 08:00 h. Como se sentiria?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q9} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 4, label: 'Em boa forma' },
                    { val: 3, label: 'Em forma razoável' },
                    { val: 2, label: 'Acharia difícil' },
                    { val: 1, label: 'Acharia muito difícil' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q9', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q9 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q10 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    10. A que horas da noite você se sente cansado e com vontade de dormir?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q10} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { val: 5, label: '20:00 – 21:00 h' },
                    { val: 4, label: '21:00 – 22:15 h' },
                    { val: 3, label: '22:15 – 00:45 h' },
                    { val: 2, label: '00:45 – 02:00 h' },
                    { val: 1, label: '02:00 – 03:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q10', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q10 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q11 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    11. Você deseja estar no seu rendimento máximo para um teste de 2 horas mentalmente cansativo. Qual horário escolheria se fosse inteiramente livre?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q11} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 6, label: '08:00 – 10:00 h' },
                    { val: 4, label: '11:00 – 13:00 h' },
                    { val: 2, label: '15:00 – 17:00 h' },
                    { val: 0, label: '19:00 – 21:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q11', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q11 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q12 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    12. Se for para a cama às 23:00 h, em que nível de cansaço você se encontra?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q12} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 0, label: 'Nada cansado' },
                    { val: 2, label: 'Um pouco cansado' },
                    { val: 3, label: 'Razoavelmente cansado' },
                    { val: 5, label: 'Muito cansado' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q12', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q12 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q13 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    13. Por alguma razão, você deitou-se várias horas mais tarde que o habitual, mas não precisa se levantar a uma hora fixa. O que acontece?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q13} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 4, label: 'Acordo à hora habitual e não volto a dormir' },
                    { val: 3, label: 'Acordo à hora habitual e continuo a dormitar' },
                    { val: 2, label: 'Acordo à hora habitual e volto a dormir' },
                    { val: 1, label: 'Não acordo até mais tarde que o habitual' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q13', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q13 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q14 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    14. Numa noite você tem de ficar acordado entre as 04:00 e as 06:00 h para fazer uma guarda. No dia seguinte está livre. O que prefere?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q14} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Não me deitar até a guarda terminar' },
                    { val: 2, label: 'Dormir antes e depois da guarda' },
                    { val: 3, label: 'Dormir antes e levantar após a guarda' },
                    { val: 4, label: 'Dormir toda a noite e dormir depois' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q14', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q14 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q15 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    15. Você tem de fazer 2 horas de trabalho físico pesado. Se fosse livre para programar o seu dia, qual horário escolheria?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q15} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 4, label: '08:00 – 10:00 h' },
                    { val: 3, label: '11:00 – 13:00 h' },
                    { val: 2, label: '15:00 – 17:00 h' },
                    { val: 1, label: '19:00 – 21:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q15', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q15 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q16 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    16. Você decidiu fazer exercícios físicos com um amigo 2 vezes por semana, das 22:00 às 23:00 h. Como se sentiria?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q16} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: 'Em boa forma' },
                    { val: 2, label: 'Em forma razoável' },
                    { val: 3, label: 'Acharia difícil' },
                    { val: 4, label: 'Acharia muito difícil' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q16', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q16 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q17 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    17. Suponha que pode escolher o seu horário de trabalho de 5 horas consecutivas por dia (entre as 04:00 e as 00:00). Que 5 horas escolheria?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q17} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { val: 5, label: '04:00 – 09:00 h' },
                    { val: 4, label: '08:00 – 13:00 h' },
                    { val: 3, label: '09:00 – 14:00 h' },
                    { val: 2, label: '14:00 – 19:00 h' },
                    { val: 1, label: '19:00 – 00:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q17', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q17 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q18 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    18. A que horas do dia você atinge o seu melhor momento de bem-estar e rendimento?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q18} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { val: 5, label: '05:00 – 08:00 h' },
                    { val: 4, label: '08:00 – 10:00 h' },
                    { val: 3, label: '10:00 – 17:00 h' },
                    { val: 2, label: '17:00 – 22:00 h' },
                    { val: 1, label: '22:00 – 05:00 h' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q18', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q18 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q19 */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    19. Fala-se com frequência de pessoas “matutinas” e “vespertinas”. Qual destes tipos você considera que seja?
                  </span>
                  <span className="text-xs font-mono font-bold text-[#205857] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {answers.q19} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 6, label: 'Definitivamente matutino' },
                    { val: 4, label: 'Mais matutino que vespertino' },
                    { val: 2, label: 'Mais vespertino que matutino' },
                    { val: 0, label: 'Definitivamente vespertino' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleAnswerChange('q19', opt.val)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        answers.q19 === opt.val
                          ? 'bg-[#205857] text-white border-[#205857] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAnswering(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#205857] hover:bg-[#184443] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#00B7B5]" />
                Salvar Avaliação de Cronotipo
              </button>
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Sun className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#205857] tracking-tight">
                Avaliações de Cronotipo (Horne-Östberg)
              </h2>
              <p className="text-xs text-slate-500">
                Mapeamento circadiano, gestão biológica de escalas operacionais e pareceres técnicos
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
              Lista de Cronotipos
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
              Dashboard Circadiano
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
            Total Mapeado
          </span>
          <span className="text-2xl font-black text-[#205857] mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Motoristas avaliados</span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Perfil Matutino
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{matutinosCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {totalCount > 0 ? Math.round((matutinosCount / totalCount) * 100) : 0}% da frota
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#205857] block">
            Perfil Intermediário
          </span>
          <span className="text-2xl font-black text-[#205857] mt-1 block">{intermediariosCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {totalCount > 0 ? Math.round((intermediariosCount / totalCount) * 100) : 0}% da frota
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
            Perfil Vespertino
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">{vespertinosCount}</span>
          <span className="text-[11px] text-indigo-600 font-medium mt-0.5 block">
            {totalCount > 0 ? Math.round((vespertinosCount / totalCount) * 100) : 0}% da frota
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: DEDICATED DASHBOARD VIEW */}
      {/* ============================================================== */}
      {viewMode === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5-tier Distribution Card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Distribuição dos 5 Perfis Circadianos (Horne-Östberg)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">Média: {cronoAnalytics.avgScore} pts</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Matutino extremo */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-orange-900">Matutino Extremo (70 a 86 pts)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cronoAnalytics.matutinoExtremo} ({totalCount > 0 ? Math.round((cronoAnalytics.matutinoExtremo / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (cronoAnalytics.matutinoExtremo / totalCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Moderadamente Matutino */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-amber-900">Moderadamente Matutino (59 a 69 pts)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cronoAnalytics.modMatutino} ({totalCount > 0 ? Math.round((cronoAnalytics.modMatutino / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (cronoAnalytics.modMatutino / totalCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Intermediário */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-teal-900">Intermediário (42 a 58 pts)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cronoAnalytics.intermediario} ({totalCount > 0 ? Math.round((cronoAnalytics.intermediario / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#205857] transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (cronoAnalytics.intermediario / totalCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Moderadamente Vespertino */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-blue-900">Moderadamente Vespertino (31 a 41 pts)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cronoAnalytics.modVespertino} ({totalCount > 0 ? Math.round((cronoAnalytics.modVespertino / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (cronoAnalytics.modVespertino / totalCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Vespertino Extremo */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-indigo-900">Vespertino Extremo (16 a 30 pts)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cronoAnalytics.vespertinoExtremo} ({totalCount > 0 ? Math.round((cronoAnalytics.vespertinoExtremo / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (cronoAnalytics.vespertinoExtremo / totalCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filiais Breakdown */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#205857]" />
                  <h3 className="text-sm font-bold text-[#205857] uppercase tracking-wider">
                    Perfis Circadianos por Filial
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#205857]">4 Unidades</span>
              </div>

              <div className="space-y-3 pt-1">
                {(Object.entries(cronoAnalytics.filialMap) as [string, { total: number; matutinos: number; intermediarios: number; vespertinos: number; sumScore: number }][]).map(([filial, data]) => {
                  const avgF = data.total > 0 ? (data.sumScore / data.total).toFixed(1) : '0';

                  return (
                    <div key={filial} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900 font-bold">{filial}</strong>
                          <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                            ({data.total} motoristas · Média: {avgF} pts)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                            {data.matutinos} Mat.
                          </span>
                          <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded">
                            {data.intermediarios} Inter.
                          </span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                            {data.vespertinos} Vesp.
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${data.total > 0 ? (data.matutinos / data.total) * 100 : 0}%`
                          }}
                          title="Matutinos"
                        />
                        <div
                          className="h-full bg-[#205857]"
                          style={{
                            width: `${data.total > 0 ? (data.intermediarios / data.total) * 100 : 0}%`
                          }}
                          title="Intermediários"
                        />
                        <div
                          className="h-full bg-indigo-600"
                          style={{
                            width: `${data.total > 0 ? (data.vespertinos / data.total) * 100 : 0}%`
                          }}
                          title="Vespertinos"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: OPERATIONAL CRONOTIPO LIST VIEW */}
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
                  value={filterProfile}
                  onChange={(e) => setFilterProfile(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#00B7B5] outline-hidden"
                >
                  <option value="ALL">Todos os Perfis</option>
                  <option value="Matutino extremo">Matutino extremo</option>
                  <option value="Moderadamente Matutino">Moderadamente Matutino</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Moderadamente Vespertino">Moderadamente Vespertino</option>
                  <option value="Vespertino extremo">Vespertino extremo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cronotipo Evaluations Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {filteredEvaluations.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Sun className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-700">Nenhuma avaliação de cronotipo encontrada</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no botão acima para responder uma nova avaliação Horne-Östberg.
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
                      <th className="py-3 px-4">Motorista / CPF</th>
                      <th className="py-3 px-4">Filial</th>
                      <th className="py-3 px-4">Data Avaliação</th>
                      <th className="py-3 px-4">Avaliador</th>
                      <th className="py-3 px-4">Escore Horne-Östberg</th>
                      <th className="py-3 px-4">Perfil Circadiano</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvaluations.map((item) => {
                      const badgeStyle = cronoBadgeStyles[item.classificacao] || 'bg-slate-100 text-slate-800 border-slate-200';

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
                            {new Date(item.dataAvaliacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.avaliador}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 font-mono">
                              {item.totalScore} <span className="text-[10px] text-slate-400 font-normal">/ 86 pts</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-flex items-center gap-1 ${badgeStyle}`}>
                              {item.classificacao}
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
