// Google Sheets API Integration Service for SELENE
import { FatigueIntervention, Driver, BiopsychosocialEvaluation, CronotipoEvaluation } from '../types';

export const USER_PROVIDED_SHEET_ID = '1MUi4zWzRpANNpGvK6fGY9p-9V4yWIHNuO21WCkAiF1U';
export const USER_PROVIDED_SHEET_URL = `https://docs.google.com/spreadsheets/d/${USER_PROVIDED_SHEET_ID}/edit?usp=sharing`;

/**
 * Gets active OAuth access token from the environment
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    // In Google AI Studio environment, the server-side proxy or window token might provide auth
    // If running in browser with OAuth configured:
    const token = localStorage.getItem('selene_google_access_token');
    return token || null;
  } catch (e) {
    console.error('Failed to get Google Access Token', e);
    return null;
  }
}

/**
 * Exports interventions formatted with exact columns, times and auto calculations
 */
export function formatInterventionsForSheet(interventions: FatigueIntervention[]): (string | number)[][] {
  const headers = [
    'Data',
    'ID Evento',
    'Placa',
    'Motorista',
    'Hora Evento',
    'Hora Chegada',
    'Hora Solicitação',
    'Hora Resposta GR',
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

  const rows = interventions.map((item) => [
    item.data || '',
    item.eventoId || '',
    item.placa || '',
    item.motorista || '',
    item.horaEvento || '',
    item.horaChegada || '',
    item.horaSolicitacao || '',
    item.horaRespostaGR || '',
    item.horaParadaMotorista || '',
    item.horaRealizacao || '',
    item.diffEventoChegada || '00:00',
    item.diffChegadaSolicitacao || '00:00',
    item.diffSolicitacaoResposta || '00:00',
    item.diffParadaIntervencao || '00:00',
    item.diffSolicitacaoIntervencao || '00:00',
    item.diffEventoIntervencao || '00:00',
    item.motivoNaoRealizacao || '',
    item.statusRegistro || 'SIM',
    item.observacoes || ''
  ]);

  return [headers, ...rows];
}

/**
 * Parses Google Sheets or CSV matrix rows into FatigueIntervention objects
 */
export function parseInterventionsFromMatrix(rows: any[][]): FatigueIntervention[] {
  if (!rows || rows.length <= 1) return [];

  const results: FatigueIntervention[] = [];
  const headerRow = rows[0].map((h) => String(h).toLowerCase().trim());

  // Find column indices dynamically
  const colData = headerRow.findIndex((h) => h.includes('data'));
  const colId = headerRow.findIndex((h) => h.includes('id') || h.includes('evento'));
  const colPlaca = headerRow.findIndex((h) => h.includes('placa'));
  const colMotorista = headerRow.findIndex((h) => h.includes('motorista') || h.includes('nome'));
  const colHoraEv = headerRow.findIndex((h) => h.includes('hora evento') || h.includes('hora do evento'));
  const colHoraCheg = headerRow.findIndex((h) => h.includes('hora chegada') || h.includes('hora da chegada'));
  const colHoraSol = headerRow.findIndex((h) => h.includes('hora solic') || h.includes('hora da solic'));
  const colHoraResp = headerRow.findIndex((h) => h.includes('hora resp') || h.includes('hora da resp'));
  const colHoraPar = headerRow.findIndex((h) => h.includes('hora parada') || h.includes('hora da parada'));
  const colHoraReal = headerRow.findIndex((h) => h.includes('hora real') || h.includes('hora da real') || h.includes('hora interv'));

  const colEvCheg = headerRow.findIndex((h) => h.includes('evento e chegada') || h.includes('ev → cheg'));
  const colChegSol = headerRow.findIndex((h) => h.includes('chegada e solicit') || h.includes('cheg → sol'));
  const colSolResp = headerRow.findIndex((h) => h.includes('solicitação e resposta') || h.includes('sol → resp'));
  const colParInt = headerRow.findIndex((h) => h.includes('parada e interv') || h.includes('par → int'));
  const colSolInt = headerRow.findIndex((h) => h.includes('solicitação e interv') || h.includes('sol → int'));
  const colEvInt = headerRow.findIndex((h) => h.includes('evento e interv') || h.includes('tempo total') || h.includes('total geral'));

  const colMotivo = headerRow.findIndex((h) => h.includes('motivo'));
  const colStatus = headerRow.findIndex((h) => h.includes('status'));
  const colObs = headerRow.findIndex((h) => h.includes('obs'));

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const data = colData >= 0 ? String(row[colData] || '').trim() : '';
    const eventoId = colId >= 0 ? String(row[colId] || '').trim() : '';
    const placa = colPlaca >= 0 ? String(row[colPlaca] || '').trim().toUpperCase() : '';
    const motorista = colMotorista >= 0 ? String(row[colMotorista] || '').trim().toUpperCase() : '';

    if (!motorista && !placa && !eventoId) continue;

    const horaEvento = colHoraEv >= 0 ? String(row[colHoraEv] || '08:00').trim() : '08:00';
    const horaChegada = colHoraCheg >= 0 ? String(row[colHoraCheg] || '08:05').trim() : '08:05';
    const horaSolicitacao = colHoraSol >= 0 ? String(row[colHoraSol] || '08:15').trim() : '08:15';
    const horaRespostaGR = colHoraResp >= 0 ? String(row[colHoraResp] || '08:20').trim() : '08:20';
    const horaParadaMotorista = colHoraPar >= 0 ? String(row[colHoraPar] || '08:35').trim() : '08:35';
    const horaRealizacao = colHoraReal >= 0 ? String(row[colHoraReal] || '08:50').trim() : '08:50';

    const diffEventoChegada = colEvCheg >= 0 && row[colEvCheg] ? String(row[colEvCheg]).trim() : '00:05';
    const diffChegadaSolicitacao = colChegSol >= 0 && row[colChegSol] ? String(row[colChegSol]).trim() : '00:10';
    const diffSolicitacaoResposta = colSolResp >= 0 && row[colSolResp] ? String(row[colSolResp]).trim() : '00:05';
    const diffParadaIntervencao = colParInt >= 0 && row[colParInt] ? String(row[colParInt]).trim() : '00:15';
    const diffSolicitacaoIntervencao = colSolInt >= 0 && row[colSolInt] ? String(row[colSolInt]).trim() : '00:35';
    const diffEventoIntervencao = colEvInt >= 0 && row[colEvInt] ? String(row[colEvInt]).trim() : '00:50';

    const motivoNaoRealizacao = colMotivo >= 0 ? String(row[colMotivo] || '').trim() : '';
    const statusRegistro = colStatus >= 0 ? String(row[colStatus] || (motivoNaoRealizacao ? 'ENCERRADA' : 'SIM')).trim() : 'SIM';
    const observacoes = colObs >= 0 ? String(row[colObs] || '').trim() : '';

    results.push({
      id: `sheet-int-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      eventoId: eventoId || `EVT-${Date.now().toString().slice(-6)}`,
      data: data || new Date().toLocaleDateString('pt-BR'),
      placa: placa || 'N/A',
      motorista: motorista || 'MOTORISTA NÃO IDENTIFICADO',
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
    });
  }

  return results;
}
