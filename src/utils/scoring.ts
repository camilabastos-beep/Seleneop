import { BiopsychosocialData, BiopsychosocialScoreResult, CronotipoAnswers, CronotipoClass } from '../types';

export function calculateBiopsychosocialScore(data: Partial<BiopsychosocialData>): BiopsychosocialScoreResult {
  // 1. Condições de Trabalho (max 14)
  let condicoesTrabalhoScore = 0;
  
  // Turno
  if (
    data.turnoTrabalho === 'Noturno' || 
    data.turnoTrabalho === 'Misto' || 
    data.turnoTrabalho === 'Variável' ||
    data.turnoHabitual === 'Noturno' ||
    data.turnoHabitual === 'Misto' ||
    data.trabalhoNoturnoFrequente
  ) {
    condicoesTrabalhoScore += 2;
  }
  
  // Tempo fora de casa / Jornada
  if (data.tempoForaCasa === '2 a 10 dias') condicoesTrabalhoScore += 1;
  else if (data.tempoForaCasa === '10 a 20 dias') condicoesTrabalhoScore += 2;
  else if (data.tempoForaCasa === 'Mais de 20 dias') condicoesTrabalhoScore += 3;
  else if (data.jornadaMediaHoras && data.jornadaMediaHoras >= 12) condicoesTrabalhoScore += 3;
  else if (data.jornadaMediaHoras && data.jornadaMediaHoras >= 10) condicoesTrabalhoScore += 2;
  else if (data.jornadaMediaHoras && data.jornadaMediaHoras >= 9) condicoesTrabalhoScore += 1;

  // Pausas
  if (data.rotinaPausas?.includes('Às vezes')) condicoesTrabalhoScore += 1;
  else if (data.rotinaPausas?.includes('Raramente')) condicoesTrabalhoScore += 2;
  
  // Sobrecarregado
  if (data.sobrecarregado === 'Às vezes') condicoesTrabalhoScore += 1;
  else if (data.sobrecarregado === 'Sim') condicoesTrabalhoScore += 2;
  
  // Pressão por prazos / Nível de estresse ocupacional
  if (data.pressaoTempoPrazos?.includes('Moderada')) condicoesTrabalhoScore += 1;
  else if (data.pressaoTempoPrazos?.includes('Alta')) condicoesTrabalhoScore += 3;
  
  // Satisfação / Relacionamento
  if (data.satisfacaoTrabalho?.includes('Regular') || data.satisfacaoTrabalho?.includes('Neutro')) condicoesTrabalhoScore += 1;
  else if (data.satisfacaoTrabalho?.includes('Insatisfeito')) condicoesTrabalhoScore += 2;

  if (data.relacionamentoEquipe?.includes('Regular')) condicoesTrabalhoScore += 1;
  else if (data.relacionamentoEquipe?.includes('Ruim')) condicoesTrabalhoScore += 2;

  // Tempo de lazer
  if (data.tempoLazer === 'Às vezes') condicoesTrabalhoScore += 1;
  else if (data.tempoLazer === 'Não') condicoesTrabalhoScore += 2;
  
  // Quase acidente
  if (data.quaseAcidente === 'Não sei') condicoesTrabalhoScore += 1;
  else if (data.quaseAcidente === 'Sim') condicoesTrabalhoScore += 2;

  // Cap at 14 max
  condicoesTrabalhoScore = Math.min(14, condicoesTrabalhoScore);

  // 2. Avaliação do Sono (max 29)
  let sonoScore = 0;
  
  if (data.tempoPegarSono === '16-30min' || data.dificuldadeAdormecer === 'Às vezes') sonoScore += 1;
  else if (data.tempoPegarSono === '31-60min') sonoScore += 2;
  else if (data.tempoPegarSono === 'Mais de 60min' || data.dificuldadeAdormecer?.includes('Frequentemente')) sonoScore += 3;
  
  if (data.horasSono === '6-7h' || (data.horasSonoPorNoite !== undefined && data.horasSonoPorNoite >= 6 && data.horasSonoPorNoite < 7)) sonoScore += 1;
  else if (data.horasSono === '5-6h' || (data.horasSonoPorNoite !== undefined && data.horasSonoPorNoite >= 5 && data.horasSonoPorNoite < 6)) sonoScore += 2;
  else if (data.horasSono === 'Menos de 5h' || (data.horasSonoPorNoite !== undefined && data.horasSonoPorNoite < 5 && data.horasSonoPorNoite > 0)) sonoScore += 3;
  
  if (data.qualidadeSono?.includes('Regular')) sonoScore += 2;
  else if (data.qualidadeSono?.includes('Ruim')) sonoScore += 4;
  else if (data.qualidadeSono?.includes('Muito ruim') || data.qualidadeSono === 'Péssima') sonoScore += 5;
  
  if (data.acordaNoite === 'Raramente' || data.acordaDuranteNoite === 'Às vezes') sonoScore += 1;
  else if (data.acordaNoite === 'Quase sempre') sonoScore += 2;
  else if (data.acordaNoite === 'Sempre' || data.acordaDuranteNoite?.includes('Frequentemente')) sonoScore += 3;
  
  if (data.sensacaoSonoNaoReparador === 'Às vezes') sonoScore += 2;
  else if (data.sensacaoSonoNaoReparador?.includes('Frequentemente')) sonoScore += 4;

  if (data.pesadelosDores === 'Às vezes' || data.pesadelosDores === 'Sim') sonoScore += 1;
  if (data.usoTelas === 'Às vezes' || data.usoTelas === 'Sim') sonoScore += 1;
  if (data.medicamentoDormir === 'Sim' || data.usoMedicamentosSono?.includes('Sim') || data.usoMedicamentosSono?.includes('Ocasionalmente')) sonoScore += 1;
  if (data.remedioContinuo === 'Sim') sonoScore += 1;
  
  if (data.ronco === 'Sim' || data.roncaOuEngasga === 'Às vezes') sonoScore += 1;
  else if (data.roncaOuEngasga?.includes('Frequentemente') || data.roncaOuEngasga?.includes('Apneia')) sonoScore += 4;
  
  if (data.apneiaPercebida === 'Não sei') sonoScore += 1;
  else if (data.apneiaPercebida === 'Sim') sonoScore += 2;
  
  if (data.acordaCansado === 'Raramente') sonoScore += 1;
  else if (data.acordaCansado === 'Quase sempre') sonoScore += 2;
  else if (data.acordaCansado === 'Sempre') sonoScore += 3;
  
  if (data.sonolenciaDiurna === 'Às vezes' || data.sonolenciaDiurna?.includes('Raramente')) sonoScore += 1;
  else if (data.sonolenciaDiurna?.includes('Frequentemente') || data.sonolenciaDiurna === 'Sim') sonoScore += 3;
  
  if (data.sonolenciaAoVolante === 'Raramente') sonoScore += 1;
  else if (data.sonolenciaAoVolante === 'Às vezes') sonoScore += 3;
  else if (data.sonolenciaAoVolante?.includes('Frequentemente')) sonoScore += 5;

  if (data.cochilouDirigindo === 'Sim') sonoScore += 3;
  
  if (data.sentirAoAcordar === 'Cansado') sonoScore += 1;
  else if (data.sentirAoAcordar === 'Muito cansado' || data.sentirAoAcordar === 'Confuso/tonto') sonoScore += 2;

  if (data.consumoCfeinaEnergeticos?.includes('Alto')) sonoScore += 1;
  else if (data.consumoCfeinaEnergeticos?.includes('Excessivo')) sonoScore += 3;

  // Cap at 29 max
  sonoScore = Math.min(29, sonoScore);

  // 3. Saúde Mental (max 20)
  let saudeMentalScore = 0;
  
  if (data.nivelEstresse?.includes('Moderado') || data.nivelEstresse === 'Baixo') saudeMentalScore += 1;
  else if (data.nivelEstresse?.includes('Alto')) saudeMentalScore += 3;
  else if (data.nivelEstresse?.includes('Muito alto') || data.nivelEstresse?.includes('Esgotamento')) saudeMentalScore += 4;

  if (data.ansiedadeNervosismo === 'Raramente' || data.sintomasAnsiedade === 'Às vezes') saudeMentalScore += 1;
  else if (data.ansiedadeNervosismo === 'Quase sempre' || data.sintomasAnsiedade?.includes('Frequentemente')) saudeMentalScore += 3;
  else if (data.ansiedadeNervosismo === 'Sempre') saudeMentalScore += 3;
  
  if (data.tristezaDesanimo === 'Sim' || data.sintomasDepressivos?.includes('Frequentemente')) saudeMentalScore += 3;
  else if (data.sintomasDepressivos?.includes('Raramente')) saudeMentalScore += 1;

  if (data.perdaInteresse === 'Sim') saudeMentalScore += 2;
  if (data.apoioPsicologico === 'Não') saudeMentalScore += 1; // Invertido: fator de proteção
  
  if (data.preocupacoesFinanceiras?.includes('moderadas')) saudeMentalScore += 1;
  else if (data.preocupacoesFinanceiras?.includes('graves')) saudeMentalScore += 3;

  if (data.conflitosFamiliares?.includes('Sim')) saudeMentalScore += 2;
  if (data.eventosEstressoresRecentes?.includes('Sim')) saudeMentalScore += 2;

  if (data.redeApoioSocial?.includes('Moderada') || data.redeApoio === 'Poucas') saudeMentalScore += 1;
  else if (data.redeApoioSocial?.includes('Fraca') || data.redeApoioSocial?.includes('Isolado') || data.redeApoio === 'Não') saudeMentalScore += 3;

  if (data.dificuldadeMemoria === 'Às vezes') saudeMentalScore += 1;
  else if (data.dificuldadeMemoria === 'Sim') saudeMentalScore += 2;
  
  if (data.concentracaoAtencao === 'Normal') saudeMentalScore += 1;
  else if (data.concentracaoAtencao === 'Ruim') saudeMentalScore += 2;
  
  if (data.solidaoIsolamento === 'Às vezes') saudeMentalScore += 1;
  else if (data.solidaoIsolamento === 'Sim') saudeMentalScore += 2;
  
  if (data.eventoImpacto === 'Sim') saudeMentalScore += 2;

  // Cap at 20 max
  saudeMentalScore = Math.min(20, saudeMentalScore);

  // 4. Estilo de Vida (max 16)
  let estiloVidaScore = 0;
  
  if (data.alimentacaoTrabalho === 'Irregular' || data.padraoAlimentar === 'Regular') estiloVidaScore += 1;
  else if (data.alimentacaoTrabalho === 'Pula refeições' || data.padraoAlimentar?.includes('Inadequado')) estiloVidaScore += 3;
  
  if (data.numeroRefeicoes === '2') estiloVidaScore += 1;
  else if (data.numeroRefeicoes === '1 ou menos') estiloVidaScore += 2;
  
  if (data.aguaPorDia === '1-2L' || (data.consumoAguaLitros !== undefined && data.consumoAguaLitros < 2 && data.consumoAguaLitros >= 1)) estiloVidaScore += 1;
  else if (data.aguaPorDia === 'Menos de 1L' || (data.consumoAguaLitros !== undefined && data.consumoAguaLitros < 1 && data.consumoAguaLitros > 0)) estiloVidaScore += 2;
  
  if (data.cafeinaXicaras === '3-5') estiloVidaScore += 1;
  else if (data.cafeinaXicaras === '6+') estiloVidaScore += 2;
  
  if (data.horarioCafe === 'Manhã e tarde') estiloVidaScore += 1;
  else if (data.horarioCafe === 'Até à noite') estiloVidaScore += 2;
  
  if (data.fumante === 'Sim' || data.tabagismo === 'Fumante diário') estiloVidaScore += 3;
  else if (data.tabagismo === 'Ex-fumante') estiloVidaScore += 1;
  
  if (data.alcool === 'Socialmente' || data.consumoAlcool?.includes('Socialmente')) estiloVidaScore += 1;
  else if (data.alcool === 'Frequentemente' || data.consumoAlcool === 'Frequentemente') estiloVidaScore += 3;
  
  if (data.atividadeFisica === 'Não' || data.praticaAtividadeFisica?.includes('Sedentário')) estiloVidaScore += 3;
  else if (data.praticaAtividadeFisica?.includes('Ocasionalmente')) estiloVidaScore += 1;

  if (data.doencaCronica === 'Sim' || (data.historicoDoencasCronicas && data.historicoDoencasCronicas !== 'Nenhuma')) estiloVidaScore += 1;
  if (data.doresCronicas === 'Sim') estiloVidaScore += 1;
  if (data.usoMedicamentosContinuos && data.usoMedicamentosContinuos !== 'Nenhum') estiloVidaScore += 1;

  // Cap at 16 max
  estiloVidaScore = Math.min(16, estiloVidaScore);

  const scoreTotal = condicoesTrabalhoScore + sonoScore + saudeMentalScore + estiloVidaScore;

  // Classificação
  let classificacao: 'Baixo risco' | 'Risco moderado' | 'Risco alto' = 'Baixo risco';
  if (scoreTotal >= 54) {
    classificacao = 'Risco alto';
  } else if (scoreTotal >= 27) {
    classificacao = 'Risco moderado';
  }

  // Alertas críticos
  const alertasCriticos: string[] = [];
  if (data.cochilouDirigindo === 'Sim' || data.sonolenciaAoVolante?.includes('Frequentemente')) {
    alertasCriticos.push('Relato de sonolência frequente / cochilo na condução');
  }
  if (data.quaseAcidente === 'Sim') {
    alertasCriticos.push('Histórico de incidente/quase-acidente por cansaço');
  }
  if (data.apneiaPercebida === 'Sim' || data.roncaOuEngasga?.includes('Frequentemente') || data.roncaOuEngasga?.includes('Apneia')) {
    alertasCriticos.push('Sinal de apneia ou ronco com paradas respiratórias');
  }
  if (data.horasSono === 'Menos de 5h' || (data.horasSonoPorNoite !== undefined && data.horasSonoPorNoite < 5 && data.horasSonoPorNoite > 0)) {
    alertasCriticos.push('Privação aguda de sono (<5h por noite)');
  }
  if ((data.tristezaDesanimo === 'Sim' && data.perdaInteresse === 'Sim') || data.nivelEstresse?.includes('Esgotamento')) {
    alertasCriticos.push('Sintomas expressivos de esgotamento/estresse severo');
  }

  // Conduta recomendada
  let condutaRecomendada = 'Acompanhamento de rotina. Manter orientações de higiene do sono e autocuidado.';
  if (classificacao === 'Risco alto' || alertasCriticos.length >= 2) {
    condutaRecomendada = 'Acompanhamento prioritário pela equipe de Gestão e Saúde Ocupacional. Avaliação médica complementar para distúrbios do sono e ajuste de jornada.';
  } else if (classificacao === 'Risco moderado' || alertasCriticos.length === 1) {
    condutaRecomendada = 'Acompanhamento preventivo periódico com reforço em higiene do sono, pausas programadas e gerenciamento de estresse.';
  }

  return {
    condicoesTrabalhoScore,
    sonoScore,
    saudeMentalScore,
    estiloVidaScore,
    scoreTotal,
    classificacao,
    alertasCriticos,
    condutaRecomendada
  };
}

