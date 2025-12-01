export type BedType = 'Clínico' | 'Isolamento (TB)' | 'Observação' | 'Estabilização';
export type BedStatus = 'Livre' | 'Ocupado' | 'Higienização' | 'Manutenção' | 'Bloqueado';
export type Sector = 'Internação' | 'Emergência';
export type RiskLevel = 'Vermelho' | 'Laranja' | 'Amarelo' | 'Verde' | 'Azul';
export type IsolationType = 'Nenhum' | 'Contato' | 'Aerossol' | 'Gotículas';

export interface Patient {
  id: string;
  internalId: string; // id_do_paciente
  name: string;
  cpf: string;
  susCard: string;
  birthDate: string; // YYYY-MM-DD
  motherName: string;
  sex: 'Masculino' | 'Feminino';
  phone: string;
  address: string;
  lastDischargeDate?: string;
  age?: string;
  editedBy?: string;
}

export interface Bed {
  id: string;
  number: string; // numero_leito
  title: string; // Post title usually
  type: BedType;
  sector: Sector;
  status: BedStatus;
  currentAdmissionId?: string;
  currentPatientName?: string;
  notes?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  bedId: string;
  entryDate: string; // Data Hora de Cadastro (Manual)
  systemEntryDate: string; // Data do Sistema
  origin: string;
  riskLevel: RiskLevel;
  isolation: IsolationType;
  diagnosis: string;
  status: 'internado' | 'alta' | 'óbito' | 'evasão' | 'transferido';
  dischargeDate?: string;
  dischargeDestination?: string;
  dischargeNotes?: string;
  createdBy: string;
}

// Responses based on PHP API

export interface MapStats {
  graficos: Record<string, { total: number; occupied: number; cor: string }>;
  tabela: {
    admissao_id: string;
    leito: string;
    tipo: string;
    tipo_slug: string;
    paciente: string;
    entrada: string;
    permanencia: string;
  }[];
}

export interface DashboardStatsResponse {
  leitos: Record<string, { total: number; occupied: number; cor: string }>;
  taxa_ocupacao: number;
  admissoes_hoje: number;
  grafico: {
    labels: string[];
    data: number[];
  };
  recentes: {
    nome: string;
    leito: string;
    slug: string;
    hora: string;
  }[];
}

export interface AdmissionDetailsResponse {
  success: boolean;
  admissao: {
    id: string;
    data_entrada: string;
    data_sistema: string;
    diagnostico: string;
    risco: string;
    isolamento: string;
    origem: string;
    cadastrado_por: string;
  };
  leito: {
    id: string;
    nome: string;
    tipo: string;
  };
  paciente: {
    id: string;
    id_interno: string;
    nome: string;
    cpf: string;
    sus: string;
    nasc: string; // Y-m-d usually from PHP in this specific endpoint
    sexo: string;
    mae: string;
    telefone: string;
    endereco: string;
    editado_por: string;
  };
}