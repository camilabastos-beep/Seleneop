import { User, Driver, BiopsychosocialEvaluation, CronotipoEvaluation, FatigueIntervention, AuditLog, UserRole, UserPermissions } from '../types';
import { INITIAL_USERS, INITIAL_DRIVERS, INITIAL_BIOPSYCHOSOCIAL, INITIAL_CRONOTIPO, INITIAL_INTERVENTIONS, INITIAL_AUDIT_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'selene_users_v3',
  CURRENT_USER: 'selene_current_user_v3',
  DRIVERS: 'selene_drivers_v3',
  BIOPSYCHOSOCIAL: 'selene_biopsychosocial_v3',
  CRONOTIPO: 'selene_cronotipo_v3',
  INTERVENTIONS: 'selene_interventions_v3',
  AUDIT_LOGS: 'selene_audit_logs_v3',
  ROLE_PERMISSIONS: 'selene_role_permissions_v3',
  GOOGLE_SHEET_URL: 'selene_google_sheet_url_v3'
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  ADMIN: {
    canViewDashboard: true,
    canViewDrivers: true,
    canEditDrivers: true,
    canViewBiopsychosocial: true,
    canCreateBiopsychosocial: true,
    canViewCronotipo: true,
    canCreateCronotipo: true,
    canViewInterventions: true,
    canCreateInterventions: true,
    canViewReports: true,
    canExportReports: true,
    canViewClinicalDetails: true,
    canViewEmotionalDetails: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
  PSICOLOGO: {
    canViewDashboard: true,
    canViewDrivers: true,
    canEditDrivers: true,
    canViewBiopsychosocial: true,
    canCreateBiopsychosocial: true,
    canViewCronotipo: true,
    canCreateCronotipo: true,
    canViewInterventions: true,
    canCreateInterventions: true,
    canViewReports: true,
    canExportReports: true,
    canViewClinicalDetails: true, // Acesso completo às informações necessárias para avaliação e acompanhamento psicológico
    canViewEmotionalDetails: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  GESTOR: {
    canViewDashboard: true,
    canViewDrivers: true,
    canEditDrivers: false,
    canViewBiopsychosocial: true, // Visualiza apenas resumo gerencial / classificação
    canCreateBiopsychosocial: false,
    canViewCronotipo: true,
    canCreateCronotipo: false,
    canViewInterventions: true,
    canCreateInterventions: true,
    canViewReports: true,
    canExportReports: true,
    canViewClinicalDetails: false, // CONFIDENCIALIDADE: Não visualiza respostas individuais e observações clínicas
    canViewEmotionalDetails: false, // Não visualiza eventos emocionais e relatos de saúde mental
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  CONSULTA: {
    canViewDashboard: true,
    canViewDrivers: true,
    canEditDrivers: false,
    canViewBiopsychosocial: true, // Resumido
    canCreateBiopsychosocial: false,
    canViewCronotipo: true,
    canCreateCronotipo: false,
    canViewInterventions: true,
    canCreateInterventions: false,
    canViewReports: true,
    canExportReports: false,
    canViewClinicalDetails: false, // Restrito
    canViewEmotionalDetails: false, // Restrito
    canManageUsers: false,
    canViewAuditLogs: false,
  }
};

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1MUi4zWzRpANNpGvK6fGY9p-9V4yWIHNuO21WCkAiF1U/edit?usp=sharing';

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving localStorage key', key, e);
  }
}

// Initialize storage with defaults if not present
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    setStoredData(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default to Camila Bastos (Admin)
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    setStoredData(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BIOPSYCHOSOCIAL)) {
    setStoredData(STORAGE_KEYS.BIOPSYCHOSOCIAL, INITIAL_BIOPSYCHOSOCIAL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CRONOTIPO)) {
    setStoredData(STORAGE_KEYS.CRONOTIPO, INITIAL_CRONOTIPO);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTERVENTIONS)) {
    setStoredData(STORAGE_KEYS.INTERVENTIONS, INITIAL_INTERVENTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    setStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS)) {
    setStoredData(STORAGE_KEYS.ROLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL)) {
    setStoredData(STORAGE_KEYS.GOOGLE_SHEET_URL, DEFAULT_SHEET_URL);
  }
}

// User & Auth Management
export function getCurrentUser(): User {
  return getStoredData<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
}

