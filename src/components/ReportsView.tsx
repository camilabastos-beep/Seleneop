import React, { useState, useMemo } from 'react';
import { BiopsychosocialEvaluation, CronotipoEvaluation, FatigueIntervention, User } from '../types';
import { getBiopsychosocialEvaluations, getCronotipoEvaluations, getFatigueInterventions } from '../utils/storage';
import { downloadDocFile, evaluateSla } from '../utils/scoring';
import { TransparanaLogo } from './TransparanaLogo';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Calendar, 
  UserCheck, 
  Shield, 
  ArrowLeft, 
  Clock, 
  Activity, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Eye, 
  Building2,
  FileCheck2
} from 'lucide-react';

interface ReportsViewProps {
  currentUser: User;
}

type ReportType = 'ALL' | 'BIOPSYCHOSOCIAL' | 'CRONOTIPO' | 'FATIGUE';

interface SelectedReportState {
  type: 'BIOPSYCHOSOCIAL' | 'CRONOTIPO' | 'FATIGUE';
  bioItem?: BiopsychosocialEvaluation;
  cronoItem?: CronotipoEvaluation;
  fatigueItem?: FatigueIntervention;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
  const biopsychosocialList = getBiopsychosocialEvaluations();
  const cronotipoList = getCronotipoEvaluations();
  const fatigueList = getFatigueInterventions();

  // Navigation state: null = list view; populated = detail report view
  const [selectedReport, setSelectedReport] = useState<SelectedReportState | null>(null);

