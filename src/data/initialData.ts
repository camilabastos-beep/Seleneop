import { User, Driver, BiopsychosocialEvaluation, CronotipoEvaluation, FatigueIntervention, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Camila Nunes Bastos',
    email: 'camila.bastos@etp-transparana.com.br',
    password: 'mila1621',
    role: 'ADMIN',
    active: true,
    filial: 'Matriz',
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: '2026-08-22T08:15:00.000Z'
  },
  {
    id: 'user-psi-1',
    name: 'Dr. Lucas Silveira (CRP 08/29412)',
    email: 'psicologia@etp-transparana.com.br',
    password: 'psi1234@transparana',
    role: 'PSICOLOGO',
    active: true,
    filial: 'Pernambuco',
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLogin: '2026-08-21T14:30:00.000Z'
  },
  {
    id: 'user-gestor-1',
    name: 'Roberto Mendes (Gestão de Frotas/GR)',
    email: 'gestao.gr@etp-transparana.com.br',
    password: 'gestor@transparana',
    role: 'GESTOR',
    active: true,
    filial: 'Maranhão',
    createdAt: '2026-03-05T09:00:00.000Z',
    lastLogin: '2026-08-22T07:45:00.000Z'
  },
  {
    id: 'user-consulta-1',
    name: 'Juliana Paes (Auditoria Operacional)',
    email: 'auditoria@etp-transparana.com.br',
    password: 'consulta@transparana',
    role: 'CONSULTA',
    active: true,
    filial: 'Mossoró',
    createdAt: '2026-04-12T11:00:00.000Z',
    lastLogin: '2026-08-20T16:20:00.000Z'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'MARCOS VINICIOS MARTINS DOS SANTOS',
    cpf: '382.910.448-12',
    company: 'Transparaná Transportes',
    filial: 'Matriz',
    plate: 'SEN9B52',
    phone: '(41) 98722-1049',
    email: 'marcos.martins@etp-transparana.com.br',
    birthDate: '1984-05-14',
    maritalStatus: 'Casado',
    hasChildren: '2 filhos (8 e 12 anos)',
    notes: 'Motorista de rotas interestaduais.',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'drv-2',
    name: 'SILAS FERREIRA DE ARAGAO',
    cpf: '491.029.381-55',
    company: 'Transparaná Transportes',
    filial: 'Pernambuco',
    plate: 'RPL7I46',
    phone: '(81) 97611-3920',
    email: 'silas.aragao@etp-transparana.com.br',
    birthDate: '1979-11-20',
    maritalStatus: 'Casado',
    hasChildren: '1 filho (15 anos)',
    notes: 'Perfil pontual, jornada mista.',
    createdAt: '2026-01-18T10:00:00.000Z'
  },
  {
    id: 'drv-3',
    name: 'JOSIVAL SERGIO DOS SANTOS',
    cpf: '209.481.920-33',
    company: 'Transparaná Transportes',
    filial: 'Maranhão',
    plate: 'RDL8H40',
    phone: '(98) 99120-4491',
    email: 'josival.santos@etp-transparana.com.br',
    birthDate: '1988-02-09',
    maritalStatus: 'Solteiro',
    hasChildren: 'Sem filhos',
    notes: 'Acompanhamento de rotina regular.',
    createdAt: '2026-02-02T14:00:00.000Z'
  },
  {
    id: 'drv-4',
    name: 'UILIAM DOS SANTOS SOUZA',
    cpf: '184.920.194-82',
    company: 'Transparaná Transportes',
    filial: 'Mossoró',
    plate: 'SEW7J48',
    phone: '(84) 98831-2940',
    email: 'uiliam.souza@etp-transparana.com.br',
    birthDate: '1982-08-30',
    maritalStatus: 'Divorciado',
    hasChildren: '2 filhos',
    notes: 'Requer atenção para descansos regulares.',
    createdAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'drv-5',
    name: 'FABIO GUSTAVO BARBOSA DA SILVA',
    cpf: '592.104.882-90',
    company: 'Transparaná Transportes',
    filial: 'Matriz',
    plate: 'RDQ0E68',
    phone: '(41) 99401-2950',
    email: 'fabio.barbosa@etp-transparana.com.br',
    birthDate: '1990-03-22',
    maritalStatus: 'Casado',
    hasChildren: '1 filho (4 anos)',
    notes: 'Excelente histórico de condução.',
    createdAt: '2026-02-20T08:30:00.000Z'
  },
  {
    id: 'drv-6',
    name: 'JOSE FABRICIO VIEIRA DA SILVA',
    cpf: '301.994.201-11',
    company: 'Transparaná Transportes',
    filial: 'Pernambuco',
    plate: 'SEN9B51',
    phone: '(81) 98129-3381',
    email: 'fabricio.vieira@etp-transparana.com.br',
    birthDate: '1985-07-19',
    maritalStatus: 'Casado',
    hasChildren: '3 filhos',
    notes: 'Rota nordeste/sudeste.',
    createdAt: '2026-03-01T09:15:00.000Z'
  },
  {
    id: 'drv-7',
    name: 'JACKSON LEANDRO BRITO',
    cpf: '419.204.195-66',
    company: 'Transparaná Transportes',
    filial: 'Maranhão',
    plate: 'RPM6I35',
    phone: '(98) 99310-8201',
    email: 'jackson.brito@etp-transparana.com.br',
    birthDate: '1987-12-04',
    maritalStatus: 'União Estável',
    hasChildren: '1 filho',
    notes: 'Escala variável.',
    createdAt: '2026-03-10T10:45:00.000Z'
  },
  {
    id: 'drv-8',
    name: 'ANTONIO ADILTON PEREIRA PINTO',
    cpf: '291.049.201-77',
    company: 'Transparaná Transportes',
    filial: 'Mossoró',
    plate: 'RCZ6J98',
    phone: '(84) 98701-4410',
    email: 'antonio.adilton@etp-transparana.com.br',
    birthDate: '1981-06-18',
    maritalStatus: 'Casado',
    hasChildren: '2 filhos',
    notes: 'Acompanhamento preventivo de fadiga.',
    createdAt: '2026-03-15T14:20:00.000Z'
  },
  {
    id: 'drv-9',
    name: 'JANAILTON BRITO FERREIRA',
    cpf: '581.029.381-00',
    company: 'Transparaná Transportes',
    filial: 'Matriz',
    plate: 'SEX0D95',
    phone: '(41) 98401-2290',
    email: 'janailton.ferreira@etp-transparana.com.br',
    birthDate: '1983-09-12',
    maritalStatus: 'Casado',
    hasChildren: '2 filhos',
    notes: 'Operação de carretas frigoríficas.',
    createdAt: '2026-03-25T08:00:00.000Z'
  },
  {
    id: 'drv-10',
    name: 'JEFFERSON SOARES DA ROCHA',
    cpf: '409.182.736-44',
    company: 'Transparaná Transportes',
    filial: 'Pernambuco',
    plate: 'OVS8H09',
    phone: '(81) 99344-1029',
    email: 'jefferson.rocha@etp-transparana.com.br',
    birthDate: '1992-04-15',
    maritalStatus: 'Solteiro',
    hasChildren: 'Sem filhos',
    notes: 'Rotas de curta e média distância.',
    createdAt: '2026-04-01T11:20:00.000Z'
  },
  {
    id: 'drv-11',
    name: 'LUCIANO JOSE DA SILVA',
    cpf: '620.194.829-33',
    company: 'Transparaná Transportes',
    filial: 'Maranhão',
    plate: 'RCX1J23',
    phone: '(98) 98711-2094',
    email: 'luciano.jose@etp-transparana.com.br',
    birthDate: '1980-01-25',
    maritalStatus: 'Casado',
    hasChildren: '2 filhos',
    notes: 'Acompanhamento preventivo.',
    createdAt: '2026-04-10T14:30:00.000Z'
  },
  {
    id: 'drv-12',
    name: 'WILSON ROCHA MATOS',
    cpf: '339.102.847-22',
    company: 'Transparaná Transportes',
    filial: 'Mossoró',
    plate: 'RPB4F04',
    phone: '(84) 99201-9481',
    email: 'wilson.rocha@etp-transparana.com.br',
    birthDate: '1986-10-03',
    maritalStatus: 'Solteiro',
    hasChildren: 'Sem filhos',
    notes: 'Perfil matutino.',
    createdAt: '2026-04-18T09:40:00.000Z'
  }
];

// Blank default lists as requested so evaluator starts fresh with 0 prefilled data
export const INITIAL_BIOPSYCHOSOCIAL: BiopsychosocialEvaluation[] = [];

export const INITIAL_CRONOTIPO: CronotipoEvaluation[] = [];

export const INITIAL_INTERVENTIONS: FatigueIntervention[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-22T08:15:30.000Z',
    userId: 'user-admin-1',
    userName: 'Camila Nunes Bastos',
    userRole: 'ADMIN',
    action: 'LOGIN',
    resource: 'SISTEMA',
    details: 'Acesso efetuado com perfil de Administradora.'
  }
];
