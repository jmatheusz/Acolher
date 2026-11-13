import api from './api';
import { Consulta, SlotHorario } from '../types/clinica';

export async function buscarSlotsDisponiveis(psicologoId: number, data: string): Promise<SlotHorario[]> {
  const response = await api.get<SlotHorario[]>(`/api/agendamentos/especialistas/${psicologoId}/slots`, {
    params: { data },
  });
  return response.data;
}

export async function solicitarAgendamento(dados: {
  psicologoId: number;
  dataConsulta: string;
  horaInicio: string;
  horaFim?: string;
  tipo?: string;
  modalidade?: string;
  observacoes?: string;
}): Promise<Consulta> {
  const response = await api.post<Consulta>('/api/agendamentos', dados);
  return response.data;
}

export async function listarMinhasConsultas(): Promise<Consulta[]> {
  const response = await api.get<Consulta[]>('/api/agendamentos/minhas-consultas');
  return response.data;
}

export async function cancelarConsultaPeloPaciente(id: number, motivo?: string): Promise<Consulta> {
  const response = await api.patch<Consulta>(`/api/agendamentos/${id}/cancelar`, { motivo });
  return response.data;
}

