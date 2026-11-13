# 🧠 Projeto Acolher — Back-End API

> **API RESTful e WebSocket em tempo real para conectar psicólogos e pacientes, com gestão clínica completa, agendamentos inteligentes e prontuários eletrônicos seguros (LGPD).**

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.5-green?style=for-the-badge&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-blue?style=for-the-badge&logo=springsecurity)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-red?style=for-the-badge&logo=socketdotio)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0202?style=for-the-badge&logo=flyway)
![Tests](https://img.shields.io/badge/Tests-16%20Passing-brightgreen?style=for-the-badge&logo=junit5)

---

## 📌 Visão Geral

O **Acolher** é uma plataforma multi-psicólogo concebida para aproximar profissionais da saúde mental e pacientes que necessitam de acolhimento. O Back-End foi construído priorizando **segurança rígida**, **alta performance**, **desacoplamento em camadas** e estrita conformidade com a **LGPD (Lei Geral de Proteção de Dados)**.

---

## 🚀 Tecnologias e Arquitetura

### **Stack Tecnológica:**
- **Linguagem:** Java 21 (LTS)
- **Framework Principal:** Spring Boot 3.5.5
- **Segurança & Auth:** Spring Security 6 + JJWT (Stateless, BCrypt)
- **Mensageria & Tempo Real:** Spring WebSocket com protocolo STOMP
- **Persistência de Dados:** Spring Data JPA + Hibernate ORM
- **Banco de Dados:** MySQL 8.0
- **Versionamento de Schema:** Flyway Migrations (V1 a V4)
- **Validação de Dados:** Jakarta Bean Validation (Hibernate Validator)
- **Tratamento de Exceções:** `@RestControllerAdvice` padronizado em RFC 7807 (`application/problem+json`)
- **Documentação de API:** SpringDoc OpenAPI 3 / Swagger UI
- **Testes Automatizados:** JUnit 5, Mockito e Spring MockMvc

### **Princípios de Engenharia Aplicados:**
- **Clean Architecture & SOLID:** Separação estrita entre `Controller`, `Service`, `Repository`, `Entity` e `DTO`.
- **Zero Exposure of Entities:** Entidades de domínio nunca são expostas na camada web; uso exclusivo de DTOs (Java Records).
- **Multi-Tenancy por Contexto de Segurança:** Nenhum psicólogo tem acesso a dados (agenda, finanças, prontuários) de outro colega; a identidade é obtida do `SecurityContextHolder` via JWT, impedindo ID Spoofing.
- **Compliance com LGPD:** Prontuários e anotações clínicas sensíveis são estritamente isolados e protegidos por sigilo profissional.
- **12-Factor App:** Configurações externalizadas via variáveis de ambiente (`${DB_PASSWORD:}`, `${JWT_SECRET:...}`).

---

## 🧩 Módulos Implementados

### 1. 🔐 Autenticação & Identidade
- Cadastro segregado para perfis `PACIENTE` e `ESPECIALISTA`.
- Hashing de senhas seguro com BCrypt.
- Emissão e validação de tokens JWT stateless.
- Tratamento granular de erros de unicidade (HTTP 409 Conflict) com feedback de campo para o cliente.

### 2. 💬 Chat em Tempo Real (WebSocket + STOMP)
- Broker de mensagens em tempo real para conversas privadas entre psicólogo e paciente.
- Fallback automático para REST APIs com paginação e ordenação cronológica.
- Indicadores de leitura (`marcarComoLida`) e contador de mensagens não lidas.
- Payload seguro desacoplado de IDs de sessão efêmeros.

### 3. 🩺 Painel Clínico do Especialista
- **Métricas Operacionais:** Total de sessões do dia, pacientes ativos e taxa de presença calculada.
- **Controle de Frequência:** Marcação rápida de comparecimento (`PRESENTE` / `FALTOU`) com impacto direto no histórico do paciente.
- **Prontuários Eletrônicos (PEP):** Registro confidencial de anotações de evolução clínica sob normas da LGPD.
- **Gestão de Horários:** Configuração da grade de atendimento semanal (dias, intervalos e duração de sessão) com bloqueios customizados.
- **Gestão Financeira:** Controle de fluxo de caixa (recebido, pendente e previsto) com suporte a PIX, Cartão e Dinheiro.

### 4. 📅 Motor de Agendamento do Paciente
- Cálculo dinâmico de *slots livres* em tempo real baseado na disponibilidade do profissional e conflitos de agenda.
- Política de cancelamento inteligente com validação de antecedência mínima de 24 horas.

### 5. 📚 Central de Conteúdo Educativo
- Publicação e listagem de Artigos de apoio à saúde mental.
- Catálogo de Áudios e Podcasts guiados para acompanhamento terapêutico.

---

## 🗄️ Histórico de Migrations (Flyway)

| Versão | Descrição |
|:---:|:---|
| `V1` | Schema inicial (tabelas de Usuários, Tokens e Permissões). |
| `V2` | Seed de especialistas e perfis com verificação ativa. |
| `V3` | Estrutura de Gestão Clínica: `Disponibilidade`, `Bloqueio_Agenda`, `Consulta`, `Prontuario` e `Pagamento`. |
| `V4` | Seed de dados clínicos para desenvolvimento e tabelas de `Artigo` e `Podcast`. |

---

## 🧪 Qualidade de Software & Testes

A suíte de testes cobre regras críticas de negócio, fluxos de segurança e controladores:

```bash
mvn test
```

```text
[INFO] Results:
[INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

- **`CadastroServiceTest`:** Validação de regras de negócio, duplicação e inicialização atômica de especialistas.
- **`AuthControllerTest`:** Testes de integração de endpoints de autenticação e validação de DTOs.
- **`ChatControllerTest` & `ChatServiceTest`:** Validação de autorização de canais e entrega de mensagens.
- **`MessageServiceTest`:** Garantia de integridade e idempotência nas mensagens.

---

## ⚙️ Como Executar Localmente

### Pré-requisitos
- **Java 21** instalado (`java -version`)
- **Maven 3.9+**
- **MySQL 8.0** em execução na porta `3306`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jmatheusz/psicologo-app-backend.git
   cd psicologo-app-backend
   ```

2. **Configure o banco de dados:**
   Crie o banco no MySQL:
   ```sql
   CREATE DATABASE acolher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Configure as credenciais:**
   Crie um arquivo `src/main/resources/application-local.properties` (já incluso no `.gitignore`):
   ```properties
   spring.datasource.password=sua_senha_mysql
   app.jwt.secret=seu_secret_base64_gerado
   ```

4. **Execute a aplicação:**
   ```bash
   mvn spring-boot:run
   ```

5. **Acesse a documentação interativa (Swagger):**
   ```text
   http://localhost:8080/swagger-ui.html
   ```

---

## 📈 Histórico Recente de Commits

- `3faa596` — **feat: atualizacao completa das fases 1 a 5 no backend**
  - Implementação do WebSocket STOMP para chat em tempo real.
  - Implementação dos serviços clínicos (consultas, presença, prontuários LGPD e finanças).
  - Adição das migrations V3 e V4 do Flyway.
  - Testes unitários e de integração com cobertura das novas regras de negócio.
  - Sanitização de configurações sensíveis seguindo o padrão 12-Factor App.

---

## 👨‍💻 Autor

Desenvolvido por **[Matheus Guimarães](https://github.com/jmatheusz)**  
*Engenharia de Software • Java & Spring Boot • Full-Stack Developer*