export function setCurrentUser(user: User): void {
  setStoredData(STORAGE_KEYS.CURRENT_USER, user);
  logAuditEvent({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN',
    resource: 'SISTEMA',
    details: `Sessão alternada para usuário ${user.name} (${user.role}).`
  });
}

export const setCurrentUserSession = setCurrentUser;

export function logAction(
  userId: string,
  userName: string,
  userRole: UserRole,
  action: AuditLog['action'],
  resource: AuditLog['resource'],
  targetId?: string,
  details?: string
): void {
  logAuditEvent({
    userId,
    userName,
    userRole,
    action,
    resource,
    targetId,
    details: details || `Ação ${action} em ${resource}`
  });
}

export function getUsers(): User[] {
  return getStoredData<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setStoredData(STORAGE_KEYS.USERS, users);
  
  // If editing the active user, update currentUser
  const currentUser = getCurrentUser();
  if (currentUser.id === user.id) {
    setStoredData(STORAGE_KEYS.CURRENT_USER, user);
  }
}

export function updateUserPassword(userId: string, newPass: string): boolean {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  user.password = newPass;
  saveUser(user);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'PASSWORD_CHANGE',
    resource: 'USUARIO',
    details: `Senha atualizada com sucesso para o usuário ${user.name}.`,
    targetId: user.id,
    targetName: user.name
  });
  return true;
}

export function getRolePermissions(): Record<UserRole, UserPermissions> {
  return getStoredData<Record<UserRole, UserPermissions>>(STORAGE_KEYS.ROLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS);
}

export function saveRolePermissions(permissions: Record<UserRole, UserPermissions>): void {
  setStoredData(STORAGE_KEYS.ROLE_PERMISSIONS, permissions);
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'UPDATE',
    resource: 'SISTEMA',
    details: 'Matriz de permissões e perfis de acesso foi reconfigurada pelo Administrador.'
  });
}

export function getEffectivePermissions(user: User): UserPermissions {
  const rolePerms = getRolePermissions()[user.role] || DEFAULT_ROLE_PERMISSIONS[user.role];
  if (user.customPermissions) {
    return { ...rolePerms, ...user.customPermissions };
  }
  return rolePerms;
}

// Audit Logging
export function logAuditEvent(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = getStoredData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  const newLog: AuditLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  // Keep max 500 logs
  if (logs.length > 500) logs.pop();
  setStoredData(STORAGE_KEYS.AUDIT_LOGS, logs);
}

export function getAuditLogs(): AuditLog[] {
  return getStoredData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

// Drivers
export function getDrivers(): Driver[] {
  return getStoredData<Driver[]>(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
}

export function saveDriver(driver: Driver): void {
  const drivers = getDrivers();
  const index = drivers.findIndex(d => d.id === driver.id);
  const isNew = index < 0;
  if (!isNew) {
    drivers[index] = driver;
  } else {
    drivers.unshift(driver);
  }
  setStoredData(STORAGE_KEYS.DRIVERS, drivers);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: isNew ? 'CREATE' : 'UPDATE',
    resource: 'MOTORISTA',
    details: `${isNew ? 'Cadastrou novo motorista' : 'Atualizou dados do motorista'}: ${driver.name} (Placa: ${driver.plate || 'N/A'}).`,
    targetId: driver.id,
    targetName: driver.name
  });
}

export function deleteDriver(id: string): void {
  const drivers = getDrivers();
  const target = drivers.find(d => d.id === id);
  const filtered = drivers.filter(d => d.id !== id);
  setStoredData(STORAGE_KEYS.DRIVERS, filtered);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'DELETE',
    resource: 'MOTORISTA',
    details: `Excluiu motorista ${target?.name || id} da base de dados.`,
    targetId: id,
    targetName: target?.name
  });
}

// Biopsychosocial Evaluations
export function getBiopsychosocialEvaluations(): BiopsychosocialEvaluation[] {
  return getStoredData<BiopsychosocialEvaluation[]>(STORAGE_KEYS.BIOPSYCHOSOCIAL, INITIAL_BIOPSYCHOSOCIAL);
}

export function saveBiopsychosocialEvaluation(evalData: BiopsychosocialEvaluation): void {
  const evals = getBiopsychosocialEvaluations();
  const index = evals.findIndex(e => e.id === evalData.id);
  const isNew = index < 0;
  if (!isNew) {
    evals[index] = evalData;
  } else {
    evals.unshift(evalData);
  }
  setStoredData(STORAGE_KEYS.BIOPSYCHOSOCIAL, evals);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: isNew ? 'CREATE' : 'UPDATE',
    resource: 'BIOPSICOSSOCIAL',
    details: `Registrou avaliação Biopsicossocial para ${evalData.driverName} (Classificação: ${evalData.classificacao}, Escore: ${evalData.scoreTotal}/79).`,
    targetId: evalData.id,
    targetName: evalData.driverName
  });
}

