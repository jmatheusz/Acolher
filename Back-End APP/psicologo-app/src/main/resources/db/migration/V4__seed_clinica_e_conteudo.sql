-- ========================================================
-- V4__seed_clinica_e_conteudo.sql
-- Carga inicial de horários padrão, artigos e podcasts
-- ========================================================

-- 1. Cria disponibilidade padrão (Segunda a Sexta, 08:00 às 18:00) para especialistas existentes
INSERT INTO Disponibilidade (psicologo_id, dia_semana, hora_inicio, hora_fim, duracao_minutos, intervalo_minutos, ativo)
SELECT u.id, d.dia, '08:00:00', '18:00:00', 50, 10, TRUE
FROM Usuario u
CROSS JOIN (
    SELECT 1 AS dia UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5
) d
WHERE u.tipo = 'especialista'
  AND NOT EXISTS (
      SELECT 1 FROM Disponibilidade disp WHERE disp.psicologo_id = u.id AND disp.dia_semana = d.dia
  );

-- 2. Artigos de Apoio Emocional e Psicológico
INSERT INTO Artigo (autor_id, titulo, resumo, corpo, categoria, imagem_capa, status, publicado_em)
SELECT u.id, 
       'Como lidar com a ansiedade no dia a dia', 
       'Estratégias práticas da Terapia Cognitivo-Comportamental para acalmar a mente nos momentos de crise.',
       'A ansiedade é uma resposta natural do organismo diante de situações de incerteza ou ameaça percebida. No entanto, quando atinge níveis paralisantes, prejudica a qualidade de vida, o sono e as relações interpessoais.\n\nPrincipais técnicas recomendadas:\n1. Respiração Diafragmática (4x4): Inspire em 4 segundos, segure por 4 e expire lentamente em 4 segundos.\n2. Técnica de Ancoragem (5-4-3-2-1): Identifique 5 coisas que você vê, 4 que pode tocar, 3 que ouve, 2 que pode cheirar e 1 sabor.\n3. Registro de Pensamentos Disfuncionais: Questione pensamentos catastróficos com evidências reais.\n\nLembre-se: buscar acompanhamento psicológico é um ato de coragem e autocuidado.',
       'Ansiedade & Estresse',
       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
       'PUBLICADO',
       NOW()
FROM Usuario u
WHERE u.email = 'maria.silva@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM Artigo a WHERE a.titulo = 'Como lidar com a ansiedade no dia a dia');

INSERT INTO Artigo (autor_id, titulo, resumo, corpo, categoria, imagem_capa, status, publicado_em)
SELECT u.id, 
       'A importância do acolhimento e escuta ativa', 
       'Descubra como o diálogo sem julgamentos promove transformações profundas na saúde mental.',
       'Em um mundo cada vez mais acelerado, ter um espaço seguro para expressar sentimentos, medos e vulnerabilidades tornou-se essencial.\n\nA escuta ativa não consiste apenas em ouvir palavras, mas em captar a emoção subjacente sem emitir conselhos precipitados ou críticas.\n\nBenefícios do apoio profissional:\n- Validação das próprias emoções\n- Clareza para tomada de decisões difíceis\n- Fortalecimento da autoestima e resiliência psicológica\n\nNo Projeto Acolher, cada sessão é construída com respeito absoluto ao seu tempo.',
       'Autocuidado',
       'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
       'PUBLICADO',
       NOW()
FROM Usuario u
WHERE u.email = 'maria.silva@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM Artigo a WHERE a.titulo = 'A importância do acolhimento e escuta ativa');

-- 3. Podcasts de Apoio e Relaxamento
INSERT INTO Podcast (autor_id, titulo, descricao, url_audio, duracao_segundos, categoria, imagem_capa, criado_em)
SELECT u.id,
       'Meditação Guiada: Alívio da Ansiedade e Respiração',
       'Pausa guiada de 5 minutos para desacelerar pensamentos, relaxar os ombros e recuperar a clareza mental.',
       'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
       312,
       'Meditação',
       'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
       NOW()
FROM Usuario u
WHERE u.email = 'maria.silva@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM Podcast p WHERE p.titulo = 'Meditação Guiada: Alívio da Ansiedade e Respiração');

INSERT INTO Podcast (autor_id, titulo, descricao, url_audio, duracao_segundos, categoria, imagem_capa, criado_em)
SELECT u.id,
       'Dormir Bem: Relaxamento para Insônia e Mente Calma',
       'Técnicas de relaxamento muscular progressivo e visualização serena para um sono restaurador.',
       'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
       425,
       'Sono & Descanso',
       'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80',
       NOW()
FROM Usuario u
WHERE u.email = 'maria.silva@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM Podcast p WHERE p.titulo = 'Dormir Bem: Relaxamento para Insônia e Mente Calma');

