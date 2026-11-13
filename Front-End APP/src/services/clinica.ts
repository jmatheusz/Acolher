import api from './api';
import {
  BloqueioAgenda,
  Comparecimento,
  Consulta,
  Disponibilidade,
  PacienteResumo,
  Pagamento,
  PainelClinico,
  Prontuario,
  ResumoFinanceiro,
  StatusConsulta,
  StatusPagamento,
} from '../types/clinica';

export async function obterPainelClinico(): Promise<PainelClinico> {
  const response = await api.get<PainelClinico>('/api/clinica/painel');
  return response.data;
}

// 1. Meus Horários (Disponibilidade)
export async function listarDisponibilidade(): Promise<Disponibilidade[]> {
  const response = await api.get<Disponibilidade[]>('/api/clinica/disponibilidade');
  return response.data;
}

export async function salvarDisponibilidade(dados: Partial<Disponibilidade>): Promise<Disponibilidade> {
  const response = await api.post<Disponibilidade>('/api/clinica/disponibilidade', dados);
  return response.data;
}

export async function alternarDisponibilidade(id: number): Promise<void> {
  await api.patch(`/api/clinica/disponibilidade/${id}/toggle`);
}

export async function excluirDisponibilidade(id: number): Promise<void> {
  await api.delete(`/api/clinica/disponibilidade/${id}`);
}

// 2. Bloqueios de Agenda
export async function listarBloqueios(): Promise<BloqueioAgenda[]> {
  const response = await api.get<BloqueioAgenda[]>('/api/clinica/bloqueios');
  return response.data;
}

export async function salvarBloqueio(dados: { dataInicio: string; dataFim: string; motivo?: string }): Promise<BloqueioAgenda> {
  const response = await api.post<BloqueioAgenda>('/api/clinica/bloqueios', dados);
  return response.data;
}

export async function excluirBloqueio(id: number): Promise<void> {
  await api.delete(`/api/clinica/bloqueios/${id}`);
}

// 3. Consultas e Agenda
export async function listarConsultas(params?: { data?: string; dataInicio?: string; dataFim?: string }): Promise<Consulta[]> {
  const response = await api.get<Consulta[]>('/api/clinica/consultas', { params });
  return response.data;
}

export async function criarConsulta(dados: any): Promise<Consulta> {
  const response = await api.post<Consulta>('/api/clinica/consultas', dados);
  return response.data;
}

export async function alterarStatusConsulta(id: number, status: StatusConsulta, motivo?: string): Promise<Consulta> {
  const response = await api.patch<Consulta>(`/api/clinica/consultas/${id}/status`, { status, motivo });
  return response.data;
}

export async function marcarPresenca(id: number, compareceu: Comparecimento): Promise<Consulta> {
  const response = await api.patch<Consulta>(`/api/clinica/consultas/${id}/presenca`, { compareceu });
  return response.data;
}

export async function remarcarConsulta(id: number, data: string, horaInicio: string, horaFim?: string): Promise<Consulta> {
  const response = await api.put<Consulta>(`/api/clinica/consultas/${id}/remarcar`, { data, horaInicio, horaFim });
  return response.data;
}

// 4. Pacientes
export async function listarPacientes(): Promise<PacienteResumo[]> {
  const response = await api.get<PacienteResumo[]>('/api/clinica/pacientes');
  return response.data;
}

// 5. Prontuários
export async function listarProntuarios(pacienteId?: number): Promise<Prontuario[]> {
  const response = await api.get<Prontuario[]>('/api/clinica/prontuarios', { params: { pacienteId } });
  return response.data;
}

export async function criarProntuario(dados: {
  pacienteId: number;
  consultaId?: number;
  titulo: string;
  anotacoes: string;
  evolucao?: string;
}): Promise<Prontuario> {
  const response = await api.post<Prontuario>('/api/clinica/prontuarios', dados);
  return response.data;
}

export async function atualizarProntuario(id: number, dados: any): Promise<Prontuario> {
  const response = await api.put<Prontuario>(`/api/clinica/prontuarios/${id}`, dados);
  return response.data;
}

export async function excluirProntuario(id: number): Promise<void> {
  await api.delete(`/api/clinica/prontuarios/${id}`);
}

// 6. Finanças
export async function obterFinancas(inicio?: string, fim?: string): Promise<ResumoFinanceiro> {
  const response = await api.get<ResumoFinanceiro>('/api/clinica/financas', { params: { inicio, fim } });
  return response.data;
}

export async function criarPagamento(dados: any): Promise<Pagamento> {
  const response = await api.post<Pagamento>('/api/clinica/financas', dados);
  return response.data;
}

export async function atualizarStatusPagamento(id: number, status: StatusPagamento): Promise<Pagamento> {
  const response = await api.patch<Pagamento>(`/api/clinica/financas/${id}/status`, { status });
  return response.data;
}

