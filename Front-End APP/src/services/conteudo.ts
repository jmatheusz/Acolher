import api from './api';
import { Artigo, Podcast } from '../types/conteudo';

export async function listarArtigos(categoria?: string): Promise<Artigo[]> {
  const response = await api.get<Artigo[]>('/api/conteudos/artigos', {
    params: { categoria },
  });
  return response.data;
}

export async function buscarArtigoPorId(id: number): Promise<Artigo> {
  const response = await api.get<Artigo>(`/api/conteudos/artigos/${id}`);
  return response.data;
}

export async function criarArtigo(dados: {
  titulo: string;
  resumo?: string;
  corpo: string;
  categoria?: string;
  imagemCapa?: string;
  status?: string;
}): Promise<Artigo> {
  const response = await api.post<Artigo>('/api/conteudos/artigos', dados);
  return response.data;
}

export async function excluirArtigo(id: number): Promise<void> {
  await api.delete(`/api/conteudos/artigos/${id}`);
}

export async function listarPodcasts(categoria?: string): Promise<Podcast[]> {
  const response = await api.get<Podcast[]>('/api/conteudos/podcasts', {
    params: { categoria },
  });
  return response.data;
}

export async function criarPodcast(dados: {
  titulo: string;
  descricao?: string;
  urlAudio: string;
  duracaoSegundos?: number;
  categoria?: string;
  imagemCapa?: string;
}): Promise<Podcast> {
  const response = await api.post<Podcast>('/api/conteudos/podcasts', dados);
  return response.data;
}

export async function excluirPodcast(id: number): Promise<void> {
  await api.delete(`/api/conteudos/podcasts/${id}`);
}

