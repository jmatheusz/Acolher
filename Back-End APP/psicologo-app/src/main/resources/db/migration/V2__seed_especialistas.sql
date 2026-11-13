-- Atualiza usuário existente para especialista
UPDATE Usuario 
SET tipo = 'especialista', status = 'ativo' 
WHERE email = 'maria.silva@exemplo.com';

INSERT INTO Especialidades (usuario_id, nome, codigo_crp, credenciais, disponivel, especialidade, biografia, nota_media, data_emissao)
SELECT u.id, 'Dra. Maria Silva', '06/123456', 'CRP 06/123456 - Ativo', TRUE, 'Psicóloga Clínica & TCC', 'Atendimento acolhedor focado em autoconhecimento, manejo de estresse e ansiedade.', 5.00, CURDATE()
FROM Usuario u
WHERE u.email = 'maria.silva@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM Especialidades e WHERE e.usuario_id = u.id);

-- Cria especialista de referência caso não exista
INSERT INTO Usuario (nome, email, senha, status, _anonimo, tipo)
SELECT 'Dra. Ana Paula Ribeiro', 'dra.anapaula@acolher.app', '$2a$10$68Jr.Mutg8EN1Yenxt89JOWWxnBOA4XHSgqrtxaaCq/xAQyYu5omm', 'ativo', 'nao', 'especialista'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Usuario WHERE email = 'dra.anapaula@acolher.app');

INSERT INTO Especialidades (usuario_id, nome, codigo_crp, credenciais, disponivel, especialidade, biografia, nota_media, data_emissao)
SELECT u.id, 'Dra. Ana Paula Ribeiro', '06/987654', 'CRP 06/987654 - Ativo', TRUE, 'Psicóloga Clínica & Humanista', 'Especialista em acolhimento emocional, desenvolvimento pessoal e ansiedade.', 5.00, CURDATE()
FROM Usuario u
WHERE u.email = 'dra.anapaula@acolher.app'
  AND NOT EXISTS (SELECT 1 FROM Especialidades e WHERE e.usuario_id = u.id);

