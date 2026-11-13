CREATE TABLE Usuario (
  id                   INT          NOT NULL AUTO_INCREMENT,
  nome                 VARCHAR(100) NOT NULL,
  email                VARCHAR(150) NOT NULL UNIQUE,
  senha                VARCHAR(255) NOT NULL,
  imagem_avatar        VARCHAR(255) NULL,
  foto_perfil          VARCHAR(255) NULL,
  status               ENUM('pendente','ativo','suspenso','banido') NOT NULL DEFAULT 'pendente',
  _anonimo             ENUM('sim','nao')                            NOT NULL DEFAULT 'nao',
  tipo                 ENUM('usuario','especialista')               NOT NULL DEFAULT 'usuario',
  idAutenticacao_Token INT          NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Autenticacao_Token (
  id         INT          NOT NULL AUTO_INCREMENT,
  tipo       INT          NOT NULL COMMENT 'email=1, senha=2',
  token      VARCHAR(255) NOT NULL,
  expira_em  DATETIME     NOT NULL,
  usado_em   DATE         NULL,
  usuario_id INT          NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_token_usuario
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_token_valor (token),
  INDEX idx_token_usuario_tipo (usuario_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Especialidades (
  id            INT           NOT NULL AUTO_INCREMENT,
  usuario_id    INT           NOT NULL,
  nome          VARCHAR(100)  NOT NULL,
  codigo_crp    VARCHAR(20)   NULL,
  credenciais   VARCHAR(255)  NULL,
  disponivel    BOOLEAN       NOT NULL DEFAULT TRUE,
  especialidade VARCHAR(100)  NULL,
  biografia     VARCHAR(1000) NULL,
  nota_media    DECIMAL(3,2)  NULL,
  data_emissao  DATE          NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_especialidades_usuario
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Chat (
  id                      INT      NOT NULL AUTO_INCREMENT,
  usuario_id              INT      NOT NULL,
  especialista_usuario_id INT      NOT NULL,
  encerrado_em            DATETIME NULL,
  entrou_em               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status                  ENUM('aberto','em_atendimento','encerrado') NOT NULL DEFAULT 'aberto',
  prioridade              ENUM('baixa','media','alta','urgente')      NOT NULL DEFAULT 'baixa',
  PRIMARY KEY (id),
  CONSTRAINT fk_chat_usuario
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_chat_especialista
    FOREIGN KEY (especialista_usuario_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Mensagem (
  id             INT           NOT NULL AUTO_INCREMENT,
  remetente_id   INT           NOT NULL,
  chat_id        INT           NOT NULL,
  tipo_midia     ENUM('texto','audio','imagem','video') NOT NULL DEFAULT 'texto',
  conteudo_texto VARCHAR(5000) NULL,
  enviada_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  excluida       BOOLEAN       NOT NULL DEFAULT FALSE,
  ultima_leitura DATETIME      NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_mensagem_remetente
    FOREIGN KEY (remetente_id) REFERENCES Usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mensagem_chat
    FOREIGN KEY (chat_id) REFERENCES Chat(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_chat_enviada (chat_id, enviada_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Conteudo_Educativo (
  id_conteudo INT          NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(200) NOT NULL,
  descricao   TEXT         NULL,
  publicados  BOOLEAN      NOT NULL DEFAULT FALSE,
  url_arquivo VARCHAR(500) NULL,
  tipo        ENUM('exercicio','leitura','audio') NOT NULL DEFAULT 'leitura',
  PRIMARY KEY (id_conteudo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Usuario
  ADD CONSTRAINT fk_usuario_token
    FOREIGN KEY (idAutenticacao_Token) REFERENCES Autenticacao_Token(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

DELIMITER $$

CREATE TRIGGER trg_chat_valida_tipos
BEFORE INSERT ON Chat
FOR EACH ROW
BEGIN
  DECLARE tipo_usuario VARCHAR(20);
  DECLARE tipo_especialista VARCHAR(20);

  SELECT tipo INTO tipo_usuario FROM Usuario WHERE id = NEW.usuario_id;
  SELECT tipo INTO tipo_especialista FROM Usuario WHERE id = NEW.especialista_usuario_id;

  IF tipo_usuario <> 'usuario' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'usuario_id do Chat deve referenciar um Usuario do tipo "usuario".';
  END IF;

  IF tipo_especialista <> 'especialista' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'especialista_usuario_id do Chat deve referenciar um Usuario do tipo "especialista".';
  END IF;
END$$

CREATE TRIGGER trg_chat_evita_duplicado
BEFORE INSERT ON Chat
FOR EACH ROW
BEGIN
  DECLARE ja_existe INT;

  IF NEW.status = 'aberto' THEN
    SELECT COUNT(*) INTO ja_existe
    FROM Chat
    WHERE usuario_id = NEW.usuario_id
      AND especialista_usuario_id = NEW.especialista_usuario_id
      AND status = 'aberto';

    IF ja_existe > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ja existe um chat aberto entre esse usuario e esse especialista.';
    END IF;
  END IF;
END$$

DELIMITER ;