  // Filters & Search
  const [filterType, setFilterType] = useState<ReportType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFilial, setFilterFilial] = useState('TODAS');
  const [copied, setCopied] = useState(false);

  // Combine and unify items for the unified list view
  const unifiedReports = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'BIOPSYCHOSOCIAL' | 'CRONOTIPO' | 'FATIGUE';
      title: string;
      driverName: string;
      driverCpf: string;
      filial: string;
      date: string;
      evaluator: string;
      resultBadge: { label: string; color: string };
      rawBio?: BiopsychosocialEvaluation;
      rawCrono?: CronotipoEvaluation;
      rawFatigue?: FatigueIntervention;
    }> = [];

    // 1. Biopsychosocial
    biopsychosocialList.forEach((bio) => {
      let color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      if (bio.classificacao === 'Risco alto') color = 'bg-rose-50 text-rose-800 border-rose-200';
      else if (bio.classificacao === 'Risco moderado') color = 'bg-amber-50 text-amber-800 border-amber-200';

      list.push({
        id: `bio-${bio.id}`,
        type: 'BIOPSYCHOSOCIAL',
        title: 'Avaliação Biopsicossocial',
        driverName: bio.driverName,
        driverCpf: bio.driverCpf,
        filial: bio.driverFilial || 'Matriz',
        date: bio.dataAtendimento || bio.createdAt,
        evaluator: bio.avaliador,
        resultBadge: {
          label: `${bio.classificacao} (${bio.scoreTotal} pts)`,
          color
        },
        rawBio: bio
      });
    });

    // 2. Cronotipo
    cronotipoList.forEach((crono) => {
      let color = 'bg-teal-50 text-[#205857] border-teal-200';
      if (crono.classificacao.includes('Vespertino')) color = 'bg-purple-50 text-purple-800 border-purple-200';
      else if (crono.classificacao.includes('Matutino')) color = 'bg-amber-50 text-amber-800 border-amber-200';

      list.push({
        id: `crono-${crono.id}`,
        type: 'CRONOTIPO',
        title: 'Cronotipo Horne-Östberg',
        driverName: crono.driverName,
        driverCpf: crono.driverCpf,
        filial: crono.driverFilial || 'Matriz',
        date: crono.dataAvaliacao || crono.createdAt,
        evaluator: crono.avaliador,
        resultBadge: {
          label: `${crono.classificacao} (${crono.totalScore} pts)`,
          color
        },
        rawCrono: crono
      });
    });

    // 3. Fatigue Interventions
    fatigueList.forEach((fat) => {
      const slaTotal = evaluateSla('EVENTO_INTERVENCAO', fat.diffEventoIntervencao);
      let color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      if (slaTotal.status === 'BREACH') color = 'bg-rose-50 text-rose-800 border-rose-200';
      else if (slaTotal.status === 'WARN') color = 'bg-amber-50 text-amber-800 border-amber-200';

      list.push({
        id: `fat-${fat.id}`,
        type: 'FATIGUE',
        title: 'Intervenção em Evento de Fadiga',
        driverName: fat.motorista,
        driverCpf: `Placa: ${fat.placa}`,
        filial: 'Operação Transparaná',
        date: fat.data,
        evaluator: 'Central CCO Transparaná',
        resultBadge: {
          label: `${slaTotal.label} (Tempo: ${fat.diffEventoIntervencao || '00:00'})`,
          color
        },
        rawFatigue: fat
      });
    });

    // Sort by date descending
    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, [biopsychosocialList, cronotipoList, fatigueList]);

  // Filtered list
  const filteredReports = useMemo(() => {
    return unifiedReports.filter((item) => {
      // Type filter
      if (filterType !== 'ALL' && item.type !== filterType) return false;

      // Filial filter
      if (filterFilial !== 'TODAS' && item.filial !== filterFilial) return false;

      // Search query (driver name, cpf, evaluator)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.driverName.toLowerCase().includes(q);
        const matchCpf = item.driverCpf.toLowerCase().includes(q);
        const matchEvaluator = item.evaluator.toLowerCase().includes(q);
        const matchFilial = item.filial.toLowerCase().includes(q);
        if (!matchName && !matchCpf && !matchEvaluator && !matchFilial) return false;
      }

      return true;
    });
  }, [unifiedReports, filterType, filterFilial, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    if (!selectedReport) return;
    let text = '';

    if (selectedReport.type === 'BIOPSYCHOSOCIAL' && selectedReport.bioItem) {
      const b = selectedReport.bioItem;
      text = `SELENE | TRANSPARANÁ
Cuidando de Quem Conduz
________________________________________
PARECER TÉCNICO DE AVALIAÇÃO BIOPSICOSSOCIAL

IDENTIFICAÇÃO DO AVALIADO
Motorista: ${b.driverName}
CPF: ${b.driverCpf}
Filial / Unidade: ${b.driverFilial}
Data da Avaliação: ${new Date(b.dataAtendimento).toLocaleDateString('pt-BR')}
Avaliador: ${b.avaliador}
Classificação de Risco: ${b.classificacao} (${b.scoreTotal} pontos)

OBJETIVO DA AVALIAÇÃO
${b.objetivo || 'Mapear e analisar os fatores biopsicossociais, condições de trabalho e hábitos de vida do condutor, visando à identificação precoce de indicadores de desgaste ocupacional, sonolência excessiva e fadiga operacional, garantindo a segurança nas operações e o bem-estar do colaborador.'}

PROCEDIMENTO
${b.procedimento || 'A avaliação foi conduzida por meio de entrevista técnica semiestruturada combinada à aplicação do protocolo de rastreio biopsicossocial do SELENE — Transparaná.'}

ANÁLISE
${b.analiseTecnica || 'A análise dos indicadores obtidos durante a avaliação encontra-se consoante com os parâmetros estabelecidos para o acompanhamento preventivo da saúde ocupacional do colaborador. Não foram identificados marcadores de risco imediato que comprometam a prontidão operacional.'}

RECOMENDAÇÕES
${b.recomendacoes || 'Com base nos dados coletados na avaliação biopsicossocial, recomenda-se a manutenção dos hábitos saudáveis observados e a continuidade das ações preventivas de rotina da empresa.'}

________________________________________
${b.avaliador}
Avaliador Responsável
SELENE — Transparaná · Documento emitido eletronicamente`;
    } else if (selectedReport.type === 'CRONOTIPO' && selectedReport.cronoItem) {
      const c = selectedReport.cronoItem;
      text = `SELENE | TRANSPARANÁ
Cuidando de Quem Conduz
________________________________________
PARECER TÉCNICO DE CRONOTIPO (HORNE-ÖSTBERG)

IDENTIFICAÇÃO DO AVALIADO
Motorista: ${c.driverName}
CPF: ${c.driverCpf}
Filial / Unidade: ${c.driverFilial}
Data da Avaliação: ${new Date(c.dataAvaliacao).toLocaleDateString('pt-BR')}
Avaliador: ${c.avaliador}

PERFIL CIRCADIANO MAPEADO
Classificação: ${c.classificacao} (${c.totalScore} pontos)
${c.descricaoPerfil}

OBJETIVO DA AVALIAÇÃO
${c.objetivo || 'Apresentar o mapeamento detalhado da preferência circadiana (cronotipo) do colaborador através do protocolo padronizado Horne-Östberg.'}

PROCEDIMENTO
${c.procedimento || 'Aplicação e mensuração do Questionário de Cronotipo de Horne-Östberg (composto por 19 questões objetivas validadas).'}

ANÁLISE TÉCNICA
${c.analiseTecnica || 'A análise da preferência circadiana constitui uma ferramenta estratégica na prevenção de acidentes e na preservação da saúde ocupacional.'}

RECOMENDAÇÕES
${c.recomendacoes || 'Recomenda-se manter higiene do sono, pausas regulares a cada duas horas de condução e adequação de jornadas aos picos de alerta biológico.'}

________________________________________
${c.avaliador}
Avaliador Responsável
SELENE — Transparaná · Documento emitido eletronicamente`;
    } else if (selectedReport.type === 'FATIGUE' && selectedReport.fatigueItem) {
      const f = selectedReport.fatigueItem;
      text = `SELENE | TRANSPARANÁ
Cuidando de Quem Conduz
________________________________________
RELATÓRIO DE INTERVENÇÃO EM EVENTO DE FADIGA

DADOS DO EVENTO
Código / Evento: ${f.eventoId}
Data: ${f.data}
Motorista: ${f.motorista}
Placa: ${f.placa}

CRONOGRAMA E TEMPOS DE RESPOSTA
Hora do Evento: ${f.horaEvento || '--:--'}
Hora de Chegada CCO: ${f.horaChegada || '--:--'}
Hora da Solicitação: ${f.horaSolicitacao || '--:--'}
Hora da Resposta GR: ${f.horaRespostaGR || '--:--'}
Hora da Parada: ${f.horaParadaMotorista || '--:--'}
Hora da Intervenção: ${f.horaRealizacao || '--:--'}
Tempo Total (Evento -> Intervenção): ${f.diffEventoIntervencao || '--:--'}

STATUS & DESFECHO
Status: ${f.statusRegistro}
${f.motivoNaoRealizacao ? `Motivo da Não Realização: ${f.motivoNaoRealizacao}\n` : ''}Observações: ${f.observacoes || 'Intervenção realizada conforme procedimento padrão operacional de fadiga.'}

SELENE — Transparaná — Centro de Controle Operacional`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Word doc format
  const handleDownloadWord = () => {
    if (!selectedReport) return;

    if (selectedReport.type === 'BIOPSYCHOSOCIAL' && selectedReport.bioItem) {
      const b = selectedReport.bioItem;
      const html = `
        <div class="header">
          <div class="logo">TRANSPARANÁ</div>
          <div class="slogan">SELENE | Cuidando de Quem Conduz</div>
          <p style="font-size: 8pt; color: #64748b; margin-top: 4px;">PROGRAMA DE SAÚDE E PREVENÇÃO DE FADIGA</p>
        </div>

        <h1>PARECER TÉCNICO DE AVALIAÇÃO BIOPSICOSSOCIAL</h1>

        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Motorista:</span> ${b.driverName}</div>
          <div class="meta-item"><span class="meta-label">CPF:</span> ${b.driverCpf}</div>
          <div class="meta-item"><span class="meta-label">Filial / Unidade:</span> ${b.driverFilial}</div>
          <div class="meta-item"><span class="meta-label">Data da Avaliação:</span> ${new Date(b.dataAtendimento).toLocaleDateString('pt-BR')}</div>
          <div class="meta-item"><span class="meta-label">Avaliador:</span> ${b.avaliador}</div>
          <div class="meta-item"><span class="meta-label">Classificação de Risco:</span> <strong>${b.classificacao} (${b.scoreTotal} pontos)</strong></div>
        </div>

        <div class="section-title">Objetivo da Avaliação</div>
        <p>${b.objetivo || 'Mapear e analisar os fatores biopsicossociais, condições de trabalho e hábitos de vida do condutor, visando à identificação precoce de indicadores de desgaste ocupacional, sonolência excessiva e fadiga operacional, garantindo a segurança nas operações e o bem-estar do colaborador.'}</p>

        <div class="section-title">Procedimento</div>
        <p>${b.procedimento || 'A avaliação foi conduzida por meio de entrevista técnica semiestruturada combinada à aplicação do protocolo de rastreio biopsicossocial do SELENE — Transparaná. Foram investigados aspectos pertinentes à rotina de trabalho, qualidade e arquitetura do sono, saúde mental, estilo de vida e percepção de suporte institucional.'}</p>

        <div class="section-title">Análise</div>
        <p>${b.analiseTecnica || 'A análise dos indicadores obtidos durante a avaliação encontra-se consoante com os parâmetros estabelecidos para o acompanhamento preventivo da saúde ocupacional do colaborador. Não foram identificados marcadores de risco imediato que comprometam a prontidão operacional.'}</p>

        <div class="section-title">Recomendações</div>
        <p>${b.recomendacoes || 'Com base nos dados coletados na avaliação biopsicossocial, recomenda-se a manutenção dos hábitos saudáveis observados e a continuidade das ações preventivas de rotina da empresa.'}</p>

        <div class="signature">
          <div class="signature-line"></div>
          <strong>${b.avaliador}</strong><br/>
          <span>Avaliador Responsável</span><br/>
          <span style="font-size: 8.5pt; color: #64748b;">SELENE — Transparaná</span>
        </div>
      `;
      downloadDocFile(`Parecer_Biopsicossocial_${b.driverName.replace(/\s+/g, '_')}`, html);
    } else if (selectedReport.type === 'CRONOTIPO' && selectedReport.cronoItem) {
      const c = selectedReport.cronoItem;
      const html = `
        <div class="header">
          <div class="logo">TRANSPARANÁ</div>
          <div class="slogan">SELENE | Cuidando de Quem Conduz</div>
          <p style="font-size: 8pt; color: #64748b; margin-top: 4px;">PROGRAMA DE SAÚDE E PREVENÇÃO DE FADIGA</p>
        </div>

        <h1>PARECER TÉCNICO DE CRONOTIPO (HORNE-ÖSTBERG)</h1>

        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Motorista:</span> ${c.driverName}</div>
          <div class="meta-item"><span class="meta-label">CPF:</span> ${c.driverCpf}</div>
          <div class="meta-item"><span class="meta-label">Filial / Unidade:</span> ${c.driverFilial}</div>
          <div class="meta-item"><span class="meta-label">Data da Avaliação:</span> ${new Date(c.dataAvaliacao).toLocaleDateString('pt-BR')}</div>
          <div class="meta-item"><span class="meta-label">Avaliador:</span> ${c.avaliador}</div>
          <div class="meta-item"><span class="meta-label">Perfil Circadiano:</span> <strong>${c.classificacao} (${c.totalScore} pontos)</strong></div>
        </div>

        <div class="section-title">Perfil Circadiano Mapeado</div>
        <p><strong>Classificação Encontrada: ${c.classificacao}</strong></p>
        <p>${c.descricaoPerfil}</p>

        <div class="section-title">Objetivo da Avaliação</div>
        <p>${c.objetivo || 'Apresentar o mapeamento detalhado da preferência circadiana (cronotipo) do colaborador através do protocolo padronizado Horne-Östberg.'}</p>

        <div class="section-title">Procedimento</div>
        <p>${c.procedimento || 'Aplicação e mensuração do Questionário de Cronotipo de Horne-Östberg (composto por 19 questões objetivas validadas). Foram avaliados horários preferenciais para despertar, repouso, rendimento físico e desempenho cognitivo.'}</p>

        <div class="section-title">Análise Técnica</div>
        <p>${c.analiseTecnica || 'A análise da preferência circadiana constitui uma ferramenta estratégica na prevenção de acidentes e na preservação da saúde ocupacional, permitindo a gestão adequada dos turnos e pausas de descanso.'}</p>

        <div class="section-title">Recomendações</div>
        <p>${c.recomendacoes || 'Recomenda-se manter higiene do sono, pausas regulares a cada duas horas de condução e adequação de jornadas aos picos de alerta biológico.'}</p>

        <div class="signature">
          <div class="signature-line"></div>
          <strong>${c.avaliador}</strong><br/>
          <span>Avaliador Responsável</span><br/>
          <span style="font-size: 8.5pt; color: #64748b;">SELENE — Transparaná</span>
        </div>
      `;
      downloadDocFile(`Parecer_Cronotipo_${c.driverName.replace(/\s+/g, '_')}`, html);
    } else if (selectedReport.type === 'FATIGUE' && selectedReport.fatigueItem) {
      const f = selectedReport.fatigueItem;
      const html = `
        <div class="header">
          <div class="logo">TRANSPARANÁ</div>
          <div class="slogan">SELENE | Cuidando de Quem Conduz</div>
          <p style="font-size: 8pt; color: #64748b; margin-top: 4px;">CONTROLE OPERACIONAL DE FADIGA</p>
        </div>

        <h1>RELATÓRIO DE INTERVENÇÃO EM EVENTO DE FADIGA</h1>

        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Motorista:</span> ${f.motorista}</div>
          <div class="meta-item"><span class="meta-label">Placa do Cavalo / Veículo:</span> ${f.placa}</div>
          <div class="meta-item"><span class="meta-label">Código do Evento:</span> ${f.eventoId}</div>
          <div class="meta-item"><span class="meta-label">Data:</span> ${f.data}</div>
          <div class="meta-item"><span class="meta-label">Tempo Total de Atendimento:</span> <strong>${f.diffEventoIntervencao || '--:--'}</strong></div>
          <div class="meta-item"><span class="meta-label">Status do Registro:</span> ${f.statusRegistro}</div>
        </div>

        <div class="section-title">Cronologia Operacional e Intervalos</div>
        <p>
          Hora Evento: ${f.horaEvento || '--:--'} | Chegada CCO: ${f.horaChegada || '--:--'} (Dif: ${f.diffEventoChegada || '--:--'})<br/>
          Solicitação: ${f.horaSolicitacao || '--:--'} | Resposta GR: ${f.horaRespostaGR || '--:--'} (Dif: ${f.diffSolicitacaoResposta || '--:--'})<br/>
          Parada: ${f.horaParadaMotorista || '--:--'} | Realização: ${f.horaRealizacao || '--:--'} (Dif: ${f.diffParadaIntervencao || '--:--'})
        </p>

        <div class="section-title">Observações do Atendimento</div>
        <p>${f.observacoes || 'Intervenção realizada de acordo com o plano de ação preventiva de fadiga Transparaná.'}</p>
        ${f.motivoNaoRealizacao ? `<p style="color: #be123c; font-weight: bold; margin-top: 8px;">Motivo da Não Realização / Restrição: ${f.motivoNaoRealizacao}</p>` : ''}
      `;
      downloadDocFile(`Intervencao_Fadiga_${f.motorista.replace(/\s+/g, '_')}_${f.placa}`, html);
    }
  };

  // Direct download for a row from the list
  const handleDownloadRowWord = (item: typeof unifiedReports[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'BIOPSYCHOSOCIAL' && item.rawBio) {
      setSelectedReport({ type: 'BIOPSYCHOSOCIAL', bioItem: item.rawBio });
      setTimeout(() => handleDownloadWord(), 50);
    } else if (item.type === 'CRONOTIPO' && item.rawCrono) {
      setSelectedReport({ type: 'CRONOTIPO', cronoItem: item.rawCrono });
      setTimeout(() => handleDownloadWord(), 50);
    } else if (item.type === 'FATIGUE' && item.rawFatigue) {
      setSelectedReport({ type: 'FATIGUE', fatigueItem: item.rawFatigue });
      setTimeout(() => handleDownloadWord(), 50);
    }
  };

  // ==========================================
  // VIEW 1: DETAILED REPORT PREVIEW
  // ==========================================
  if (selectedReport) {
    const isBio = selectedReport.type === 'BIOPSYCHOSOCIAL' && selectedReport.bioItem;
    const isCrono = selectedReport.type === 'CRONOTIPO' && selectedReport.cronoItem;
    const isFatigue = selectedReport.type === 'FATIGUE' && selectedReport.fatigueItem;

    const currentBio = selectedReport.bioItem;
    const currentCrono = selectedReport.cronoItem;
    const currentFatigue = selectedReport.fatigueItem;

    return (
      <div className="space-y-6">
        {/* Navigation Top Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <button
            onClick={() => setSelectedReport(null)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista de Avaliações
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Copiar texto formatado"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleDownloadWord}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#205857] border border-teal-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Download do documento Word (.doc)"
            >
              <Download className="w-3.5 h-3.5 text-[#00B7B5]" />
              Baixar Word (.doc)
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#205857] hover:bg-[#184443] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 max-w-4xl mx-auto p-8 sm:p-12 print:p-0 print:border-none print:shadow-none font-sans text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#205857]">
            <TransparanaLogo size="md" showSlogan={true} />
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Saúde Ocupacional & Segurança Viária
              </span>
              <span className="text-xs font-semibold text-[#205857]">
                SELENE — Sistema de Gestão e Fadiga
              </span>
            </div>
          </div>

          {/* Document Title */}
          <div className="my-8 text-center">
            <h1 className="text-lg sm:text-xl font-black text-[#205857] uppercase tracking-wide">
              {isBio && 'Parecer Técnico de Avaliação Biopsicossocial'}
              {isCrono && 'Parecer Técnico de Cronotipo (Horne-Östberg)'}
              {isFatigue && 'Relatório Operacional de Intervenção em Fadiga'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Documento Técnico Institucional · Confidencialidade e Sigilo Profissional
            </p>
          </div>

          {/* BIOPSYCHOSOCIAL REPORT BODY */}
          {isBio && currentBio && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Metadata Box */}
              <div className="bg-slate-50 border-l-4 border-[#00B7B5] rounded-r-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Motorista Avaliado:</span>
                  <span className="text-slate-700 font-semibold">{currentBio.driverName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">CPF:</span>
                  <span className="text-slate-700 font-mono">{currentBio.driverCpf}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Filial / Unidade:</span>
                  <span className="text-slate-700">{currentBio.driverFilial}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Data da Avaliação:</span>
                  <span className="text-slate-700">{new Date(currentBio.dataAtendimento).toLocaleDateString('pt-BR')}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Avaliador Responsável:</span>
                  <span className="text-slate-700">{currentBio.avaliador}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Classificação de Risco:</span>
                  <span className="font-bold text-[#205857] uppercase">{currentBio.classificacao} ({currentBio.scoreTotal} pontos)</span>
                </div>
              </div>

              {/* Breakdown Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Trabalho</span>
                  <span className="text-base font-black text-[#205857]">{currentBio.condicoesTrabalhoScore || 0}<span className="text-xs text-slate-400">/14</span></span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Sono & Fadiga</span>
                  <span className="text-base font-black text-[#205857]">{currentBio.sonoScore || 0}<span className="text-xs text-slate-400">/29</span></span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Saúde Mental</span>
                  <span className="text-base font-black text-[#205857]">{currentBio.saudeMentalScore || 0}<span className="text-xs text-slate-400">/20</span></span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Estilo de Vida</span>
                  <span className="text-base font-black text-[#205857]">{currentBio.estiloVidaScore || 0}<span className="text-xs text-slate-400">/16</span></span>
                </div>
              </div>

              {/* Sections */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  1. Objetivo da Avaliação
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentBio.objetivo || 'Mapear e analisar os fatores biopsicossociais, condições de trabalho e hábitos de vida do condutor, visando à identificação precoce de indicadores de desgaste ocupacional, sonolência excessiva e fadiga operacional, garantindo a segurança nas operações e o bem-estar do colaborador.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  2. Procedimento
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentBio.procedimento || 'A avaliação foi conduzida por meio de entrevista técnica semiestruturada combinada à aplicação do protocolo de rastreio biopsicossocial do SELENE — Transparaná. Foram investigados aspectos pertinentes à rotina de trabalho, qualidade e arquitetura do sono, saúde mental, estilo de vida e percepção de suporte institucional.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  3. Análise
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentBio.analiseTecnica || 'A análise dos indicadores obtidos durante a avaliação encontra-se consoante com os parâmetros estabelecidos para o acompanhamento preventivo da saúde ocupacional do colaborador. Não foram identificados marcadores de risco imediato que comprometam a prontidão operacional.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  4. Recomendações
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentBio.recomendacoes || 'Com base nos dados coletados na avaliação biopsicossocial, recomenda-se a manutenção dos hábitos saudáveis observados e a continuidade das ações preventivas de rotina da empresa.'}
                </p>
              </div>
            </div>
          )}

          {/* CRONOTIPO REPORT BODY */}
          {isCrono && currentCrono && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Metadata Box */}
              <div className="bg-slate-50 border-l-4 border-[#00B7B5] rounded-r-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Motorista Avaliado:</span>
                  <span className="text-slate-700 font-semibold">{currentCrono.driverName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">CPF:</span>
                  <span className="text-slate-700 font-mono">{currentCrono.driverCpf}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Filial / Unidade:</span>
                  <span className="text-slate-700">{currentCrono.driverFilial}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Data da Avaliação:</span>
                  <span className="text-slate-700">{new Date(currentCrono.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Avaliador Responsável:</span>
                  <span className="text-slate-700">{currentCrono.avaliador}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Perfil Circadiano:</span>
                  <span className="font-bold text-[#205857] uppercase">{currentCrono.classificacao} ({currentCrono.totalScore} pts)</span>
                </div>
              </div>

              {/* Perfil Circadiano Box */}
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-lg">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1">
                  Perfil Circadiano Mapeado: {currentCrono.classificacao}
                </h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {currentCrono.descricaoPerfil}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  1. Objetivo da Avaliação
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentCrono.objetivo || 'Apresentar o mapeamento detalhado da preferência circadiana (cronotipo) do colaborador através do protocolo padronizado Horne-Östberg, permitindo identificar os horários de maior prontidão biológica e minimizar os efeitos de sonolência e fadiga.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  2. Procedimento
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentCrono.procedimento || 'Aplicação e mensuração do Questionário de Cronotipo de Horne-Östberg (composto por 19 questões objetivas validadas). Foram avaliados horários preferenciais para despertar, repouso, rendimento físico e desempenho cognitivo ao longo das 24 horas.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  3. Análise Técnica
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentCrono.analiseTecnica || 'A análise da preferência circadiana constitui uma ferramenta estratégica na prevenção de acidentes e na preservação da saúde ocupacional, permitindo a gestão adequada dos turnos e pausas de descanso.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  4. Recomendações
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentCrono.recomendacoes || 'Recomenda-se manter higiene do sono, pausas regulares a cada duas horas de condução e adequação de jornadas aos picos de alerta biológico.'}
                </p>
              </div>
            </div>
          )}

          {/* FATIGUE REPORT BODY */}
          {isFatigue && currentFatigue && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Metadata Box */}
              <div className="bg-slate-50 border-l-4 border-[#00B7B5] rounded-r-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Motorista:</span>
                  <span className="text-slate-700 font-semibold">{currentFatigue.motorista}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Placa:</span>
                  <span className="text-slate-700 font-mono font-bold">{currentFatigue.placa}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Código / Evento:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{currentFatigue.eventoId}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Data do Evento:</span>
                  <span className="text-slate-700">{currentFatigue.data}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Tempo Total de Atendimento:</span>
                  <span className="font-bold text-[#205857]">{currentFatigue.diffEventoIntervencao || '--:--'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Status do Registro:</span>
                  <span className="font-bold text-slate-800">{currentFatigue.statusRegistro}</span>
                </div>
              </div>

              {/* Time Intervals Table */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-2 border-b pb-1 border-slate-200">
                  Cronologia dos Horários e Conformidade de SLA
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Evento ➔ Chegada</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentFatigue.diffEventoChegada || '--:--'}</span>
                    <span className="text-[10px] text-slate-500">Meta: ≤ 10 min</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Chegada ➔ Intervenção</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentFatigue.diffChegadaSolicitacao || '--:--'}</span>
                    <span className="text-[10px] text-slate-500">Meta: ≤ 10 min</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Resposta GR</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentFatigue.diffSolicitacaoResposta || '--:--'}</span>
                    <span className="text-[10px] text-slate-500">Meta: 5 a 10 min</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">4. Parada ➔ Intervenção</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentFatigue.diffParadaIntervencao || '--:--'}</span>
                    <span className="text-[10px] text-slate-500">Intervenção Direta</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">5. Solicitação ➔ Intervenção</span>
                    <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentFatigue.diffSolicitacaoIntervencao || '--:--'}</span>
                    <span className="text-[10px] text-slate-500">Meta: 1h30 a 2h00</span>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-xs">
                    <span className="text-[10px] font-bold text-[#205857] uppercase block">6. Tempo Total</span>
                    <span className="text-sm font-black text-[#205857] block mt-0.5">{currentFatigue.diffEventoIntervencao || '--:--'}</span>
                    <span className="text-[10px] text-teal-700 font-semibold">Meta: 1h30 a 2h00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#205857] mb-1.5 border-b pb-1 border-slate-200">
                  Observações e Parecer Operacional
                </h3>
                <p className="text-slate-600 text-justify">
                  {currentFatigue.observacoes || 'Intervenção conduzida conforme protocolo de segurança viária. Motorista orientado a cumprir o tempo de descanso e hidratação.'}
                </p>
                {currentFatigue.motivoNaoRealizacao && (
                  <p className="text-rose-700 font-semibold mt-2">
                    Motivo de Não Realização / Restrição: {currentFatigue.motivoNaoRealizacao}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formal Technical Signature Block (Only for Biopsychosocial and Cronotipo; Fatigue Interventions do not require signature) */}
          {!isFatigue && (
            <div className="mt-14 pt-8 border-t border-slate-200 text-center">
              <div className="w-56 border-t border-slate-600 mx-auto mb-2"></div>
              <p className="font-bold text-xs text-slate-900">
                {isBio ? currentBio?.avaliador : currentCrono?.avaliador}
              </p>
              <p className="text-[11px] text-slate-500">
                Avaliador Responsável
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                SELENE — Transparaná Transportes · Documento emitido eletronicamente
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNIFIED LIST OF EVALUATIONS & REPORTS
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#205857]" />
            <h2 className="text-xl font-bold text-[#205857]">Central de Relatórios & Pareceres Técnicos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consulte todas as avaliações biopsicossociais, laudos de cronotipo e registros de intervenção de fadiga emitidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">Total de Pareceres</span>
            <span className="text-lg font-black text-[#205857]">{unifiedReports.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome do motorista, CPF, placa ou avaliador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent outline-hidden bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Filial Select */}
          <div className="flex items-center gap-2 shrink-0">
            <Building2 className="w-4 h-4 text-slate-400" />
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
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrar por:
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'ALL'
                ? 'bg-[#205857] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({unifiedReports.length})
          </button>

          <button
            onClick={() => setFilterType('BIOPSYCHOSOCIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'BIOPSYCHOSOCIAL'
                ? 'bg-[#205857] text-white shadow-2xs'
                : 'bg-teal-50 text-[#205857] hover:bg-teal-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#00B7B5]" />
            Biopsicossocial ({biopsychosocialList.length})
          </button>

          <button
            onClick={() => setFilterType('CRONOTIPO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'CRONOTIPO'
                ? 'bg-[#205857] text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Cronotipo Horne-Östberg ({cronotipoList.length})
          </button>

          <button
            onClick={() => setFilterType('FATIGUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'FATIGUE'
                ? 'bg-[#205857] text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Intervenções de Fadiga ({fatigueList.length})
          </button>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">Nenhum parecer ou relatório encontrado</p>
            <p className="text-xs text-slate-400">
              Tente alterar os termos de busca ou selecione outro tipo de avaliação nos filtros acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Tipo de Avaliação</th>
                  <th className="py-3 px-4">Motorista / Documento</th>
                  <th className="py-3 px-4">Filial Oficial</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Avaliador Responsável</th>
                  <th className="py-3 px-4">Resultado / Parecer</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (item.type === 'BIOPSYCHOSOCIAL') {
                          setSelectedReport({ type: 'BIOPSYCHOSOCIAL', bioItem: item.rawBio });
                        } else if (item.type === 'CRONOTIPO') {
                          setSelectedReport({ type: 'CRONOTIPO', cronoItem: item.rawCrono });
                        } else {
                          setSelectedReport({ type: 'FATIGUE', fatigueItem: item.rawFatigue });
                        }
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Tipo */}
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {item.type === 'BIOPSYCHOSOCIAL' && (
                            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-[#205857] border border-teal-200 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#00B7B5]" />
                              Biopsicossocial
                            </span>
                          )}
                          {item.type === 'CRONOTIPO' && (
                            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              Cronotipo
                            </span>
                          )}
                          {item.type === 'FATIGUE' && (
                            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Fadiga
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Motorista & CPF */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block group-hover:text-[#205857] transition-colors">
                          {item.driverName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.driverCpf}
                        </span>
                      </td>

                      {/* Filial */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.filial}
                      </td>

                      {/* Data */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Avaliador */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.evaluator}
                      </td>

                      {/* Resultado */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${item.resultBadge.color}`}>
                          {item.resultBadge.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'BIOPSYCHOSOCIAL') {
                              setSelectedReport({ type: 'BIOPSYCHOSOCIAL', bioItem: item.rawBio });
                            } else if (item.type === 'CRONOTIPO') {
                              setSelectedReport({ type: 'CRONOTIPO', cronoItem: item.rawCrono });
                            } else {
                              setSelectedReport({ type: 'FATIGUE', fatigueItem: item.rawFatigue });
                            }
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-md transition-colors text-[11px] inline-flex items-center gap-1 shadow-2xs"
                          title="Visualizar Parecer na Íntegra"
                        >
                          <Eye className="w-3 h-3 text-[#00B7B5]" />
                          Visualizar
                        </button>

                        <button
                          onClick={(e) => handleDownloadRowWord(item, e)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#205857] border border-teal-200 font-bold rounded-md transition-colors text-[11px] inline-flex items-center gap-1 shadow-2xs"
                          title="Baixar em formato Word (.doc)"
                        >
                          <Download className="w-3 h-3 text-[#00B7B5]" />
                          Word (.doc)
                        </button>
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
  );
};
