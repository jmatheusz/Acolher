export interface Disponibilidade {
  id: number;
  diaSemana: number; // 1 = Segunda ... 7 = Domingo
  horaInicio: string; // HH:mm:ss ou HH:mm
  horaFim: string;
  duracaoMinutos: number;
  intervaloMinutos: number;
  ativo: boolean;
}

export interface BloqueioAgenda {
  id: number;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;
  motivo?: string;
}

export type TipoConsulta = 'PRIMEIRA_CONSULTA' | 'RETORNO' | 'SESSAO_TERAPIA';
export type ModalidadeConsulta = 'ONLINE' | 'PRESENCIAL';
export type StatusConsulta = 'PENDENTE' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA' | 'FALTOU';
export type Comparecimento = 'PENDENTE' | 'PRESENTE' | 'FALTOU';

export interface Consulta {
  id: number;
  psicologoId: number;
  psicologoNome: string;
  pacienteId: number;
  pacienteNome: string;
  pacienteFoto?: string | null;
  dataConsulta: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  tipo: TipoConsulta;
  modalidade: ModalidadeConsulta;
  status: StatusConsulta;
  compareceu: Comparecimento;
  observacoes?: string;
  motivoCancelamento?: string;
  criadoEm?: string;
}

export interface Prontuario {
  id: number;
  psicologoId: number;
  pacienteId: number;
  pacienteNome: string;
  consultaId?: number;
  dataRegistro: string;
  titulo: string;
  anotacoes: string;
  evolucao?: string;
  sigiloso: boolean;
}

export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'TRANSFERENCIA';

export interface Pagamento {
  id: number;
  psicologoId: number;
  pacienteId: number;
  pacienteNome: string;
  consultaId?: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string | null;
  status: StatusPagamento;
  formaPagamento: FormaPagamento;
  descricao?: string;
  criadoEm?: string;
}

export interface ResumoFinanceiro {
  totalRecebido: number;
  totalAReceber: number;
  totalGeral: number;
  quantidadeLancamentos: number;
  lancamentos: Pagamento[];
}

export interface PainelClinico {
  sessoesHoje: number;
  totalPacientes: number;
  taxaPresenca: number;
  totalPresencas: number;
  totalFaltas: number;
  totalRecebido: number;
  totalAReceber: number;
  agendaHoje: Consulta[];
}

export interface PacienteResumo {
  id: number;
  nomeCompleto: string;
  email: string;
  fotoPerfil?: string | null;
  totalConsultas: number;
  ultimaConsulta?: string | null;
}

export interface SlotHorario {
  data: string;
  horaInicio: string;
  horaFim: string;
  disponivel: boolean;
}