export function deleteBiopsychosocialEvaluation(id: string): void {
  const evals = getBiopsychosocialEvaluations();
  const target = evals.find(e => e.id === id);
  const filtered = evals.filter(e => e.id !== id);
  setStoredData(STORAGE_KEYS.BIOPSYCHOSOCIAL, filtered);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'DELETE',
    resource: 'BIOPSICOSSOCIAL',
    details: `Removeu avaliação biopsicossocial do motorista ${target?.driverName || id}.`,
    targetId: id,
    targetName: target?.driverName
  });
}

// Cronotipo Evaluations
export function getCronotipoEvaluations(): CronotipoEvaluation[] {
  return getStoredData<CronotipoEvaluation[]>(STORAGE_KEYS.CRONOTIPO, INITIAL_CRONOTIPO);
}

export function saveCronotipoEvaluation(evalData: CronotipoEvaluation): void {
  const evals = getCronotipoEvaluations();
  const index = evals.findIndex(e => e.id === evalData.id);
  const isNew = index < 0;
  if (!isNew) {
    evals[index] = evalData;
  } else {
    evals.unshift(evalData);
  }
  setStoredData(STORAGE_KEYS.CRONOTIPO, evals);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: isNew ? 'CREATE' : 'UPDATE',
    resource: 'CRONOTIPO',
    details: `Registrou avaliação de Cronotipo Horne-Östberg para ${evalData.driverName} (Classificação: ${evalData.classificacao}, Escore: ${evalData.totalScore}/86).`,
    targetId: evalData.id,
    targetName: evalData.driverName
  });
}

export function deleteCronotipoEvaluation(id: string): void {
  const evals = getCronotipoEvaluations();
  const target = evals.find(e => e.id === id);
  const filtered = evals.filter(e => e.id !== id);
  setStoredData(STORAGE_KEYS.CRONOTIPO, filtered);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'DELETE',
    resource: 'CRONOTIPO',
    details: `Removeu avaliação de cronotipo do motorista ${target?.driverName || id}.`,
    targetId: id,
    targetName: target?.driverName
  });
}

// Fatigue Interventions
export function getFatigueInterventions(): FatigueIntervention[] {
  return getStoredData<FatigueIntervention[]>(STORAGE_KEYS.INTERVENTIONS, INITIAL_INTERVENTIONS);
}

export function saveFatigueIntervention(item: FatigueIntervention): void {
  const list = getFatigueInterventions();
  const index = list.findIndex(i => i.id === item.id);
  const isNew = index < 0;
  if (!isNew) {
    list[index] = item;
  } else {
    list.unshift(item);
  }
  setStoredData(STORAGE_KEYS.INTERVENTIONS, list);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: isNew ? 'CREATE' : 'UPDATE',
    resource: 'INTERVENCAO_FADIGA',
    details: `Registrou evento de fadiga #${item.eventoId || item.id} para motorista ${item.motorista} (Placa: ${item.placa}). Tempo Total: ${item.diffEventoIntervencao || '00:00'}.`,
    targetId: item.id,
    targetName: item.motorista
  });
}

export function deleteFatigueIntervention(id: string): void {
  const list = getFatigueInterventions();
  const target = list.find(i => i.id === id);
  const filtered = list.filter(i => i.id !== id);
  setStoredData(STORAGE_KEYS.INTERVENTIONS, filtered);
  
  const currentUser = getCurrentUser();
  logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'DELETE',
    resource: 'INTERVENCAO_FADIGA',
    details: `Excluiu registro de intervenção de fadiga #${target?.eventoId || id}.`,
    targetId: id,
    targetName: target?.motorista
  });
}