export function calculateCronotipoScore(answers: CronotipoAnswers): {
  totalScore: number;
  classificacao: CronotipoClass;
  descricaoPerfil: string;
} {
  const values = Object.values(answers) as number[];
  const totalScore = values.reduce((sum, v) => sum + (Number(v) || 0), 0);

  let classificacao: CronotipoClass = 'Intermediário';
  let descricaoPerfil = '';

  if (totalScore <= 30) {
    classificacao = 'Vespertino extremo';
    descricaoPerfil = 'Apresenta acentuada preferência por horários noturnos para sono e vigília. O pico de prontidão física e cognitiva ocorre tarde no dia. Maior vulnerabilidade em jornadas matutinas precoces.';
  } else if (totalScore <= 41) {
    classificacao = 'Moderadamente Vespertino';
    descricaoPerfil = 'Indica melhor desempenho cognitivo e maior alerta na segunda metade do dia. O despertar precoce tende a ser custoso, com sonolência residual nas primeiras horas, o que exige atenção na alocação em escalas de início muito antecipado.';
  } else if (totalScore <= 58) {
    classificacao = 'Intermediário';
    descricaoPerfil = 'Apresenta boa flexibilidade circadiana e capacidade de adaptação tanto a horários matutinos quanto vespertinos, desde que mantida regularidade no descanso.';
  } else if (totalScore <= 69) {
    classificacao = 'Moderadamente Matutino';
    descricaoPerfil = 'Apresenta maior alerta e rendimento cognitivo nas primeiras horas do dia e durante o turno diurno. O desempenho tende a declinar no período noturno, exigindo atenção em jornadas após 20h.';
  } else {
    classificacao = 'Matutino extremo';
    descricaoPerfil = 'Forte preferência circadiana matutina. Desperta espontaneamente cedo com plena disposição. Elevado risco de sonolência e fadiga em viagens noturnas e madrugadas.';
  }

  return {
    totalScore,
    classificacao,
    descricaoPerfil
  };
}

