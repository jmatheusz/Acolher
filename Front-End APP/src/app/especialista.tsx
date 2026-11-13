import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "../services/auth";
import {
  alternarDisponibilidade,
  atualizarStatusPagamento,
  criarPagamento,
  criarProntuario,
  listarConsultas,
  listarDisponibilidade,
  listarPacientes,
  listarProntuarios,
  marcarPresenca,
  obterFinancas,
  obterPainelClinico,
  salvarDisponibilidade,
} from "../services/clinica";
import { listarConversas } from "../services/chat";
import { getNomeUsuario } from "../services/perfil";
import {
  Comparecimento,
  Consulta,
  Disponibilidade,
  PacienteResumo,
  Pagamento,
  PainelClinico,
  Prontuario,
  ResumoFinanceiro,
} from "../types/clinica";
import { ChatSummary } from "../types/chat";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DIAS_SEMANA = [
  { id: 1, label: "Seg", nome: "Segunda-feira" },
  { id: 2, label: "Ter", nome: "Terça-feira" },
  { id: 3, label: "Qua", nome: "Quarta-feira" },
  { id: 4, label: "Qui", nome: "Quinta-feira" },
  { id: 5, label: "Sex", nome: "Sexta-feira" },
  { id: 6, label: "Sáb", nome: "Sábado" },
];