export function importInterventionsFromCSV(csvText: string): { success: number; failed: number } {
  try {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return { success: 0, failed: 0 };
    
    let success = 0;
    let failed = 0;
    const currentList = getFatigueInterventions();
    const newItems: FatigueIntervention[] = [];

    // Parse header to dynamically map columns
    const headers = lines[0].split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const findIdx = (keywords: string[]) => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const colData = findIdx(['data']);
    const colId = findIdx(['id', 'evento']);
    const colPlaca = findIdx(['placa']);
    const colMotorista = findIdx(['motorista', 'condutor', 'nome']);
    const colHoraEv = findIdx(['hora evento', 'hora do evento']);
    const colHoraCheg = findIdx(['hora chegada', 'hora da chegada']);
    const colHoraSol = findIdx(['hora solic', 'hora da solic']);
    const colHoraResp = findIdx(['hora resp', 'hora da resp']);
    const colHoraPar = findIdx(['hora parada', 'hora da parada']);
    const colHoraReal = findIdx(['hora real', 'hora da real', 'hora interv']);

    const colEvCheg = findIdx(['evento e chegada', 'ev → cheg', 'evento_chegada']);
    const colChegSol = findIdx(['chegada e solicit', 'cheg → sol', 'chegada_solicitacao']);
    const colSolResp = findIdx(['solicitação e resp', 'solicitacao e resp', 'sol → resp']);
    const colParInt = findIdx(['parada e interv', 'par → int', 'parada_intervencao']);
    const colSolInt = findIdx(['solicitação e interv', 'solicitacao e interv', 'sol → int']);
    const colEvInt = findIdx(['evento e interv', 'tempo total', 'total geral']);
    const colMotivo = findIdx(['motivo']);
    const colStatus = findIdx(['status']);
    const colObs = findIdx(['obs']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // handle CSV quotes, commas, semicolons or tabs
      const cols = (line.match(/(".*?"|[^",;\t]+)(?=\s*[,;\t]|\s*$)/g) || line.split(/[,;\t]/))
        .map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length < 3) {
        failed++;
        continue;
      }

      const data = colData >= 0 ? cols[colData] : cols[0];
      const id = colId >= 0 ? cols[colId] : cols[1];
      const placa = colPlaca >= 0 ? cols[colPlaca] : cols[2];
      const motorista = colMotorista >= 0 ? cols[colMotorista] : cols[3];

      if (!motorista && !placa && !id) {
        continue;
      }

      const horaEvento = colHoraEv >= 0 && cols[colHoraEv] ? cols[colHoraEv] : '08:00';
      const horaChegada = colHoraCheg >= 0 && cols[colHoraCheg] ? cols[colHoraCheg] : '08:05';
      const horaSolicitacao = colHoraSol >= 0 && cols[colHoraSol] ? cols[colHoraSol] : '08:15';
      const horaRespostaGR = colHoraResp >= 0 && cols[colHoraResp] ? cols[colHoraResp] : '08:20';
      const horaParadaMotorista = colHoraPar >= 0 && cols[colHoraPar] ? cols[colHoraPar] : '08:35';
      const horaRealizacao = colHoraReal >= 0 && cols[colHoraReal] ? cols[colHoraReal] : '08:50';

      const calcDiff = (tA: string, tB: string) => {
        if (!tA || !tB || !tA.includes(':') || !tB.includes(':')) return '00:00';
        const [hA, mA] = tA.split(':').map(Number);
        const [hB, mB] = tB.split(':').map(Number);
        if (isNaN(hA) || isNaN(mA) || isNaN(hB) || isNaN(mB)) return '00:00';
        let minsA = hA * 60 + mA;
        let minsB = hB * 60 + mB;
        if (minsB < minsA) minsB += 24 * 60;
        const diff = minsB - minsA;
        return `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}`;
      };

      const diffEventoChegada = (colEvCheg >= 0 && cols[colEvCheg]) || calcDiff(horaEvento, horaChegada);
      const diffChegadaSolicitacao = (colChegSol >= 0 && cols[colChegSol]) || calcDiff(horaChegada, horaSolicitacao);
      const diffSolicitacaoResposta = (colSolResp >= 0 && cols[colSolResp]) || calcDiff(horaSolicitacao, horaRespostaGR);
      const diffParadaIntervencao = (colParInt >= 0 && cols[colParInt]) || calcDiff(horaParadaMotorista, horaRealizacao);
      const diffSolicitacaoIntervencao = (colSolInt >= 0 && cols[colSolInt]) || calcDiff(horaSolicitacao, horaRealizacao);
      const diffEventoIntervencao = (colEvInt >= 0 && cols[colEvInt]) || calcDiff(horaEvento, horaRealizacao);

      const motivoNaoRealizacao = colMotivo >= 0 ? cols[colMotivo] : '';
      const statusRegistro = (colStatus >= 0 && cols[colStatus]) || (motivoNaoRealizacao ? 'ENCERRADA' : 'SIM');
      const observacoes = colObs >= 0 ? cols[colObs] : 'Importado via planilha consolidada.';

      const intervention: FatigueIntervention = {
        id: `csv-int-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
        eventoId: id || `EVT-${Date.now().toString().slice(-6)}`,
        data: data || new Date().toLocaleDateString('pt-BR'),
        placa: (placa || 'N/A').toUpperCase(),
        motorista: (motorista || 'Motorista Não Identificado').toUpperCase(),
        horaEvento,
        horaChegada,
        horaSolicitacao,
        horaRespostaGR,
        horaParadaMotorista,
        horaRealizacao,
        diffEventoChegada,
        diffChegadaSolicitacao,
        diffSolicitacaoResposta,
        diffParadaIntervencao,
        diffSolicitacaoIntervencao,
        diffEventoIntervencao,
        motivoNaoRealizacao,
        statusRegistro,
        observacoes,
        createdAt: new Date().toISOString()
      };

      newItems.push(intervention);
      success++;
    }

    if (newItems.length > 0) {
      setStoredData(STORAGE_KEYS.INTERVENTIONS, [...newItems, ...currentList]);
      const currentUser = getCurrentUser();
      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'CREATE',
        resource: 'INTERVENCAO_FADIGA',
        details: `Importação em massa de planilha: ${success} eventos de fadiga inseridos com sucesso.`
      });
    }

    return { success, failed };
  } catch (e) {
    console.error('Failed to import CSV', e);
    return { success: 0, failed: 1 };
  }
}

export function exportInterventionsToCSV(items: FatigueIntervention[]): string {
  const headers = [
    'Data',
    'ID Evento',
    'Placa',
    'Motorista',
    'Hora Evento',
    'Hora Chegada',
    'Hora Solicitação',
    'Hora Resposta',
    'Hora Parada',
    'Hora Realização',
    'Evento e chegada (Calculado)',
    'Chegada e solicitação (Calculado)',
    'Solicitação e resposta (Calculado)',
    'Parada e intervenção (Calculado)',
    'Solicitação e intervenção (Calculado)',
    'Evento e intervenção (Tempo Total)',
    'Motivo para não realização',
    'Status Registro',
    'Observações'
  ];

  const rows = items.map(item => [
    `"${item.data || ''}"`,
    `"${item.eventoId || ''}"`,
    `"${item.placa || ''}"`,
    `"${item.motorista || ''}"`,
    `"${item.horaEvento || ''}"`,
    `"${item.horaChegada || ''}"`,
    `"${item.horaSolicitacao || ''}"`,
    `"${item.horaRespostaGR || ''}"`,
    `"${item.horaParadaMotorista || ''}"`,
    `"${item.horaRealizacao || ''}"`,
    `"${item.diffEventoChegada || '00:00'}"`,
    `"${item.diffChegadaSolicitacao || '00:00'}"`,
    `"${item.diffSolicitacaoResposta || '00:00'}"`,
    `"${item.diffParadaIntervencao || '00:00'}"`,
    `"${item.diffSolicitacaoIntervencao || '00:00'}"`,
    `"${item.diffEventoIntervencao || '00:00'}"`,
    `"${item.motivoNaoRealizacao || ''}"`,
    `"${item.statusRegistro || 'SIM'}"`,
    `"${(item.observacoes || '').replace(/"/g, '""')}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

// Drivers Bulk Import and Export
export function exportDriversToCSV(drivers: Driver[]): string {
  const headers = [
    'Nome',
    'CPF',
    'Filial',
    'Placa',
    'Telefone',
    'Email',
    'Status',
    'Turno Preferencial',
    'Nível de Risco',
    'Data Admissão',
    'Observações'
  ];

  const rows = drivers.map(d => [
    `"${d.name || ''}"`,
    `"${d.cpf || ''}"`,
    `"${d.filial || 'Matriz'}"`,
    `"${d.plate || ''}"`,
    `"${d.phone || ''}"`,
    `"${d.email || ''}"`,
    `"${d.status || 'ATIVO'}"`,
    `"${d.preferredShift || 'DIURNO'}"`,
    `"${d.riskLevel || 'BAIXO'}"`,
    `"${d.admissionDate || ''}"`,
    `"${(d.notes || '').replace(/"/g, '""')}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

export function importDriversFromCSV(csvText: string): { success: number; failed: number } {
  try {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;
    const currentList = getDrivers();
    const newItems: Driver[] = [];

    const headers = lines[0].split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const findIdx = (keywords: string[]) => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const colNome = findIdx(['nome', 'motorista', 'condutor']);
    const colCpf = findIdx(['cpf', 'documento']);
    const colFilial = findIdx(['filial', 'unidade']);
    const colPlaca = findIdx(['placa', 'veiculo']);
    const colTelefone = findIdx(['telefone', 'celular', 'fone', 'tel']);
    const colEmail = findIdx(['email', 'e-mail']);
    const colStatus = findIdx(['status', 'situacao']);
    const colTurno = findIdx(['turno', 'escala']);
    const colRisco = findIdx(['risco', 'nivel']);
    const colAdmissao = findIdx(['admissao', 'data admissao', 'data']);
    const colObs = findIdx(['obs', 'notas', 'observacao']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = (line.match(/(".*?"|[^",;\t]+)(?=\s*[,;\t]|\s*$)/g) || line.split(/[,;\t]/))
        .map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length < 2) {
        failed++;
        continue;
      }

      const name = colNome >= 0 ? cols[colNome] : cols[0];
      const cpf = colCpf >= 0 ? cols[colCpf] : cols[1];

      if (!name || !cpf) {
        failed++;
        continue;
      }

      const filial = colFilial >= 0 && cols[colFilial] ? cols[colFilial] : 'Matriz';
      const plate = colPlaca >= 0 && cols[colPlaca] ? cols[colPlaca].toUpperCase() : '';
      const phone = colTelefone >= 0 ? cols[colTelefone] : '';
      const email = colEmail >= 0 ? cols[colEmail] : '';
      const status = (colStatus >= 0 && cols[colStatus]) ? (cols[colStatus].toUpperCase() as any) : 'ATIVO';
      const preferredShift = (colTurno >= 0 && cols[colTurno]) ? (cols[colTurno].toUpperCase() as any) : 'DIURNO';
      const riskLevel = (colRisco >= 0 && cols[colRisco]) ? (cols[colRisco].toUpperCase() as any) : 'BAIXO';
      const admissionDate = colAdmissao >= 0 && cols[colAdmissao] ? cols[colAdmissao] : new Date().toISOString().slice(0, 10);
      const notes = colObs >= 0 ? cols[colObs] : '';

      // Check if driver already exists by CPF
      const existingIdx = currentList.findIndex(d => d.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''));
      if (existingIdx >= 0) {
        currentList[existingIdx] = {
          ...currentList[existingIdx],
          name: name.toUpperCase(),
          filial,
          plate: plate || currentList[existingIdx].plate,
          phone: phone || currentList[existingIdx].phone,
          status,
          preferredShift,
          riskLevel,
          notes: notes || currentList[existingIdx].notes
        };
      } else {
        newItems.push({
          id: `drv-import-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name: name.toUpperCase(),
          cpf: cpf.trim(),
          filial,
          plate,
          phone,
          email,
          status: status === 'AFASTADO' || status === 'FERIAS' || status === 'DESLIGADO' ? status : 'ATIVO',
          preferredShift: preferredShift === 'NOTURNO' || preferredShift === 'MISTO' ? preferredShift : 'DIURNO',
          riskLevel: riskLevel === 'ALTO' || riskLevel === 'MODERADO' ? riskLevel : 'BAIXO',
          admissionDate,
          notes,
          createdAt: new Date().toISOString()
        });
      }
      success++;
    }

    setStoredData(STORAGE_KEYS.DRIVERS, [...newItems, ...currentList]);

    const currentUser = getCurrentUser();
    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CREATE',
      resource: 'MOTORISTA',
      details: `Importação em massa de motoristas: ${success} motoristas processados com sucesso.`
    });

    return { success, failed };
  } catch (e) {
    console.error('Failed to import drivers CSV', e);
    return { success: 0, failed: 1 };
  }
}

export function clearAllData(): void {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BIOPSYCHOSOCIAL, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CRONOTIPO, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify([]));
}

export function seedDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
  localStorage.setItem(STORAGE_KEYS.BIOPSYCHOSOCIAL, JSON.stringify(INITIAL_BIOPSYCHOSOCIAL));
  localStorage.setItem(STORAGE_KEYS.CRONOTIPO, JSON.stringify(INITIAL_CRONOTIPO));
  localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(INITIAL_INTERVENTIONS));
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
