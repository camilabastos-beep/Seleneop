export type UserRole = 'ADMIN' | 'PSICOLOGO' | 'GESTOR' | 'CONSULTA';

export const OFFICIAL_FILIAIS = ['Matriz', 'Pernambuco', 'Maranhão', 'Mossoró'] as const;
export type OfficialFilial = typeof OFFICIAL_FILIAIS[number];

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewDrivers: boolean;
  canEditDrivers: boolean;
  canViewBiopsychosocial: boolean;
  canCreateBiopsychosocial: boolean;
  canViewCronotipo: boolean;
  canCreateCronotipo: boolean;
  canViewInterventions: boolean;
  canCreateInterventions: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canViewClinicalDetails: boolean; // Confidencialidade: false for GESTOR / CONSULTA
  canViewEmotionalDetails: boolean; // Confidencialidade
  canManageUsers: boolean; // ADMIN only
  canViewAuditLogs: boolean; // ADMIN only
  canCreateEvaluations?: boolean;
  canViewFatigueInterventions?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
  filial?: string;
  customPermissions?: Partial<UserPermissions>;
  createdAt: string;
  lastLogin?: string;
}

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  company?: string;
  filial: string; // Matriz, Pernambuco, Maranhão, Mossoró
  plate?: string; // Não vinculada no cadastro fixo - informada nas intervenções
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  hasChildren?: string;
  education?: string;
  status?: 'ATIVO' | 'AFASTADO' | 'FERIAS' | 'DESLIGADO';
  admissionDate?: string;
  preferredShift?: 'DIURNO' | 'NOTURNO' | 'MISTO';
  riskLevel?: 'BAIXO' | 'MODERADO' | 'ALTO';
  notes?: string;
  createdAt: string;
}

// Biopsychosocial Evaluation Model
export interface BiopsychosocialData {
  // Identification
  avaliador: string;
  dataAtendimento: string;
  driverId: string;
  driverName: string;
  driverCpf: string;
  driverFilial: string;
  driverPlate?: string;
  
  // Step 1: Anamnese Social
  idade?: number;
  estadoCivil?: string;
  filhos?: number;
  escolaridade?: string;
  tempoEmpresaMeses?: number;
  tempoProfissaoAnos?: number;
  resideCom?: string;
  relacionamentoFamilia?: string;
  crencaReligiao?: string;
  provedorFinanceiro?: string;
  relatoAbertoSocial?: string; // Resposta aberta - contexto pessoal e familiar

  // Step 2: Condições de Trabalho (máx. 14)
  turnoHabitual?: string;
  turnoTrabalho?: 'Diurno' | 'Noturno' | 'Misto' | 'Variável';
  rotinaPausas?: string;
  jornadaMediaHoras?: number;
  tipoVeiculo?: string;
  rotasHabituais?: string;
  satisfacaoTrabalho?: string;
  relacionamentoEquipe?: string;
  percepcaoSuporte?: string;
  trabalhoNoturnoFrequente?: boolean;
  pressaoTempoPrazos?: string;
  tempoForaCasa?: 'Volta todo dia' | '2 a 10 dias' | '10 a 20 dias' | 'Mais de 20 dias';
  sobrecarregado?: 'Não' | 'Às vezes' | 'Sim';
  tempoLazer?: 'Sim' | 'Às vezes' | 'Não';
  quaseAcidente?: 'Não' | 'Não sei' | 'Sim';
  quaseAcidenteDescricao?: string;
  relatoAbertoTrabalho?: string; // Resposta aberta - rotinas, queixas e condições de viagem

