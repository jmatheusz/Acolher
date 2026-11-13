# 💚 Projeto Acolher — Plataforma Completa de Apoio Psicológico e Gestão Clínica

> **Solução Full-Stack (Mobile + Back-End API) que conecta psicólogos e pacientes, oferecendo chat privado em tempo real, painel de gestão clínica com prontuários eletrônicos protegidos (LGPD), agendamentos inteligentes e suporte emergencial.**

---

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_58-000?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.5-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-blue?style=for-the-badge&logo=springsecurity)](https://spring.io/projects/spring-security)
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-red?style=for-the-badge&logo=socketdotio)](https://spring.io/guides/gs/messaging-stomp-websocket/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0202?style=for-the-badge&logo=flyway)](https://flywaydb.org/)
[![Tests](https://img.shields.io/badge/Tests-16%20Passing-brightgreen?style=for-the-badge&logo=junit5)](https://junit.org/)

---

## 📌 Visão Geral do Projeto

O **Projeto Acolher** é um ecossistema completo desenvolvido para democratizar o acesso à saúde emocional e fornecer aos psicólogos ferramentas modernas de gestão clínica. A plataforma é dividida em duas frentes integradas:

1. **Front-End Mobile (`Front-End APP`):** Aplicativo construído em **React Native** com **Expo** e **Expo Router**, proporcionando uma experiência fluida para pacientes e psicólogos em dispositivos iOS, Android e Web.
2. **Back-End API (`Back-End APP`):** Servidor robusto construído em **Java 21** e **Spring Boot 3.5.5**, com comunicação em tempo real via **WebSocket STOMP**, persistência no **MySQL 8.0** com **Flyway**, segurança **Spring Security + JWT** e estrito isolamento de dados sensíveis sob a **LGPD (Lei Geral de Proteção de Dados)**.

---

## 🏗️ Estrutura do Monorepo

```
Acolher/
├── Back-End APP/
│   └── psicologo-app/
│       ├── src/main/java/com/acolher/psicologo/
│       │   ├── autenticacao/     # Cadastro, login e verificação
│       │   ├── chat/             # WebSocket, controllers e services de chat
│       │   ├── clinica/          # Agenda, presença, prontuários LGPD e finanças
│       │   ├── conteudo/         # Artigos e podcasts de apoio emocional
│       │   ├── especialista/     # Perfil profissional e credenciais (CRP)
│       │   ├── seguranca/        # Filtro JWT, CORS e SecurityConfig
│       │   └── usuario/          # Entidades e repositórios de usuários
│       ├── src/main/resources/
│       │   ├── db/migration/     # Migrations Flyway (V1 a V4)
│       │   └── application.properties
│       └── pom.xml               # Dependências Maven (Java 21, Spring Boot 3)
│
├── Front-End APP/
│   ├── src/
│   │   ├── app/                  # Rotas e telas (Expo Router)
│   │   │   ├── chat/             # Telas de conversas em tempo real
│   │   │   ├── apoio.tsx         # Central de Apoio e agendamentos
│   │   │   ├── especialista.tsx  # Painel de gestão do psicólogo
│   │   │   ├── dashboard.tsx     # Área do paciente
│   │   │   └── cads.tsx          # Cadastro segregado
│   │   ├── components/           # Componentes reutilizáveis (MessageBubble, Button, Input)
│   │   ├── hooks/                # Hooks customizados (useChat com WebSocket)
│   │   ├── services/             # Clientes de API (Axios, Auth, Clínica, Conteúdo)
│   │   └── types/                # Interfaces TypeScript estritas
│   └── package.json              # Dependências React Native / Expo
│
├── .gitignore                    # Higienização de credenciais, logs e builds
└── README.md                     # Documentação oficial
```

---

## 🚀 Principais Módulos & Funcionalidades

### 1. 💬 Chat em Tempo Real Bidirecional (WebSocket STOMP + REST)
- Comunicação instantânea e segura entre psicólogo e paciente.
- Protocolo **STOMP** com broker em `/topic/chat/{chatId}` e envio em `/app/chat/{chatId}/enviar`.
- **Deduplicação de mensagens**, tratamento otimista na interface e fallback automático via REST.
- Indicador visual preciso de quem enviou cada mensagem baseado estritamente na identidade autenticada (`remetenteId === usuarioLogado.id`).

### 2. 🩺 Painel Clínico Multi-Psicólogo
- **Isolamento de Dados (Multi-Tenancy):** Cada psicólogo gerencia exclusivamente seus pacientes, agenda e finanças (identificação segura pelo token JWT, sem ID spoofing).
- **Métricas em Tempo Real:** Sessões do dia, total de pacientes e taxa de presença percentual calculada.
- **Controle de Presença:** Marcação de `PRESENTE` ou `FALTOU` com recálculo instantâneo de indicadores.
- **Prontuários Eletrônicos (PEP):** Gestão de anotações confidenciais e evolução clínica em conformidade com a **LGPD**.
- **Gestão de Horários:** Configuração da grade semanal de disponibilidade e bloqueios.
- **Módulo Financeiro:** Controle de fluxo de caixa (valores recebidos e a receber) com suporte a PIX, Cartão e Dinheiro.

### 3. 📅 Agendamento Inteligente do Paciente
- Busca de **slots livres reais** com base na disponibilidade do psicólogo e nas consultas já marcadas.
- **Política de Cancelamento:** Regra de negócio que exige antecedência mínima de 24 horas para cancelamento direto pelo paciente.

### 4. 🆘 Central de Apoio & Emergência Emocional
- Especialistas reais listados dinamicamente do banco de dados com notas e especialidades.
- **Plantão CVV 188:** Acesso emergencial com confirmação de segurança e discagem nativa (`Linking.openURL('tel:188')`).
- **Artigos & Podcasts:** Acervo educativo de saúde mental com leitor modal e player de áudios guiados.

### 5. 🔐 Segurança e Autenticação Robusta
- Criptografia de senhas com **BCrypt**.
- Tokens **JWT Stateless** transmitidos no header `Authorization: Bearer <token>`.
- Validação no cliente e no servidor com feedback de campos específicos (HTTP 409 Conflict padronizado).
- Bloqueio de submissão duplicada no cadastro com estados de carregamento reativos.

---

## 🧪 Qualidade de Software & Testes

- **Back-End:** Suíte de 16 testes automatizados cobrindo controllers, regras de negócio e WebSocket:
  ```text
  [INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
  [INFO] BUILD SUCCESS
  ```
- **Front-End:** TypeScript com tipagem estrita e validação de compilação com **0 erros** (`npx tsc --noEmit`).

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- **Java 21 (LTS)** e **Maven 3.9+**
- **Node.js 18+** e **npm**
- **MySQL 8.0**

### 1. Inicializando o Banco de Dados
```sql
CREATE DATABASE acolher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Executando o Back-End (Spring Boot)
```bash
cd "Back-End APP/psicologo-app"
mvn spring-boot:run
```
> O servidor iniciará na porta `8080`.  
> Documentação Swagger: `http://localhost:8080/swagger-ui.html`

### 3. Executando o Front-End (Expo Mobile)
```bash
cd "Front-End APP"
npm install
npx expo start
```
> Abra o app **Expo Go** no seu smartphone (iOS ou Android) e escaneie o QR Code gerado no terminal.

---

## 👨‍💻 Autor

Desenvolvido por **[Matheus Guimarães](https://github.com/jmatheusz)**  
*Engenheiro de Software • Java • Spring Boot • React Native • Full-Stack Developer*
