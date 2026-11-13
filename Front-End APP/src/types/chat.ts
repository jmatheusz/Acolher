export interface ChatSummary {
  id: number;
  outroParticipanteId: number;
  outroParticipanteNome: string;
  outroParticipanteFoto: string | null;
  outroParticipanteTipo: 'usuario' | 'especialista' | string;
  ultimaMensagem: string | null;
  ultimaMensagemHorario: string | null;
  mensagensNaoLidas: number;
  status: 'aberto' | 'em_atendimento' | 'encerrado' | string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente' | string;
  criadoEm: string;
}

export interface ChatResponse {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  usuarioFoto: string | null;
  especialistaId: number;
  especialistaNome: string;
  especialistaFoto: string | null;
  status: string;
  prioridade: string;
  entrouEm: string;
  encerradoEm: string | null;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  remetenteId: number;
  remetenteNome: string;
  conteudoTexto: string;
  tipoMidia: 'texto' | 'audio' | 'imagem' | 'video' | string;
  enviadaEm: string;
  lida: boolean;
  ultimaLeitura: string | null;
  me?: boolean;
  pendente?: boolean;
}

export interface Especialista {
  id: number;
  usuarioId: number;
  nomeCompleto: string;
  fotoPerfil: string | null;
  imagemAvatar: string | null;
  codigoCrp: string | null;
  credenciais: string | null;
  especialidade: string | null;
  biografia: string | null;
  disponivel: boolean;
  notaMedia: number | null;
}