// Time diff helper: returns formatted "HH:MM" between two times "HH:MM"
export function calculateTimeDiff(timeA?: string, timeB?: string): string {
  if (!timeA || !timeB || !timeA.includes(':') || !timeB.includes(':')) {
    return '00:00';
  }
  
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  
  if (isNaN(hA) || isNaN(mA) || isNaN(hB) || isNaN(mB)) {
    return '00:00';
  }
  
  let minsA = hA * 60 + mA;
  let minsB = hB * 60 + mB;
  
  // If timeB is earlier in the day than timeA, assume cross midnight
  if (minsB < minsA) {
    minsB += 24 * 60;
  }
  
  const diffMins = minsB - minsA;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

export function formatMinutesToHHMM(mins: number): string {
  if (isNaN(mins) || mins < 0) return '00:00';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Check if an SLA is breached with custom benchmarks
export interface SlaEvaluation {
  status: 'OK' | 'WARN' | 'BREACH';
  label: string;
  badgeClass: string;
  targetDescription: string;
  diffMinutes: number;
}

export function evaluateSla(type: 'EVENTO_CHEGADA' | 'CHEGADA_INTERVENCAO' | 'RESPOSTA_GR' | 'SOLICITACAO_INTERVENCAO' | 'EVENTO_INTERVENCAO', timeStr?: string): SlaEvaluation {
  const mins = parseMinutes(timeStr || '00:00');
  
  if (!timeStr || mins === 0) {
    return {
      status: 'OK',
      label: 'Dentro do SLA',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      targetDescription: 'Meta de SLA',
      diffMinutes: 0
    };
  }

  switch (type) {
    case 'EVENTO_CHEGADA':
      // Meta: 10 minutos
      if (mins <= 10) {
        return {
          status: 'OK',
          label: 'Dentro do SLA (≤ 10 min)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetDescription: 'Meta: até 10 minutos',
          diffMinutes: mins
        };
      }
      return {
        status: 'BREACH',
        label: `SLA Estourado (+${mins - 10} min)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        targetDescription: 'Meta: até 10 minutos',
        diffMinutes: mins
      };

    case 'CHEGADA_INTERVENCAO':
      // Meta: 10 minutos
      if (mins <= 10) {
        return {
          status: 'OK',
          label: 'Dentro do SLA (≤ 10 min)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetDescription: 'Meta: até 10 minutos',
          diffMinutes: mins
        };
      }
      return {
        status: 'BREACH',
        label: `SLA Estourado (+${mins - 10} min)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        targetDescription: 'Meta: até 10 minutos',
        diffMinutes: mins
      };

    case 'RESPOSTA_GR':
      // Meta: 5 a 10 minutos
      if (mins <= 10) {
        return {
          status: 'OK',
          label: 'Dentro do SLA (5-10 min)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetDescription: 'Meta: 5 a 10 minutos',
          diffMinutes: mins
        };
      }
      return {
        status: 'BREACH',
        label: `Resposta Tardia (${mins} min)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        targetDescription: 'Meta: 5 a 10 minutos',
        diffMinutes: mins
      };

    case 'SOLICITACAO_INTERVENCAO':
      // Meta: 1h30 a 2h (90 a 120 minutos)
      if (mins <= 90) {
        return {
          status: 'OK',
          label: 'Excelente (≤ 1h30)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetDescription: 'Meta: 1h30 a 2h00',
          diffMinutes: mins
        };
      }
      if (mins <= 120) {
        return {
          status: 'WARN',
          label: 'Tolerância (1h30 - 2h)',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
          targetDescription: 'Meta: 1h30 a 2h00',
          diffMinutes: mins
        };
      }
      return {
        status: 'BREACH',
        label: `Fora do SLA (> 2h)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        targetDescription: 'Meta: 1h30 a 2h00',
        diffMinutes: mins
      };

    case 'EVENTO_INTERVENCAO':
    default:
      // Meta: 1h30 a 2h (90 a 120 minutos)
      if (mins <= 90) {
        return {
          status: 'OK',
          label: 'Conforme (≤ 1h30)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetDescription: 'Meta total: 1h30 a 2h00',
          diffMinutes: mins
        };
      }
      if (mins <= 120) {
        return {
          status: 'WARN',
          label: 'Dentro da Tolerância (1h30 - 2h)',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
          targetDescription: 'Meta total: 1h30 a 2h00',
          diffMinutes: mins
        };
      }
      return {
        status: 'BREACH',
        label: `SLA Total Estourado (> 2h)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        targetDescription: 'Meta total: 1h30 a 2h00',
        diffMinutes: mins
      };
  }
}

// Check if an SLA is breached (defaults to total event > 120 min or response > 10 min)
export function isSlaBreached(timeStr: string, limitMins = 120): boolean {
  const mins = parseMinutes(timeStr);
  return mins > limitMins;
}

// Generate Downloadable Word (.doc HTML format)
export function downloadDocFile(filename: string, contentHtml: string) {
  const fullHtml = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        body { font-family: 'Roboto', Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
        h1 { font-size: 16pt; color: #205857; margin-bottom: 4px; text-transform: uppercase; }
        h2 { font-size: 13pt; color: #00B7B5; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #9F9F9F; padding-bottom: 4px; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #205857; padding-bottom: 15px; }
        .logo { font-size: 18pt; font-weight: bold; color: #205857; }
        .slogan { font-size: 10pt; color: #64748b; margin-top: 2px; }
        .meta-grid { margin: 15px 0; padding: 10px; background-color: #f8fafc; border-left: 3px solid #00B7B5; }
        .meta-item { margin-bottom: 6px; font-size: 10.5pt; }
        .meta-label { font-weight: bold; color: #334155; }
        .section-title { font-weight: bold; font-size: 11pt; color: #205857; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .signature { margin-top: 45px; text-align: center; }
        .signature-line { border-top: 1px solid #334155; width: 260px; margin: 0 auto 6px auto; }
        .footer { margin-top: 30px; text-align: center; font-size: 9pt; color: #94a3b8; }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', fullHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