export default function DashboardEspecialista() {
  const router = useRouter();

  const [nomeEspecialista, setNomeEspecialista] = useState("Dr(a).");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [telaAtiva, setTelaAtiva] = useState<
    "home" | "pacientes" | "presenca" | "prontuarios" | "horarios" | "financas" | "chats"
  >("home");

  // Dados reais do painel
  const [painel, setPainel] = useState<PainelClinico>({
    sessoesHoje: 0,
    totalPacientes: 0,
    taxaPresenca: 100,
    totalPresencas: 0,
    totalFaltas: 0,
    totalRecebido: 0,
    totalAReceber: 0,
    agendaHoje: [],
  });

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<PacienteResumo[]>([]);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [financas, setFinancas] = useState<ResumoFinanceiro>({
    totalRecebido: 0,
    totalAReceber: 0,
    totalGeral: 0,
    quantidadeLancamentos: 0,
    lancamentos: [],
  });
  const [chats, setChats] = useState<ChatSummary[]>([]);

  // Filtros e buscas
  const [pesquisaProntuario, setPesquisaProntuario] = useState("");
  const [pesquisaChat, setPesquisaChat] = useState("");
  const [pesquisaPaciente, setPesquisaPaciente] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState<number>(1);
  const [expandido, setExpandido] = useState(false);

  // Modais
  const [modalMetricaVisivel, setModalMetricaVisivel] = useState(false);
  const [modalNovoProntuario, setModalNovoProntuario] = useState(false);
  const [modalNovoHorario, setModalNovoHorario] = useState(false);
  const [modalNovoLancamento, setModalNovoLancamento] = useState(false);
  const [verProntuarioDetalhes, setVerProntuarioDetalhes] = useState<Prontuario | null>(null);
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null);

  // Form states
  const [formProntuario, setFormProntuario] = useState({
    pacienteId: 0,
    titulo: "",
    anotacoes: "",
    evolucao: "",
  });

  const [formHorario, setFormHorario] = useState({
    diaSemana: 1,
    horaInicio: "08:00",
    horaFim: "18:00",
    duracaoMinutos: 50,
  });

  const [formLancamento, setFormLancamento] = useState({
    pacienteId: 0,
    valor: "150.00",
    formaPagamento: "PIX",
    descricao: "Sessão de Psicoterapia",
  });

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [nome, dadosPainel, listaCons, listaPac, listaPron, listaDisp, dadosFin, listaCh] =
        await Promise.allSettled([
          getNomeUsuario(),
          obterPainelClinico(),
          listarConsultas(),
          listarPacientes(),
          listarProntuarios(),
          listarDisponibilidade(),
          obterFinancas(),
          listarConversas(),
        ]);

      if (nome.status === "fulfilled" && nome.value) setNomeEspecialista(nome.value);
      if (dadosPainel.status === "fulfilled") setPainel(dadosPainel.value);
      if (listaCons.status === "fulfilled") setConsultas(listaCons.value);
      if (listaPac.status === "fulfilled") setPacientes(listaPac.value);
      if (listaPron.status === "fulfilled") setProntuarios(listaPron.value);
      if (listaDisp.status === "fulfilled") setDisponibilidades(listaDisp.value);
      if (dadosFin.status === "fulfilled") setFinancas(dadosFin.value);
      if (listaCh.status === "fulfilled") setChats(listaCh.value);
    } catch (err) {
      console.error("Erro ao carregar dados clínicos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    carregarTudo();
  };

  const toggleExpandir = (valor: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(valor);
  };

  // --- Handlers de Presença ---
  const handleMarcarPresenca = async (consultaId: number, comp: Comparecimento) => {
    try {
      const atualizada = await marcarPresenca(consultaId, comp);
      // Atualiza lista local
      setConsultas((prev) => prev.map((c) => (c.id === consultaId ? atualizada : c)));
      setPainel((prev) => ({
        ...prev,
        agendaHoje: prev.agendaHoje.map((c) => (c.id === consultaId ? atualizada : c)),
      }));
      // Recarrega métricas do painel
      const novoPainel = await obterPainelClinico();
      setPainel(novoPainel);
      Alert.alert("Sucesso", `Presença marcada como: ${comp === "PRESENTE" ? "Presente" : "Falta"}`);
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.message || "Não foi possível registrar presença.");
    }
  };

  // --- Handlers de Prontuário ---
  const handleSalvarProntuario = async () => {
    if (!formProntuario.pacienteId || !formProntuario.titulo || !formProntuario.anotacoes) {
      Alert.alert("Atenção", "Selecione o paciente, informe o título e as anotações clínicas.");
      return;
    }
    try {
      const novo = await criarProntuario({
        pacienteId: formProntuario.pacienteId,
        titulo: formProntuario.titulo,
        anotacoes: formProntuario.anotacoes,
        evolucao: formProntuario.evolucao,
      });
      setProntuarios((prev) => [novo, ...prev]);
      setModalNovoProntuario(false);
      setFormProntuario({ pacienteId: 0, titulo: "", anotacoes: "", evolucao: "" });
      Alert.alert("Sucesso", "Prontuário confidencial registrado com segurança (LGPD).");
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.message || "Erro ao salvar prontuário.");
    }
  };

  // --- Handlers de Horários ---
  const handleToggleHorarioAtivo = async (id: number) => {
    try {
      await alternarDisponibilidade(id);
      setDisponibilidades((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ativo: !d.ativo } : d)),
      );
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível atualizar o horário.");
    }
  };

  const handleSalvarNovoHorario = async () => {
    try {
      const novo = await salvarDisponibilidade({
        diaSemana: formHorario.diaSemana,
        horaInicio: formHorario.horaInicio,
        horaFim: formHorario.horaFim,
        duracaoMinutos: formHorario.duracaoMinutos,
        ativo: true,
      });
      setDisponibilidades((prev) => [...prev, novo]);
      setModalNovoHorario(false);
      Alert.alert("Sucesso", "Grade de horário cadastrada!");
    } catch (err: any) {
      Alert.alert("Erro", "Erro ao cadastrar horário.");
    }
  };

  // --- Handlers de Finanças ---
  const handleToggleStatusPagamento = async (id: number, statusAtual: string) => {
    try {
      const novoStatus = statusAtual === "PAGO" ? "PENDENTE" : "PAGO";
      const atualizado = await atualizarStatusPagamento(id, novoStatus);
      setFinancas((prev) => ({
        ...prev,
        lancamentos: prev.lancamentos.map((l) => (l.id === id ? atualizado : l)),
      }));
      const novasFinancas = await obterFinancas();
      setFinancas(novasFinancas);
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível alterar status do pagamento.");
    }
  };

  const handleSalvarLancamento = async () => {
    if (!formLancamento.pacienteId || !formLancamento.valor) {
      Alert.alert("Atenção", "Selecione o paciente e informe o valor.");
      return;
    }
    try {
      const valorNum = parseFloat(formLancamento.valor.replace(",", "."));
      const hoje = new Date().toISOString().split("T")[0];
      await criarPagamento({
        pacienteId: formLancamento.pacienteId,
        valor: valorNum,
        formaPagamento: formLancamento.formaPagamento,
        descricao: formLancamento.descricao,
        dataVencimento: hoje,
        status: "PAGO",
      });
      const novasFinancas = await obterFinancas();
      setFinancas(novasFinancas);
      setModalNovoLancamento(false);
      Alert.alert("Sucesso", "Lançamento financeiro registrado!");
    } catch (err: any) {
      Alert.alert("Erro", "Erro ao salvar lançamento financeiro.");
    }
  };

  // Filtros em memória
  const prontuariosFiltrados = prontuarios.filter(
    (p) =>
      p.pacienteNome.toLowerCase().includes(pesquisaProntuario.toLowerCase()) ||
      p.titulo.toLowerCase().includes(pesquisaProntuario.toLowerCase()),
  );

  const chatsFiltrados = chats.filter((c) =>
    c.outroParticipanteNome.toLowerCase().includes(pesquisaChat.toLowerCase()),
  );

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nomeCompleto.toLowerCase().includes(pesquisaPaciente.toLowerCase()) ||
      p.email.toLowerCase().includes(pesquisaPaciente.toLowerCase()),
  );

  const disponibilidadesDoDia = disponibilidades.filter((d) => d.diaSemana === diaSelecionado);

  const dadosAgenda = expandido ? painel.agendaHoje : painel.agendaHoje.slice(0, 3);

  return (
    <View style={styles.masterContainer}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.container} edges={["right", "left"]}>
        {/* Header */}
        <View style={styles.header}>
          {telaAtiva === "home" ? (
            <View>
              <Text style={styles.welcomeText}>Olá, {nomeEspecialista}</Text>
              <Text style={styles.doctorName}>Painel Clínico</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.backHeaderButton}
              onPress={() => setTelaAtiva("home")}
            >
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
              <Text style={styles.doctorNameHeader}>
                {telaAtiva === "pacientes" && "Meus Pacientes"}
                {telaAtiva === "presenca" && "Controle de Presença"}
                {telaAtiva === "prontuarios" && "Prontuários Clínicos"}
                {telaAtiva === "horarios" && "Meus Horários"}
                {telaAtiva === "financas" && "Finanças Clínicas"}
                {telaAtiva === "chats" && "Conversas"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert("Confirmar saída", "Deseja realmente sair da sua conta?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sim",
                  onPress: async () => {
                    await logout();
                    router.replace("/");
                  },
                },
              ]);
            }}
          >
            <Feather name="log-out" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#00BFA5" />
            <Text style={styles.loadingText}>Carregando dados clínicos...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* TELA: HOME */}
            {telaAtiva === "home" && (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
              >
                {/* Métricas Principais */}
                <View style={styles.metricsContainer}>
                  <TouchableOpacity
                    style={styles.metricCard}
                    onPress={() => setModalMetricaVisivel(true)}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={20} color="#00BFA5" />
                    <Text style={styles.metricValue}>{painel.sessoesHoje}</Text>
                    <Text style={styles.metricLabel}>Sessões Hoje</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.metricCard}
                    onPress={() => setTelaAtiva("pacientes")}
                    activeOpacity={0.7}
                  >
                    <Feather name="users" size={20} color="#00238e" />
                    <Text style={styles.metricValue}>{painel.totalPacientes}</Text>
                    <Text style={styles.metricLabel}>Pacientes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.metricCard}
                    onPress={() => setTelaAtiva("presenca")}
                    activeOpacity={0.7}
                  >
                    <Feather name="trending-up" size={20} color="#FF9100" />
                    <Text style={styles.metricValue}>{painel.taxaPresenca}%</Text>
                    <Text style={styles.metricLabel}>Presença</Text>
                  </TouchableOpacity>
                </View>

                {/* Ações Rápidas */}
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setTelaAtiva("prontuarios")}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: "#E0F2F1" }]}>
                      <Feather name="file-text" size={20} color="#00BFA5" />
                    </View>
                    <Text style={styles.actionText}>Prontuários</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setTelaAtiva("horarios")}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: "#E8EAF6" }]}>
                      <Feather name="clock" size={20} color="#00238e" />
                    </View>
                    <Text style={styles.actionText}>Meus Horários</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setTelaAtiva("financas")}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                      <Feather name="dollar-sign" size={20} color="#FF9100" />
                    </View>
                    <Text style={styles.actionText}>Finanças</Text>
                  </TouchableOpacity>
                </View>

                {/* Agenda de Hoje */}
                <View style={styles.agendaWrapper}>
                  <View style={styles.agendaHeader}>
                    <Text style={styles.agendaSectionTitle}>Agenda de Hoje</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countIndicator}>
                        {painel.agendaHoje.length} atendimentos
                      </Text>
                    </View>
                  </View>

                  {painel.agendaHoje.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Feather name="check-circle" size={32} color="#00BFA5" />
                      <Text style={styles.emptyTitle}>Sem consultas pendentes para hoje</Text>
                      <Text style={styles.emptySubtitle}>
                        Seus pacientes agendados aparecerão aqui automaticamente.
                      </Text>
                    </View>
                  ) : (
                    dadosAgenda.map((item) => (
                      <View key={item.id} style={styles.appointmentCard}>
                        <View style={styles.cardHeaderRow}>
                          <View style={styles.appointmentInfo}>
                            <Feather
                              name="clock"
                              size={15}
                              color="#00BFA5"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.appointmentTime}>{item.horaInicio}</Text>
                            <Text style={styles.appointmentPatient}> - {item.pacienteNome}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusTag,
                              {
                                backgroundColor:
                                  item.status === "CONFIRMADA" ? "#E0F2F1" : "#FFF3E0",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: item.status === "CONFIRMADA" ? "#00BFA5" : "#FF9100",
                                },
                              ]}
                            >
                              {item.status}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.appointmentType}>
                          {item.tipo.replace("_", " ")} • {item.modalidade}
                        </Text>

                        {/* Presença Rápida */}
                        <View style={styles.presencaActionsRow}>
                          <Text style={styles.presencaLabel}>Presença:</Text>
                          <TouchableOpacity
                            style={[
                              styles.presencaBtn,
                              item.compareceu === "PRESENTE" && styles.presencaBtnPresenteAtivo,
                            ]}
                            onPress={() => handleMarcarPresenca(item.id, "PRESENTE")}
                          >
                            <Feather
                              name="check"
                              size={14}
                              color={item.compareceu === "PRESENTE" ? "#FFFFFF" : "#00BFA5"}
                            />
                            <Text
                              style={[
                                styles.presencaBtnText,
                                item.compareceu === "PRESENTE" && { color: "#FFFFFF" },
                              ]}
                            >
                              Presente
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.presencaBtn,
                              item.compareceu === "FALTOU" && styles.presencaBtnFaltaAtivo,
                            ]}
                            onPress={() => handleMarcarPresenca(item.id, "FALTOU")}
                          >
                            <Feather
                              name="x"
                              size={14}
                              color={item.compareceu === "FALTOU" ? "#FFFFFF" : "#D32F2F"}
                            />
                            <Text
                              style={[
                                styles.presencaBtnText,
                                item.compareceu === "FALTOU" && { color: "#FFFFFF" },
                              ]}
                            >
                              Faltou
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}

                  {painel.agendaHoje.length > 3 && (
                    <TouchableOpacity
                      style={styles.toggleAgendaButton}
                      onPress={() => toggleExpandir(!expandido)}
                    >
                      <Text style={styles.toggleAgendaText}>
                        {expandido ? "Recolher agenda" : "Mostrar agenda completa"}
                      </Text>
                      <Feather
                        name={expandido ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#00238e"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}

            {/* TELA: CONTROLE DE PRESENÇA */}
            {telaAtiva === "presenca" && (
              <View style={{ flex: 1 }}>
                <View style={styles.presencaBanner}>
                  <Text style={styles.presencaBannerTaxa}>{painel.taxaPresenca}%</Text>
                  <Text style={styles.presencaBannerDesc}>
                    Taxa média de comparecimento nas suas sessões.
                  </Text>
                  <View style={styles.presencaBannerStats}>
                    <Text style={styles.presencaBannerSub}>
                      Presentes: {painel.totalPresencas} | Faltas: {painel.totalFaltas}
                    </Text>
                  </View>
                </View>

                <FlatList
                  data={consultas}
                  keyExtractor={(item) => "pres-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>Nenhuma consulta registrada</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.prontuarioCard}>
                      <View style={styles.prontuarioMainInfo}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.prontuarioPatientName}>{item.pacienteNome}</Text>
                          <Text style={styles.prontuarioPatientAge}>
                            {item.dataConsulta} às {item.horaInicio} ({item.modalidade})
                          </Text>
                        </View>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            style={[
                              styles.presencaBtn,
                              item.compareceu === "PRESENTE" && styles.presencaBtnPresenteAtivo,
                            ]}
                            onPress={() => handleMarcarPresenca(item.id, "PRESENTE")}
                          >
                            <Feather
                              name="check"
                              size={14}
                              color={item.compareceu === "PRESENTE" ? "#FFF" : "#00BFA5"}
                            />
                            <Text
                              style={[
                                styles.presencaBtnText,
                                item.compareceu === "PRESENTE" && { color: "#FFF" },
                              ]}
                            >
                              Presente
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.presencaBtn,
                              item.compareceu === "FALTOU" && styles.presencaBtnFaltaAtivo,
                            ]}
                            onPress={() => handleMarcarPresenca(item.id, "FALTOU")}
                          >
                            <Feather
                              name="x"
                              size={14}
                              color={item.compareceu === "FALTOU" ? "#FFF" : "#D32F2F"}
                            />
                            <Text
                              style={[
                                styles.presencaBtnText,
                                item.compareceu === "FALTOU" && { color: "#FFF" },
                              ]}
                            >
                              Falta
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* TELA: PRONTUÁRIOS CLÍNICOS (LGPD) */}
            {telaAtiva === "prontuarios" && (
              <View style={{ flex: 1 }}>
                <View style={styles.topActionsRow}>
                  <View style={[styles.searchContainer, { flex: 1, marginBottom: 0 }]}>
                    <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar por paciente ou queixa..."
                      placeholderTextColor="#94A3B8"
                      value={pesquisaProntuario}
                      onChangeText={setPesquisaProntuario}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.btnNovoTop}
                    onPress={() => setModalNovoProntuario(true)}
                  >
                    <Feather name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.btnNovoTopText}>Novo</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={prontuariosFiltrados}
                  keyExtractor={(item) => "pron-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>Nenhum prontuário encontrado</Text>
                      <Text style={styles.emptySubtitle}>
                        Clique em "+ Novo" para cadastrar um prontuário confidencial.
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.prontuarioCard}>
                      <View style={styles.prontuarioMainInfo}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.prontuarioPatientName}>{item.pacienteNome}</Text>
                          <Text style={styles.prontuarioPatientAge}>
                            {item.titulo} • {item.dataRegistro}
                          </Text>
                        </View>
                        <View style={styles.lgpdBadge}>
                          <Feather name="lock" size={12} color="#00BFA5" />
                          <Text style={styles.lgpdText}>LGPD</Text>
                        </View>
                      </View>

                      {verProntuarioDetalhes?.id === item.id ? (
                        <View style={styles.historicoExpandidoBox}>
                          <Text style={styles.historicoTitle}>Anotações Clínicas Confidenciais:</Text>
                          <Text style={styles.historicoText}>{item.anotacoes}</Text>
                          {item.evolucao ? (
                            <>
                              <Text style={[styles.historicoTitle, { marginTop: 12 }]}>
                                Evolução:
                              </Text>
                              <Text style={styles.historicoText}>{item.evolucao}</Text>
                            </>
                          ) : null}
                          <TouchableOpacity
                            style={styles.fecharProntuarioBtn}
                            onPress={() => setVerProntuarioDetalhes(null)}
                          >
                            <Text style={styles.fecharProntuarioBtnText}>Fechar Prontuário</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.abrirProntuarioBtn}
                          onPress={() => setVerProntuarioDetalhes(item)}
                        >
                          <Feather name="folder" size={16} color="#00238e" style={{ marginRight: 6 }} />
                          <Text style={styles.abrirProntuarioBtnText}>Acessar Prontuário Seguro</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>
            )}

            {/* TELA: MEUS HORÁRIOS / DISPONIBILIDADE */}
            {telaAtiva === "horarios" && (
              <View style={{ flex: 1 }}>
                <View style={styles.topActionsRow}>
                  <View style={styles.daysContainer}>
                    {DIAS_SEMANA.map((dia) => (
                      <TouchableOpacity
                        key={dia.id}
                        style={[
                          styles.dayButton,
                          diaSelecionado === dia.id && styles.dayButtonActive,
                        ]}
                        onPress={() => setDiaSelecionado(dia.id)}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            diaSelecionado === dia.id && styles.dayButtonTextActive,
                          ]}
                        >
                          {dia.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.btnNovoTop}
                    onPress={() => {
                      setFormHorario((prev) => ({ ...prev, diaSemana: diaSelecionado }));
                      setModalNovoHorario(true);
                    }}
                  >
                    <Feather name="plus" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.helperText}>
                  Horários de atendimento disponíveis para agendamento pelos pacientes:
                </Text>

                <FlatList
                  data={disponibilidadesDoDia}
                  keyExtractor={(item) => "disp-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Feather name="calendar" size={32} color="#94A3B8" />
                      <Text style={styles.emptyTitle}>Nenhum horário configurado</Text>
                      <Text style={styles.emptySubtitle}>
                        Toque no "+" acima para adicionar horários neste dia.
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.rowHorario}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.horaLabel}>
                          {item.horaInicio.slice(0, 5)} às {item.horaFim.slice(0, 5)}
                        </Text>
                        <Text style={styles.horaSub}>
                          Sessões de {item.duracaoMinutos} min
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.statusBoxHorario,
                          item.ativo ? styles.boxDisponivel : styles.boxBloqueado,
                        ]}
                        onPress={() => handleToggleHorarioAtivo(item.id)}
                      >
                        <Text
                          style={[
                            styles.statusBoxText,
                            item.ativo ? styles.txtDisponivel : styles.txtBloqueado,
                          ]}
                        >
                          {item.ativo ? "Disponível" : "Pausado"}
                        </Text>
                        <Feather
                          name={item.ativo ? "unlock" : "lock"}
                          size={14}
                          color={item.ativo ? "#00BFA5" : "#D32F2F"}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {/* TELA: FINANÇAS */}
            {telaAtiva === "financas" && (
              <View style={{ flex: 1 }}>
                <View style={styles.financesSummaryContainer}>
                  <View style={[styles.financeCard, { borderColor: "#00BFA5" }]}>
                    <Text style={styles.financeCardLabel}>Faturamento Recebido</Text>
                    <Text style={[styles.financeCardValue, { color: "#00BFA5" }]}>
                      R$ {financas.totalRecebido.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.financeCard, { borderColor: "#FF9100" }]}>
                    <Text style={styles.financeCardLabel}>A Receber (Pendentes)</Text>
                    <Text style={[styles.financeCardValue, { color: "#FF9100" }]}>
                      R$ {financas.totalAReceber.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.chartSimulationBox}>
                  <View style={styles.chartHeaderRow}>
                    <Text style={styles.chartTitle}>Total Geral Previsto</Text>
                    <Text style={styles.chartPercentText}>
                      R$ {financas.totalGeral.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width:
                            financas.totalGeral > 0
                              ? `${Math.min(100, Math.round((financas.totalRecebido / financas.totalGeral) * 100))}%`
                              : "0%",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.topActionsRow}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lançamentos</Text>
                  <TouchableOpacity
                    style={styles.btnNovoTop}
                    onPress={() => setModalNovoLancamento(true)}
                  >
                    <Feather name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.btnNovoTopText}>Lançar</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={financas.lancamentos}
                  keyExtractor={(item) => "fin-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>Sem lançamentos recentes</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.transactionCard}
                      onPress={() => handleToggleStatusPagamento(item.id, item.status)}
                    >
                      <View style={styles.transactionLeft}>
                        <View style={styles.iconFinanceCircle}>
                          <Feather
                            name={item.status === "PAGO" ? "arrow-down-left" : "clock"}
                            size={16}
                            color={item.status === "PAGO" ? "#00BFA5" : "#FF9100"}
                          />
                        </View>
                        <View>
                          <Text style={styles.transactionName}>{item.pacienteNome}</Text>
                          <Text style={styles.transactionMeta}>
                            {item.dataVencimento} • {item.formaPagamento}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={styles.transactionValue}>R$ {item.valor.toFixed(2)}</Text>
                        <Text
                          style={[
                            styles.transactionStatusText,
                            { color: item.status === "PAGO" ? "#00BFA5" : "#FF9100" },
                          ]}
                        >
                          {item.status} (toque p/ alterar)
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* TELA: MEUS PACIENTES */}
            {telaAtiva === "pacientes" && (
              <View style={{ flex: 1 }}>
                <View style={styles.searchContainer}>
                  <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar paciente por nome ou e-mail..."
                    placeholderTextColor="#94A3B8"
                    value={pesquisaPaciente}
                    onChangeText={setPesquisaPaciente}
                  />
                </View>

                <FlatList
                  data={pacientesFiltrados}
                  keyExtractor={(item) => "pac-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Feather name="users" size={32} color="#94A3B8" />
                      <Text style={styles.emptyTitle}>Nenhum paciente cadastrado</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.prontuarioCard}>
                      <View style={styles.prontuarioMainInfo}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.prontuarioPatientName}>{item.nomeCompleto}</Text>
                          <Text style={styles.prontuarioPatientAge}>{item.email}</Text>
                          <Text style={[styles.prontuarioPatientAge, { color: "#00BFA5" }]}>
                            {item.totalConsultas} consultas realizadas
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.abrirChatBtn}
                          onPress={() => {
                            router.push(
                              `/chat/chat?chatId=${item.id}&nome=${encodeURIComponent(item.nomeCompleto)}`,
                            );
                          }}
                        >
                          <Feather name="message-circle" size={18} color="#00BFA5" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* TELA: CHATS */}
            {telaAtiva === "chats" && (
              <View style={{ flex: 1 }}>
                <View style={styles.searchContainer}>
                  <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar conversa pelo nome..."
                    placeholderTextColor="#94A3B8"
                    value={pesquisaChat}
                    onChangeText={setPesquisaChat}
                  />
                </View>
                <FlatList
                  data={chatsFiltrados}
                  keyExtractor={(item) => "chat-" + item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ListEmptyComponent={
                    <View style={styles.emptyCard}>
                      <Feather name="message-square" size={32} color="#94A3B8" />
                      <Text style={styles.emptyTitle}>Nenhuma conversa ativa</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.chatListItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push(
                          `/chat/chat?chatId=${item.id}&nome=${encodeURIComponent(
                            item.outroParticipanteNome,
                          )}&foto=${encodeURIComponent(item.outroParticipanteFoto || "")}`,
                        );
                      }}
                    >
                      <View style={styles.chatAvatar}>
                        <Text style={styles.chatAvatarText}>
                          {item.outroParticipanteNome.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.chatInfoBox}>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.chatPatientName} numberOfLines={1}>
                            {item.outroParticipanteNome}
                          </Text>
                          {item.ultimaMensagemHorario && (
                            <Text style={styles.chatTimeText}>
                              {item.ultimaMensagemHorario.slice(11, 16)}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.chatLastMessage} numberOfLines={1}>
                          {item.ultimaMensagem || "Nenhuma mensagem ainda."}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        )}

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.tabBarButton}
            onPress={() => setTelaAtiva("home")}
          >
            <Feather
              name="home"
              size={22}
              color={telaAtiva === "home" ? "#00BFA5" : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabBarText,
                { color: telaAtiva === "home" ? "#00BFA5" : "#94A3B8" },
              ]}
            >
              Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBarButton}
            onPress={() => setTelaAtiva("pacientes")}
          >
            <Feather
              name="users"
              size={22}
              color={telaAtiva === "pacientes" ? "#00BFA5" : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabBarText,
                { color: telaAtiva === "pacientes" ? "#00BFA5" : "#94A3B8" },
              ]}
            >
              Pacientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBarButton}
            onPress={() => setTelaAtiva("presenca")}
          >
            <Feather
              name="check-square"
              size={22}
              color={telaAtiva === "presenca" ? "#00BFA5" : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabBarText,
                { color: telaAtiva === "presenca" ? "#00BFA5" : "#94A3B8" },
              ]}
            >
              Agenda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBarButton}
            onPress={() => setTelaAtiva("chats")}
          >
            <Feather
              name="message-square"
              size={22}
              color={telaAtiva === "chats" ? "#00BFA5" : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabBarText,
                { color: telaAtiva === "chats" ? "#00BFA5" : "#94A3B8" },
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal: Métricas do Painel */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalMetricaVisivel}
          onRequestClose={() => setModalMetricaVisivel(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalMetricaVisivel(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Status dos Atendimentos</Text>
                    <TouchableOpacity onPress={() => setModalMetricaVisivel(false)}>
                      <Feather name="x" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalBody}>
                    <Text style={styles.modalPatientName}>Resumo do Dia</Text>
                    <View style={styles.statusReportContainer}>
                      <View style={styles.statusReportRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#00BFA5" }]} />
                        <Text style={styles.statusReportLabel}>Sessões Hoje:</Text>
                        <Text style={styles.statusReportValue}>{painel.sessoesHoje}</Text>
                      </View>
                      <View style={styles.statusReportRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#00238e" }]} />
                        <Text style={styles.statusReportLabel}>Pacientes Ativos:</Text>
                        <Text style={styles.statusReportValue}>{painel.totalPacientes}</Text>
                      </View>
                      <View style={styles.statusReportRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#FF9100" }]} />
                        <Text style={styles.statusReportLabel}>Taxa de Presença:</Text>
                        <Text style={styles.statusReportValue}>{painel.taxaPresenca}%</Text>
                      </View>
                      <View style={styles.statusReportRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#00BFA5" }]} />
                        <Text style={styles.statusReportLabel}>Total Recebido Mês:</Text>
                        <Text style={styles.statusReportValue}>
                          R$ {painel.totalRecebido.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal: Novo Prontuário */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalNovoProntuario}
          onRequestClose={() => setModalNovoProntuario(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalFormContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo Prontuário Clínico (LGPD)</Text>
                <TouchableOpacity onPress={() => setModalNovoProntuario(false)}>
                  <Feather name="x" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 16 }}>
                <Text style={styles.formLabel}>Selecione o Paciente:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {pacientes.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.chipPaciente,
                        formProntuario.pacienteId === p.id && styles.chipPacienteAtivo,
                      ]}
                      onPress={() => setFormProntuario((prev) => ({ ...prev, pacienteId: p.id }))}
                    >
                      <Text
                        style={[
                          styles.chipPacienteText,
                          formProntuario.pacienteId === p.id && styles.chipPacienteTextAtivo,
                        ]}
                      >
                        {p.nomeCompleto}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Título / Queixa Principal:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Sessão 3 - Mapeamento de Ansiedade"
                  placeholderTextColor="#94A3B8"
                  value={formProntuario.titulo}
                  onChangeText={(v) => setFormProntuario((prev) => ({ ...prev, titulo: v }))}
                />

                <Text style={styles.formLabel}>Anotações Clínicas Confidenciais:</Text>
                <TextInput
                  style={[styles.modalInput, { height: 90, textAlignVertical: "top" }]}
                  placeholder="Relato clínico, intervenções realizadas..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={formProntuario.anotacoes}
                  onChangeText={(v) => setFormProntuario((prev) => ({ ...prev, anotacoes: v }))}
                />

                <Text style={styles.formLabel}>Evolução / Próximos Passos (opcional):</Text>
                <TextInput
                  style={[styles.modalInput, { height: 60, textAlignVertical: "top" }]}
                  placeholder="Metas terapêuticas para a próxima sessão..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={formProntuario.evolucao}
                  onChangeText={(v) => setFormProntuario((prev) => ({ ...prev, evolucao: v }))}
                />

                <TouchableOpacity
                  style={styles.btnSalvarModal}
                  onPress={handleSalvarProntuario}
                >
                  <Text style={styles.btnSalvarModalText}>Salvar Prontuário</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal: Novo Horário */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalNovoHorario}
          onRequestClose={() => setModalNovoHorario(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalFormContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Configurar Horário de Atendimento</Text>
                <TouchableOpacity onPress={() => setModalNovoHorario(false)}>
                  <Feather name="x" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.formLabel}>Dia da Semana:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {DIAS_SEMANA.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.chipPaciente,
                        formHorario.diaSemana === d.id && styles.chipPacienteAtivo,
                      ]}
                      onPress={() => setFormHorario((prev) => ({ ...prev, diaSemana: d.id }))}
                    >
                      <Text
                        style={[
                          styles.chipPacienteText,
                          formHorario.diaSemana === d.id && styles.chipPacienteTextAtivo,
                        ]}
                      >
                        {d.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Hora Início (HH:mm):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="08:00"
                  placeholderTextColor="#94A3B8"
                  value={formHorario.horaInicio}
                  onChangeText={(v) => setFormHorario((prev) => ({ ...prev, horaInicio: v }))}
                />

                <Text style={styles.formLabel}>Hora Fim (HH:mm):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="18:00"
                  placeholderTextColor="#94A3B8"
                  value={formHorario.horaFim}
                  onChangeText={(v) => setFormHorario((prev) => ({ ...prev, horaFim: v }))}
                />

                <TouchableOpacity
                  style={styles.btnSalvarModal}
                  onPress={handleSalvarNovoHorario}
                >
                  <Text style={styles.btnSalvarModalText}>Salvar Horário</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Novo Lançamento Financeiro */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalNovoLancamento}
          onRequestClose={() => setModalNovoLancamento(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalFormContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo Lançamento Financeiro</Text>
                <TouchableOpacity onPress={() => setModalNovoLancamento(false)}>
                  <Feather name="x" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.formLabel}>Paciente:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {pacientes.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.chipPaciente,
                        formLancamento.pacienteId === p.id && styles.chipPacienteAtivo,
                      ]}
                      onPress={() => setFormLancamento((prev) => ({ ...prev, pacienteId: p.id }))}
                    >
                      <Text
                        style={[
                          styles.chipPacienteText,
                          formLancamento.pacienteId === p.id && styles.chipPacienteTextAtivo,
                        ]}
                      >
                        {p.nomeCompleto}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Valor (R$):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="150.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={formLancamento.valor}
                  onChangeText={(v) => setFormLancamento((prev) => ({ ...prev, valor: v }))}
                />

                <Text style={styles.formLabel}>Forma de Pagamento:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  {["PIX", "CARTAO_CREDITO", "DINHEIRO"].map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.chipPaciente,
                        formLancamento.formaPagamento === f && styles.chipPacienteAtivo,
                      ]}
                      onPress={() => setFormLancamento((prev) => ({ ...prev, formaPagamento: f }))}
                    >
                      <Text
                        style={[
                          styles.chipPacienteText,
                          formLancamento.formaPagamento === f && styles.chipPacienteTextAtivo,
                        ]}
                      >
                        {f === "CARTAO_CREDITO" ? "Cartão" : f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.btnSalvarModal}
                  onPress={handleSalvarLancamento}
                >
                  <Text style={styles.btnSalvarModalText}>Confirmar Recebimento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: "#00238e" },
  container: { flex: 1, backgroundColor: "#00238e" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  welcomeText: { fontSize: 14, color: "#E0F2F1", fontWeight: "500" },
  doctorName: { fontSize: 24, fontWeight: "900", color: "#FFFFFF" },
  backHeaderButton: { flexDirection: "row", alignItems: "center", gap: 10 },
  doctorNameHeader: { fontSize: 20, fontWeight: "900", color: "#FFFFFF" },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748B", fontWeight: "600" },

  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  metricValue: { fontSize: 18, fontWeight: "900", color: "#1E293B", marginVertical: 4 },
  metricLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: "#334155" },

  agendaWrapper: { marginBottom: 30 },
  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  agendaSectionTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  countBadge: {
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countIndicator: { fontSize: 12, fontWeight: "700", color: "#00BFA5" },

  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appointmentInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  appointmentTime: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  appointmentPatient: { fontSize: 14, fontWeight: "600", color: "#475569" },
  appointmentType: { fontSize: 12, color: "#64748B", marginTop: 4 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },

  presencaActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  presencaLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", marginRight: 4 },
  presencaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  presencaBtnPresenteAtivo: { backgroundColor: "#00BFA5", borderColor: "#00BFA5" },
  presencaBtnFaltaAtivo: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  presencaBtnText: { fontSize: 11, fontWeight: "700", color: "#475569" },

  toggleAgendaButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  toggleAgendaText: { fontSize: 13, fontWeight: "700", color: "#00238e" },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#334155", marginTop: 8 },
  emptySubtitle: { fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4 },

  presencaBanner: {
    backgroundColor: "#00238e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  presencaBannerTaxa: { fontSize: 36, fontWeight: "900", color: "#00BFA5" },
  presencaBannerDesc: { fontSize: 13, color: "#E0F2F1", textAlign: "center", marginTop: 4 },
  presencaBannerStats: { marginTop: 8 },
  presencaBannerSub: { fontSize: 12, color: "#CBD5E1", fontWeight: "600" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1E293B" },

  topActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  btnNovoTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00BFA5",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  btnNovoTopText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },

  prontuarioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  prontuarioMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prontuarioPatientName: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  prontuarioPatientAge: { fontSize: 12, color: "#64748B", marginTop: 2 },
  lgpdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lgpdText: { fontSize: 10, fontWeight: "800", color: "#00BFA5" },

  abrirProntuarioBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  abrirProntuarioBtnText: { fontSize: 13, fontWeight: "700", color: "#00238e" },

  historicoExpandidoBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historicoTitle: { fontSize: 12, fontWeight: "700", color: "#00BFA5", marginBottom: 4 },
  historicoText: { fontSize: 13, color: "#334155", lineHeight: 18 },
  fecharProntuarioBtn: { marginTop: 10, alignSelf: "flex-end" },
  fecharProntuarioBtnText: { fontSize: 12, fontWeight: "700", color: "#D32F2F" },

  daysContainer: { flexDirection: "row", gap: 6, flex: 1 },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dayButtonActive: { backgroundColor: "#00238e", borderColor: "#00238e" },
  dayButtonText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  dayButtonTextActive: { color: "#FFFFFF" },
  helperText: { fontSize: 12, color: "#64748B", marginBottom: 12 },

  rowHorario: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  horaLabel: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  horaSub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  statusBoxHorario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  boxDisponivel: { backgroundColor: "#E0F2F1", borderColor: "#00BFA5" },
  boxBloqueado: { backgroundColor: "#FFEBEE", borderColor: "#D32F2F" },
  statusBoxText: { fontSize: 12, fontWeight: "700" },
  txtDisponivel: { color: "#00BFA5" },
  txtBloqueado: { color: "#D32F2F" },

  financesSummaryContainer: { flexDirection: "row", gap: 8, marginBottom: 16 },
  financeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    elevation: 1,
  },
  financeCardLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  financeCardValue: { fontSize: 18, fontWeight: "900", marginTop: 4 },

  chartSimulationBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartTitle: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  chartPercentText: { fontSize: 13, fontWeight: "800", color: "#00BFA5" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#00BFA5" },

  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconFinanceCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  transactionMeta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  transactionRight: { alignItems: "flex-end" },
  transactionValue: { fontSize: 15, fontWeight: "900", color: "#1E293B" },
  transactionStatusText: { fontSize: 10, fontWeight: "700", marginTop: 2 },

  abrirChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
  },

  chatListItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00238e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatAvatarText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  chatInfoBox: { flex: 1 },
  chatPatientName: { fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1 },
  chatTimeText: { fontSize: 11, color: "#94A3B8" },
  chatLastMessage: { fontSize: 12, color: "#64748B", marginTop: 4 },

  bottomTabBar: {
    flexDirection: "row",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 14 : 0,
  },
  tabBarButton: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabBarText: { fontSize: 11, fontWeight: "700", marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#00238e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalFormContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  modalBody: { marginTop: 16 },
  modalPatientName: { fontSize: 20, fontWeight: "900", color: "#FFFFFF" },
  statusReportContainer: { marginTop: 14, gap: 10 },
  statusReportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    borderRadius: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusReportLabel: { fontSize: 13, fontWeight: "600", color: "#FFFFFF", flex: 1 },
  statusReportValue: { fontSize: 13, fontWeight: "700", color: "#00BFA5" },

  formLabel: { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 14,
  },
  chipPaciente: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  chipPacienteAtivo: { backgroundColor: "#00BFA5", borderColor: "#00BFA5" },
  chipPacienteText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  chipPacienteTextAtivo: { color: "#FFFFFF" },

  btnSalvarModal: {
    backgroundColor: "#00BFA5",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  btnSalvarModalText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