  // Step 3: Avaliação do Sono (máx. 29)
  horasSonoPorNoite?: number;
  qualidadeSono?: string;
  dificuldadeAdormecer?: string;
  acordaDuranteNoite?: string;
  sensacaoSonoNaoReparador?: string;
  roncaOuEngasga?: string;
  sonolenciaDiurna?: string;
  sonolenciaAoVolante?: string;
  usoMedicamentosSono?: string;
  consumoCfeinaEnergeticos?: string;
  horaDeitar?: string;
  horaAcordar?: string;
  tempoPegarSono?: 'Até 15min' | '16-30min' | '31-60min' | 'Mais de 60min';
  horasSono?: 'Mais de 7h' | '6-7h' | '5-6h' | 'Menos de 5h';
  acordaNoite?: 'Nunca' | 'Raramente' | 'Quase sempre' | 'Sempre';
  pesadelosDores?: 'Não' | 'Às vezes' | 'Sim';
  usoTelas?: 'Não' | 'Às vezes' | 'Sim';
  medicamentoDormir?: 'Não' | 'Sim';
  remedioContinuo?: 'Não' | 'Sim';
  ronco?: 'Não' | 'Sim';
  apneiaPercebida?: 'Não' | 'Não sei' | 'Sim';
  acordaCansado?: 'Nunca' | 'Raramente' | 'Quase sempre' | 'Sempre';
  cochilouDirigindo?: 'Não' | 'Sim';
  preferenciaSonoLivre?: string;
  sentirAoAcordar?: 'Descansado' | 'Cansado' | 'Muito cansado' | 'Confuso/tonto';
  relatoAbertoSono?: string; // Resposta aberta - queixas e padrão de sono na cabine / domicílio

  // Step 4: Saúde Mental (máx. 20)
  nivelEstresse?: string;
  sintomasAnsiedade?: string;
  sintomasDepressivos?: string;
  preocupacoesFinanceiras?: string;
  conflitosFamiliares?: string;
  eventosEstressoresRecentes?: string;
  redeApoioSocial?: string;
  ansiedadeNervosismo?: 'Nunca' | 'Raramente' | 'Quase sempre' | 'Sempre';
  tristezaDesanimo?: 'Não' | 'Sim';
  perdaInteresse?: 'Não' | 'Sim';
  apoioPsicologico?: 'Sim' | 'Não';
  dificuldadeMemoria?: 'Não' | 'Às vezes' | 'Sim';
  concentracaoAtencao?: 'Boa' | 'Normal' | 'Ruim';
  solidaoIsolamento?: 'Não' | 'Às vezes' | 'Sim';
  redeApoio?: 'Muitas' | 'Algumas' | 'Poucas' | 'Não';
  eventoImpacto?: 'Não' | 'Sim';
  eventoImpactoDescricao?: string;
  relatoAbertoSaudeMental?: string; // Resposta aberta - percepções emocionais e estressores

  // Step 5: Estilo de Vida (máx. 16)
  praticaAtividadeFisica?: string;
  padraoAlimentar?: string;
  consumoAguaLitros?: number;
  tabagismo?: string;
  consumoAlcool?: string;
  historicoDoencasCronicas?: string;
  usoMedicamentosContinuos?: string;
  alimentacaoTrabalho?: 'Regular e saudável' | 'Irregular' | 'Pula refeições';
  numeroRefeicoes?: '3+' | '2' | '1 ou menos';
  lanchesDescricao?: string;
  aguaPorDia?: 'Mais de 2L' | '1-2L' | 'Menos de 1L';
  cafeinaXicaras?: '1-2' | '3-5' | '6+';
  horarioCafe?: 'Só de manhã' | 'Manhã e tarde' | 'Até à noite';
  fumante?: 'Não' | 'Sim';
  alcool?: 'Não bebo' | 'Socialmente' | 'Frequentemente';
  atividadeFisica?: 'Sim' | 'Não';
  doencaCronica?: 'Não' | 'Sim';
  doresCronicas?: 'Não' | 'Sim';
  relatoAbertoEstiloVida?: string; // Resposta aberta - hábitos, lazer e bem-estar

  // Observações & Parecer Técnico
  observacoesGerais?: string;
  parecerTecnicoResumido?: string;
  objetivo?: string;
  procedimento?: string;
  analiseTecnica?: string;
  recomendacoes?: string;
  planoAcao?: string;
}

