export interface Artigo {
  id: number;
  autorId: number;
  autorNome: string;
  titulo: string;
  resumo?: string;
  corpo: string;
  categoria: string;
  imagemCapa?: string | null;
  status: 'RASCUNHO' | 'PUBLICADO';
  publicadoEm: string;
}

export interface Podcast {
  id: number;
  autorId: number;
  autorNome: string;
  titulo: string;
  descricao?: string;
  urlAudio: string;
  duracaoSegundos: number;
  categoria: string;
  imagemCapa?: string | null;
  criadoEm: string;
}

