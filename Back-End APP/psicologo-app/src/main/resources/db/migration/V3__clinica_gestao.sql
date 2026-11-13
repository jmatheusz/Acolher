-- ========================================================
-- V3__clinica_gestao.sql
-- Gestão Clínica, Disponibilidade, Consultas, Prontuários, Finanças e Conteúdos
-- ========================================================

-- 1. Disponibilidade de Horários do Psicólogo
CREATE TABLE IF NOT EXISTS Disponibilidade (
  id INT NOT NULL AUTO_INCREMENT,
  psicologo_id INT NOT NULL,
  dia_semana INT NOT NULL COMMENT '1=Segunda, 2=Terca, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sabado, 7=Domingo',
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_minutos INT NOT NULL DEFAULT 50,
  intervalo_minutos INT NOT NULL DEFAULT 10,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_disp_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_disp_psicologo (psicologo_id, dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bloqueio de Datas (Férias, Folgas, Licenças)
CREATE TABLE IF NOT EXISTS Bloqueio_Agenda (
  id INT NOT NULL AUTO_INCREMENT,
  psicologo_id INT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_bloq_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_bloq_psicologo (psicologo_id, data_inicio, data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Consultas e Agendamentos
CREATE TABLE IF NOT EXISTS Consulta (
  id INT NOT NULL AUTO_INCREMENT,
  psicologo_id INT NOT NULL,
  paciente_id INT NOT NULL,
  data_consulta DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  tipo ENUM('PRIMEIRA_CONSULTA', 'RETORNO', 'SESSAO_TERAPIA') NOT NULL DEFAULT 'SESSAO_TERAPIA',
  modalidade ENUM('ONLINE', 'PRESENCIAL') NOT NULL DEFAULT 'ONLINE',
  status ENUM('PENDENTE', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'FALTOU') NOT NULL DEFAULT 'PENDENTE',
  compareceu ENUM('PENDENTE', 'PRESENTE', 'FALTOU') NOT NULL DEFAULT 'PENDENTE',
  observacoes VARCHAR(1000) NULL,
  motivo_cancelamento VARCHAR(500) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_consulta_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_consulta_paciente
    FOREIGN KEY (paciente_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_consulta_agenda (psicologo_id, data_consulta, hora_inicio),
  INDEX idx_consulta_paciente (paciente_id, data_consulta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Prontuários Médicos e Clínicos (Dados Sensíveis / LGPD)
CREATE TABLE IF NOT EXISTS Prontuario (
  id INT NOT NULL AUTO_INCREMENT,
  psicologo_id INT NOT NULL,
  paciente_id INT NOT NULL,
  consulta_id INT NULL,
  data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  titulo VARCHAR(200) NOT NULL,
  anotacoes TEXT NOT NULL,
  evolucao TEXT NULL,
  sigiloso BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_prontuario_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_prontuario_paciente
    FOREIGN KEY (paciente_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_prontuario_consulta
    FOREIGN KEY (consulta_id) REFERENCES Consulta(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_prontuario_paciente (psicologo_id, paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Lançamentos Financeiros e Pagamentos
CREATE TABLE IF NOT EXISTS Pagamento (
  id INT NOT NULL AUTO_INCREMENT,
  psicologo_id INT NOT NULL,
  paciente_id INT NOT NULL,
  consulta_id INT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE NULL,
  status ENUM('PENDENTE', 'PAGO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  forma_pagamento ENUM('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'TRANSFERENCIA') NOT NULL DEFAULT 'PIX',
  descricao VARCHAR(255) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_pagamento_psicologo
    FOREIGN KEY (psicologo_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pagamento_paciente
    FOREIGN KEY (paciente_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pagamento_consulta
    FOREIGN KEY (consulta_id) REFERENCES Consulta(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_pagamento_psicologo (psicologo_id, status, data_vencimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Artigos Clínicos e Educativos (Fase 5)
CREATE TABLE IF NOT EXISTS Artigo (
  id INT NOT NULL AUTO_INCREMENT,
  autor_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  resumo VARCHAR(500) NULL,
  corpo MEDIUMTEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL DEFAULT 'Saúde Mental',
  imagem_capa VARCHAR(500) NULL,
  status ENUM('RASCUNHO', 'PUBLICADO') NOT NULL DEFAULT 'PUBLICADO',
  publicado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_artigo_autor
    FOREIGN KEY (autor_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_artigo_status (status, publicado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Podcasts e Áudios de Apoio (Fase 5)
CREATE TABLE IF NOT EXISTS Podcast (
  id INT NOT NULL AUTO_INCREMENT,
  autor_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NULL,
  url_audio VARCHAR(500) NOT NULL,
  duracao_segundos INT NOT NULL DEFAULT 0,
  categoria VARCHAR(100) NOT NULL DEFAULT 'Acolhimento',
  imagem_capa VARCHAR(500) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_podcast_autor
    FOREIGN KEY (autor_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_podcast_autor (autor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