export interface BiopsychosocialScoreResult {
  condicoesTrabalhoScore: number;
  sonoScore: number;
  saudeMentalScore: number;
  estiloVidaScore: number;
  scoreTotal: number; // Max 79
  classificacao: 'Baixo risco' | 'Risco moderado' | 'Risco alto';
  alertasCriticos: string[];
  condutaRecomendada: string;
}

export interface BiopsychosocialEvaluation extends BiopsychosocialData, BiopsychosocialScoreResult {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Horne-Östberg Cronotipo Model
export interface CronotipoAnswers {
  q1: number; // 1-5
  q2: number; // 1-5
  q3: number; // 1-4
  q4: number; // 1-4
  q5: number; // 1-4
  q6: number; // 1-4
  q7: number; // 1-4
  q8: number; // 1-4
  q9: number; // 1-4
  q10: number; // 1-5
  q11: number; // 1, 2, 4, 6
  q12: number; // 0, 2, 3, 5
  q13: number; // 1-4
  q14: number; // 1-4
  q15: number; // 1-4
  q16: number; // 1-4
  q17: number; // 1-5
  q18: number; // 1-5
  q19: number; // 1, 2, 4, 6
}

export type CronotipoClass = 
  | 'Vespertino extremo' 
  | 'Moderadamente Vespertino' 
  | 'Intermediário' 
  | 'Moderadamente Matutino' 
  | 'Matutino extremo';

export interface CronotipoEvaluation {
  id: string;
  driverId: string;
  driverName: string;
  driverCpf: string;
  driverFilial: string;
  driverPlate?: string;
  avaliador: string;
  dataAvaliacao: string;
  answers: CronotipoAnswers;
  totalScore: number; // 16-86
  classificacao: CronotipoClass;
  descricaoPerfil: string;
  objetivo?: string;
  procedimento?: string;
  analiseTecnica?: string;
  recomendacoes?: string;
  observacoes?: string;
  createdAt: string;
}

// Intervenção em Eventos de Fadiga
export interface FatigueIntervention {
  id: string;
  eventoId: string; // ex: 6a5e2e943ae05cd455f478c6 ou #CCO - ...
  data: string; // DD/MM/YYYY
  placa: string;
  motorista: string;
  driverId?: string;
  
  // Timestamps (HH:MM or string from sheet)
  horaEvento: string;
  horaChegada: string;
  horaSolicitacao: string;
  horaRespostaGR: string;
  horaParadaMotorista: string;
  horaRealizacao: string;
  
  // Auto-calculated intervals (HH:MM)
  diffEventoChegada: string;
  diffChegadaSolicitacao: string;
  diffSolicitacaoResposta: string;
  diffParadaIntervencao: string;
  diffSolicitacaoIntervencao: string;
  diffEventoIntervencao: string; // Tempo total
  
  // Non-execution and registration status
  motivoNaoRealizacao?: string; // "Motorista finalizou a jornada", "Sem retorno do motorista", "Sem retorno da empresa", "Motorista em area de sem sinal", "Sem o devido acompanhamento", etc.
  statusRegistro: 'SIM' | 'NÃO' | 'ENCERRADA' | 'PENDENTE' | string;
  observacoes?: string;
  
  // Attachments
  pdfAttachment?: {
    name: string;
    size?: string;
    url?: string;
    uploadedAt: string;
  };
  
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'PASSWORD_CHANGE';
  resource: 'MOTORISTA' | 'BIOPSICOSSOCIAL' | 'CRONOTIPO' | 'INTERVENCAO_FADIGA' | 'PARECER' | 'USUARIO' | 'SISTEMA';
  details: string;
  targetId?: string;
  targetName?: string;
}

export interface SystemStats {
  totalDrivers: number;
  totalEvaluations: number;
  totalCronotipo: number;
  totalInterventions: number;
  riskDistribution: {
    baixo: number;
    moderado: number;
    alto: number;
  };
  cronotipoDistribution: Record<string, number>;
  interventionsSlaExceededCount: number;
  averageInterventionTime: string;
}
