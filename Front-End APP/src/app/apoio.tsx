import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  buscarSlotsDisponiveis,
  cancelarConsultaPeloPaciente,
  listarMinhasConsultas,
  solicitarAgendamento,
} from "../services/agendamento";
import { criarOuRecuperarChat, listarEspecialistas } from "../services/chat";
import { listarArtigos, listarPodcasts } from "../services/conteudo";
import { Especialista } from "../types/chat";
import { Consulta, SlotHorario } from "../types/clinica";
import { Artigo, Podcast } from "../types/conteudo";

const COLORS = {
  principal: "#00BFA5",
  secundario: "#00238e",
  laranja: "#FF9100",
  vermelho: "#FF5252",
  bg: "#F8F9FA",
  branco: "#FFFFFF",
  textoEscuro: "#1E293B",
  textoCinza: "#64748B",
  textoClaro: "#94A3B8",
  borda: "#E2E8F0",
};

export default function CentralApoio() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dados
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [minhasConsultas, setMinhasConsultas] = useState<Consulta[]>([]);

  // Modais
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState<Especialista | null>(null);
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [modalArtigo, setModalArtigo] = useState<Artigo | null>(null);
  const [modalMinhasConsultas, setModalMinhasConsultas] = useState(false);
  const [podcastTocando, setPodcastTocando] = useState<number | null>(null);

  // Estado do formulário de agendamento
  const [dataSelecionada, setDataSelecionada] = useState<string>("");
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<SlotHorario[]>([]);
  const [slotSelecionado, setSlotSelecionado] = useState<string>("");
  const [modalidade, setModalidade] = useState<"ONLINE" | "PRESENCIAL">("ONLINE");
  const [queixa, setQueixa] = useState("");
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [espRes, artRes, podRes, consRes] = await Promise.allSettled([
        listarEspecialistas(),
        listarArtigos(),
        listarPodcasts(),
        listarMinhasConsultas(),
      ]);

      if (espRes.status === "fulfilled") setEspecialistas(espRes.value);
      if (artRes.status === "fulfilled") setArtigos(artRes.value);
      if (podRes.status === "fulfilled") setPodcasts(podRes.value);
      if (consRes.status === "fulfilled") setMinhasConsultas(consRes.value);
    } catch (err) {
      console.error("Erro ao carregar dados de apoio:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  // --- Emergência CVV 188 ---
  const handleLigarCVV = () => {
    Alert.alert(
      "Centro de Valorização da Vida (CVV)",
      "Você não está sozinho. Deseja ligar agora para o número 188?\n\nO atendimento é 100% gratuito, confidencial e funciona 24 horas por dia.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Ligar 188",
          style: "default",
          onPress: async () => {
            const url = "tel:188";
            try {
              if (Platform.OS === "web") {
                window.open("https://cvv.org.br", "_blank");
              } else {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert("Aviso", "Disque 188 no seu telefone para falar com um voluntário do CVV.");
                }
              }
            } catch (err) {
              Alert.alert("Aviso", "Disque 188 para atendimento emergencial gratuito.");
            }
          },
        },
      ],
    );
  };

  // --- Conversar com Especialista ---
  const handleIniciarConversa = async (esp: Especialista) => {
    try {
      setEspecialistaSelecionado(null);
      const chat = await criarOuRecuperarChat(esp.id);
      router.push(
        `/chat/chat?chatId=${chat.id}&nome=${encodeURIComponent(esp.nomeCompleto)}&foto=${encodeURIComponent(
          esp.fotoPerfil || "",
        )}`,
      );
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível abrir o chat com o especialista.");
    }
  };

  // --- Abrir Modal de Agendamento ---
  const handleAbrirAgendamento = (esp: Especialista) => {
    setEspecialistaSelecionado(esp);
    // Próximo dia útil por padrão
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataStr = amanha.toISOString().split("T")[0];
    setDataSelecionada(dataStr);
    carregarSlots(esp.id, dataStr);
    setModalAgendamento(true);
  };

  const carregarSlots = async (psicologoId: number, data: string) => {
    try {
      setCarregandoSlots(true);
      setSlotSelecionado("");
      const slots = await buscarSlotsDisponiveis(psicologoId, data);
      setSlotsDisponiveis(slots);
      if (slots.length > 0) {
        setSlotSelecionado(slots[0].horaInicio);
      }
    } catch (err) {
      console.error("Erro ao buscar slots:", err);
      setSlotsDisponiveis([]);
    } finally {
      setCarregandoSlots(false);
    }
  };

  const handleMudarData = (dataStr: string) => {
    setDataSelecionada(dataStr);
    if (especialistaSelecionado) {
      carregarSlots(especialistaSelecionado.id, dataStr);
    }
  };

  const handleConfirmarAgendamento = async () => {
    if (!especialistaSelecionado || !dataSelecionada || !slotSelecionado) {
      Alert.alert("Atenção", "Selecione a data e o horário desejados.");
      return;
    }
    try {
      setSalvandoAgendamento(true);
      await solicitarAgendamento({
        psicologoId: especialistaSelecionado.id,
        dataConsulta: dataSelecionada,
        horaInicio: slotSelecionado,
        modalidade,
        observacoes: queixa,
        tipo: "PRIMEIRA_CONSULTA",
      });

      setModalAgendamento(false);
      setQueixa("");
      Alert.alert(
        "Consulta Solicitada!",
        `Seu agendamento para ${dataSelecionada} às ${slotSelecionado} com ${especialistaSelecionado.nomeCompleto} foi enviado com sucesso.`,
      );
      // Recarrega minhas consultas
      const novas = await listarMinhasConsultas();
      setMinhasConsultas(novas);
    } catch (err: any) {
      Alert.alert(
        "Erro no Agendamento",
        err.response?.data?.message || "Não foi possível confirmar o agendamento neste horário.",
      );
    } finally {
      setSalvandoAgendamento(false);
    }
  };

  const handleCancelarMinhaConsulta = (consultaId: number) => {
    Alert.alert(
      "Cancelar Consulta",
      "Tem certeza que deseja cancelar esta consulta? A política da clínica exige antecedência mínima de 24 horas.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar Cancelamento",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarConsultaPeloPaciente(consultaId, "Cancelado pelo paciente");
              Alert.alert("Consulta Cancelada", "Seu horário foi liberado com sucesso.");
              const novas = await listarMinhasConsultas();
              setMinhasConsultas(novas);
            } catch (err: any) {
              Alert.alert(
                "Aviso",
                err.response?.data?.message ||
                  "Cancelamento não permitido: com menos de 24h de antecedência, fale diretamente com seu psicólogo pelo chat.",
              );
            }
          },
        },
      ],
    );
  };

  // Gerador de datas para agendamento (próximos 5 dias)
  const proximasDatas = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const iso = d.toISOString().split("T")[0];
    const diaNum = d.getDate();
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return {
      iso,
      label: `${semana[d.getDay()]}`,
      diaMes: `${diaNum} ${meses[d.getMonth()]}`,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Central de Apoio</Text>
            <Text style={styles.subtitle}>Encontre ajuda profissional e acolhimento</Text>
          </View>
          <TouchableOpacity
            style={styles.minhasConsultasBtn}
            onPress={() => setModalMinhasConsultas(true)}
          >
            <Feather name="calendar" size={18} color="#00238e" />
            <Text style={styles.minhasConsultasBtnText}>Minhas Consultas</Text>
          </TouchableOpacity>
        </View>

        {/* EMERGÊNCIA CVV 188 */}
        <Text style={styles.sectionHeader}>Plantão de Emergência Emocional</Text>
        <TouchableOpacity
          style={[styles.card, styles.emergencyCard]}
          onPress={handleLigarCVV}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIconBox}>
            <Feather name="phone-call" color="#FFFFFF" size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.emergencyTitle}>CVV — Ligue 188</Text>
              <View style={styles.badge24h}>
                <Text style={styles.badge24hText}>24H GRATUITO</Text>
              </View>
            </View>
            <Text style={styles.emergencySubtitle}>
              Apoio emocional e prevenção do suicídio. Toque para ligar agora.
            </Text>
          </View>
          <Feather name="chevron-right" color="#FF5252" size={22} />
        </TouchableOpacity>

        {/* ESPECIALISTAS DISPONÍVEIS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Especialistas Disponíveis</Text>
          <Text style={styles.sectionHeaderSub}>{especialistas.length} profissionais</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.principal} />
            <Text style={styles.loadingText}>Buscando especialistas...</Text>
          </View>
        ) : especialistas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="user-check" size={28} color={COLORS.textoClaro} />
            <Text style={styles.emptyTitle}>Nenhum especialista cadastrado no momento</Text>
          </View>
        ) : (
          especialistas.map((esp) => (
            <TouchableOpacity
              key={esp.id}
              style={styles.card}
              onPress={() => setEspecialistaSelecionado(esp)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarBox}>
                {esp.fotoPerfil ? (
                  <Image source={{ uri: esp.fotoPerfil }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{esp.nomeCompleto.slice(0, 2).toUpperCase()}</Text>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.cardTitle}>{esp.nomeCompleto}</Text>
                  <View style={styles.ratingBox}>
                    <Feather name="star" size={12} color="#FF9100" />
                    <Text style={styles.ratingText}>{esp.notaMedia || 5.0}</Text>
                  </View>
                </View>

                <Text style={styles.cardSub}>
                  {esp.especialidade || "Psicologia Clínica"} • {esp.codigoCrp ? `CRP ${esp.codigoCrp}` : "Disponível"}
                </Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.btnCardAgendar}
                    onPress={() => handleAbrirAgendamento(esp)}
                  >
                    <Feather name="calendar" size={14} color="#00238e" />
                    <Text style={styles.btnCardAgendarText}>Agendar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnCardConversar}
                    onPress={() => handleIniciarConversa(esp)}
                  >
                    <Feather name="message-circle" size={14} color="#00BFA5" />
                    <Text style={styles.btnCardConversarText}>Conversar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* RECURSOS EDUCATIVOS: ARTIGOS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Artigos & Guias de Saúde Mental</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {artigos.map((art) => (
            <TouchableOpacity
              key={art.id}
              style={styles.artigoCard}
              onPress={() => setModalArtigo(art)}
              activeOpacity={0.8}
            >
              <View style={styles.artigoTag}>
                <Text style={styles.artigoTagText}>{art.categoria || "Saúde Mental"}</Text>
              </View>
              <Text style={styles.artigoTitulo} numberOfLines={2}>
                {art.titulo}
              </Text>
              <Text style={styles.artigoResumo} numberOfLines={3}>
                {art.resumo || art.corpo}
              </Text>
              <View style={styles.artigoFooter}>
                <Text style={styles.artigoAutor}>Por {art.autorNome}</Text>
                <Feather name="arrow-right" size={14} color={COLORS.principal} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RECURSOS DE ÁUDIO: PODCASTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Podcasts & Áudios Guiados</Text>
        </View>

        {podcasts.map((pod) => (
          <View key={pod.id} style={styles.podcastCard}>
            <TouchableOpacity
              style={styles.podcastPlayBtn}
              onPress={() => setPodcastTocando(podcastTocando === pod.id ? null : pod.id)}
            >
              <Feather
                name={podcastTocando === pod.id ? "pause" : "play"}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.podcastTitulo}>{pod.titulo}</Text>
              <Text style={styles.podcastDesc}>{pod.descricao || "Áudio com reflexões e práticas."}</Text>
              <Text style={styles.podcastMeta}>
                {pod.autorNome} • {Math.round((pod.duracaoSegundos || 600) / 60)} min
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODAL: PERFIL DO ESPECIALISTA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!especialistaSelecionado && !modalAgendamento}
        onRequestClose={() => setEspecialistaSelecionado(null)}
      >
        <TouchableWithoutFeedback onPress={() => setEspecialistaSelecionado(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                {especialistaSelecionado && (
                  <>
                    <View style={styles.modalSheetHeader}>
                      <View style={styles.avatarBoxGrande}>
                        <Text style={styles.avatarTextGrande}>
                          {especialistaSelecionado.nomeCompleto.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setEspecialistaSelecionado(null)}
                      >
                        <Feather name="x" size={24} color={COLORS.textoEscuro} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.perfilNome}>{especialistaSelecionado.nomeCompleto}</Text>
                    <Text style={styles.perfilCrp}>
                      {especialistaSelecionado.especialidade || "Psicólogo Clínico"} • CRP{" "}
                      {especialistaSelecionado.codigoCrp || "Ativo"}
                    </Text>

                    <View style={styles.bioBox}>
                      <Text style={styles.bioTitle}>Sobre o Profissional:</Text>
                      <Text style={styles.bioText}>
                        {especialistaSelecionado.biografia ||
                          "Profissional dedicado ao acolhimento terapêutico com foco na escuta empática e transformação pessoal."}
                      </Text>
                    </View>

                    <View style={styles.modalSheetActions}>
                      <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => handleAbrirAgendamento(especialistaSelecionado)}
                      >
                        <Feather name="calendar" size={18} color="#FFFFFF" />
                        <Text style={styles.btnPrimaryText}>Agendar Consulta</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => handleIniciarConversa(especialistaSelecionado)}
                      >
                        <Feather name="message-circle" size={18} color={COLORS.secundario} />
                        <Text style={styles.btnSecondaryText}>Conversar no Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: FLUXO DE AGENDAMENTO (FASE 4) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAgendamento}
        onRequestClose={() => setModalAgendamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Agendar Atendimento</Text>
                <Text style={styles.modalSheetSub}>com {especialistaSelecionado?.nomeCompleto}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalAgendamento(false)}>
                <Feather name="x" size={24} color={COLORS.textoEscuro} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 14 }} showsVerticalScrollIndicator={false}>
              {/* Seleção de Data */}
              <Text style={styles.formSectionTitle}>1. Escolha a Data:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {proximasDatas.map((item) => (
                  <TouchableOpacity
                    key={item.iso}
                    style={[
                      styles.dataPill,
                      dataSelecionada === item.iso && styles.dataPillAtiva,
                    ]}
                    onPress={() => handleMudarData(item.iso)}
                  >
                    <Text
                      style={[
                        styles.dataPillSemana,
                        dataSelecionada === item.iso && styles.dataPillTextoAtivo,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.dataPillDia,
                        dataSelecionada === item.iso && styles.dataPillTextoAtivo,
                      ]}
                    >
                      {item.diaMes}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Horários Disponíveis */}
              <Text style={styles.formSectionTitle}>2. Horário Disponível:</Text>
              {carregandoSlots ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={COLORS.principal} />
                  <Text style={styles.loadingText}>Verificando agenda...</Text>
                </View>
              ) : slotsDisponiveis.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptySubtitle}>
                    Nenhum horário livre nesta data. Selecione outro dia acima.
                  </Text>
                </View>
              ) : (
                <View style={styles.slotsGrid}>
                  {slotsDisponiveis.map((slot) => (
                    <TouchableOpacity
                      key={slot.horaInicio}
                      style={[
                        styles.slotButton,
                        slotSelecionado === slot.horaInicio && styles.slotButtonAtivo,
                      ]}
                      onPress={() => setSlotSelecionado(slot.horaInicio)}
                    >
                      <Feather
                        name="clock"
                        size={13}
                        color={slotSelecionado === slot.horaInicio ? "#FFF" : COLORS.secundario}
                      />
                      <Text
                        style={[
                          styles.slotButtonText,
                          slotSelecionado === slot.horaInicio && styles.slotButtonTextAtivo,
                        ]}
                      >
                        {slot.horaInicio.slice(0, 5)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Modalidade */}
              <Text style={styles.formSectionTitle}>3. Modalidade:</Text>
              <View style={styles.modalidadeRow}>
                <TouchableOpacity
                  style={[
                    styles.modalidadeBtn,
                    modalidade === "ONLINE" && styles.modalidadeBtnAtiva,
                  ]}
                  onPress={() => setModalidade("ONLINE")}
                >
                  <Feather
                    name="video"
                    size={16}
                    color={modalidade === "ONLINE" ? "#FFF" : COLORS.secundario}
                  />
                  <Text
                    style={[
                      styles.modalidadeBtnText,
                      modalidade === "ONLINE" && { color: "#FFF" },
                    ]}
                  >
                    Online (Vídeo)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalidadeBtn,
                    modalidade === "PRESENCIAL" && styles.modalidadeBtnAtiva,
                  ]}
                  onPress={() => setModalidade("PRESENCIAL")}
                >
                  <Feather
                    name="map-pin"
                    size={16}
                    color={modalidade === "PRESENCIAL" ? "#FFF" : COLORS.secundario}
                  />
                  <Text
                    style={[
                      styles.modalidadeBtnText,
                      modalidade === "PRESENCIAL" && { color: "#FFF" },
                    ]}
                  >
                    Presencial
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Queixa / Observações */}
              <Text style={styles.formSectionTitle}>4. Motivo / Queixa Principal (opcional):</Text>
              <TextInput
                style={styles.inputArea}
                placeholder="Ex: Gostaria de apoio com momentos de ansiedade e estresse..."
                placeholderTextColor={COLORS.textoClaro}
                multiline
                value={queixa}
                onChangeText={setQueixa}
              />

              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 12 }]}
                onPress={handleConfirmarAgendamento}
                disabled={salvandoAgendamento || !slotSelecionado}
              >
                {salvandoAgendamento ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.btnPrimaryText}>Confirmar Solicitação</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: MINHAS CONSULTAS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalMinhasConsultas}
        onRequestClose={() => setModalMinhasConsultas(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Minhas Consultas</Text>
                <Text style={styles.modalSheetSub}>Histórico e próximos atendimentos</Text>
              </View>
              <TouchableOpacity onPress={() => setModalMinhasConsultas(false)}>
                <Feather name="x" size={24} color={COLORS.textoEscuro} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={minhasConsultas}
              keyExtractor={(item) => "minha-cons-" + item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 14 }}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Feather name="calendar" size={32} color={COLORS.textoClaro} />
                  <Text style={styles.emptyTitle}>Nenhuma consulta agendada</Text>
                  <Text style={styles.emptySubtitle}>
                    Seus agendamentos com nossos psicólogos aparecerão aqui.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.minhaConsultaCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.minhaConsultaEspecialista}>{item.psicologoNome}</Text>
                    <Text style={styles.minhaConsultaData}>
                      {item.dataConsulta} às {item.horaInicio.slice(0, 5)} ({item.modalidade})
                    </Text>
                    <View
                      style={[
                        styles.statusTag,
                        {
                          alignSelf: "flex-start",
                          backgroundColor:
                            item.status === "CONFIRMADA"
                              ? "#E0F2F1"
                              : item.status === "CANCELADA"
                              ? "#FFEBEE"
                              : "#FFF3E0",
                          marginTop: 6,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              item.status === "CONFIRMADA"
                                ? "#00BFA5"
                                : item.status === "CANCELADA"
                                ? "#D32F2F"
                                : "#FF9100",
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {item.status !== "CANCELADA" && item.status !== "REALIZADA" && (
                    <TouchableOpacity
                      style={styles.cancelarConsultaBtn}
                      onPress={() => handleCancelarMinhaConsulta(item.id)}
                    >
                      <Feather name="x" size={14} color="#D32F2F" />
                      <Text style={styles.cancelarConsultaBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL: LEITOR DE ARTIGO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!modalArtigo}
        onRequestClose={() => setModalArtigo(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: "90%" }]}>
            {modalArtigo && (
              <>
                <View style={styles.modalSheetHeader}>
                  <View style={styles.artigoTag}>
                    <Text style={styles.artigoTagText}>{modalArtigo.categoria}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalArtigo(null)}>
                    <Feather name="x" size={24} color={COLORS.textoEscuro} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                  <Text style={styles.artigoLeitorTitulo}>{modalArtigo.titulo}</Text>
                  <Text style={styles.artigoLeitorAutor}>
                    Publicado por {modalArtigo.autorNome} • Leitura recomendada
                  </Text>
                  <View style={styles.divisor} />
                  <Text style={styles.artigoLeitorCorpo}>{modalArtigo.corpo}</Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/dashboard")}>
          <Feather name="home" color="#BDC3C7" size={24} />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/chat")}>
          <Feather name="users" color="#BDC3C7" size={24} />
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="heart" color={COLORS.principal} size={24} />
          <Text style={[styles.navLabel, { color: COLORS.principal, fontWeight: "700" }]}>
            Apoio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/menu" as any)}>
          <Feather name="user" color="#BDC3C7" size={24} />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.textoEscuro },
  subtitle: { fontSize: 13, color: COLORS.textoCinza, marginTop: 2 },
  minhasConsultasBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8EAF6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  minhasConsultasBtnText: { fontSize: 12, fontWeight: "700", color: "#00238e" },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: COLORS.textoEscuro },
  sectionHeaderSub: { fontSize: 12, color: COLORS.textoClaro, fontWeight: "600" },

  card: {
    backgroundColor: COLORS.branco,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  emergencyCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#FF5252",
    backgroundColor: "#FFF5F5",
    marginTop: 6,
  },
  emergencyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyTitle: { fontSize: 15, fontWeight: "900", color: "#D32F2F" },
  emergencySubtitle: { fontSize: 12, color: "#7F1D1D", marginTop: 4, lineHeight: 16 },
  badge24h: {
    backgroundColor: "#FFCDD2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badge24hText: { fontSize: 9, fontWeight: "900", color: "#D32F2F" },

  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: { width: 46, height: 46, borderRadius: 23 },
  avatarText: { fontSize: 15, fontWeight: "800", color: COLORS.principal },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textoEscuro },
  cardSub: { fontSize: 12, color: COLORS.textoCinza, marginTop: 2 },

  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "700", color: COLORS.textoEscuro },

  cardActionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  btnCardAgendar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8EAF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnCardAgendarText: { fontSize: 11, fontWeight: "700", color: "#00238e" },
  btnCardConversar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnCardConversarText: { fontSize: 11, fontWeight: "700", color: "#00BFA5" },

  artigoCard: {
    backgroundColor: COLORS.branco,
    width: 240,
    padding: 16,
    borderRadius: 16,
    marginRight: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  artigoTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  artigoTagText: { fontSize: 10, fontWeight: "800", color: COLORS.principal },
  artigoTitulo: { fontSize: 14, fontWeight: "800", color: COLORS.textoEscuro, lineHeight: 18 },
  artigoResumo: { fontSize: 12, color: COLORS.textoCinza, marginTop: 6, lineHeight: 16 },
  artigoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borda,
  },
  artigoAutor: { fontSize: 11, color: COLORS.textoClaro, fontWeight: "600" },

  podcastCard: {
    backgroundColor: COLORS.branco,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  podcastPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.principal,
    justifyContent: "center",
    alignItems: "center",
  },
  podcastTitulo: { fontSize: 14, fontWeight: "700", color: COLORS.textoEscuro },
  podcastDesc: { fontSize: 12, color: COLORS.textoCinza, marginTop: 2 },
  podcastMeta: { fontSize: 11, color: COLORS.textoClaro, marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.branco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalSheetTitle: { fontSize: 18, fontWeight: "900", color: COLORS.textoEscuro },
  modalSheetSub: { fontSize: 13, color: COLORS.textoCinza },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBoxGrande: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00238e",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextGrande: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  perfilNome: { fontSize: 20, fontWeight: "900", color: COLORS.textoEscuro, marginTop: 8 },
  perfilCrp: { fontSize: 13, color: COLORS.principal, fontWeight: "700", marginTop: 2 },
  bioBox: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.borda,
  },
  bioTitle: { fontSize: 12, fontWeight: "800", color: COLORS.textoEscuro, marginBottom: 4 },
  bioText: { fontSize: 13, color: COLORS.textoCinza, lineHeight: 19 },
  modalSheetActions: { gap: 10, marginTop: 8 },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.principal,
    height: 48,
    borderRadius: 12,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8EAF6",
    height: 48,
    borderRadius: 12,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "800", color: COLORS.secundario },

  formSectionTitle: { fontSize: 13, fontWeight: "800", color: COLORS.textoEscuro, marginBottom: 8 },
  dataPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borda,
  },
  dataPillAtiva: { backgroundColor: COLORS.secundario, borderColor: COLORS.secundario },
  dataPillSemana: { fontSize: 11, fontWeight: "700", color: COLORS.textoCinza },
  dataPillDia: { fontSize: 13, fontWeight: "900", color: COLORS.textoEscuro, marginTop: 2 },
  dataPillTextoAtivo: { color: "#FFFFFF" },

  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  slotButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.borda,
  },
  slotButtonAtivo: { backgroundColor: COLORS.principal, borderColor: COLORS.principal },
  slotButtonText: { fontSize: 13, fontWeight: "700", color: COLORS.textoEscuro },
  slotButtonTextAtivo: { color: "#FFFFFF" },

  modalidadeRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  modalidadeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.borda,
  },
  modalidadeBtnAtiva: { backgroundColor: COLORS.secundario, borderColor: COLORS.secundario },
  modalidadeBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textoEscuro },

  inputArea: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borda,
    padding: 12,
    fontSize: 13,
    color: COLORS.textoEscuro,
    height: 70,
    textAlignVertical: "top",
  },

  minhaConsultaCard: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borda,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  minhaConsultaEspecialista: { fontSize: 14, fontWeight: "800", color: COLORS.textoEscuro },
  minhaConsultaData: { fontSize: 12, color: COLORS.textoCinza, marginTop: 2 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800" },
  cancelarConsultaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
  },
  cancelarConsultaBtnText: { fontSize: 11, fontWeight: "700", color: "#D32F2F" },

  artigoLeitorTitulo: { fontSize: 20, fontWeight: "900", color: COLORS.textoEscuro, lineHeight: 26 },
  artigoLeitorAutor: { fontSize: 12, color: COLORS.textoClaro, marginTop: 4 },
  divisor: { height: 1, backgroundColor: COLORS.borda, marginVertical: 14 },
  artigoLeitorCorpo: { fontSize: 14, color: COLORS.textoEscuro, lineHeight: 22 },

  loadingBox: { alignItems: "center", paddingVertical: 20 },
  loadingText: { fontSize: 12, color: COLORS.textoCinza, marginTop: 8 },
  emptyCard: {
    backgroundColor: COLORS.branco,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borda,
  },
  emptyTitle: { fontSize: 13, fontWeight: "700", color: COLORS.textoEscuro, marginTop: 6 },
  emptySubtitle: { fontSize: 12, color: COLORS.textoCinza, textAlign: "center", marginTop: 4 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: COLORS.branco,
    borderTopWidth: 1,
    borderColor: COLORS.borda,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 14 : 0,
  },
  navButton: { alignItems: "center", justifyContent: "center", flex: 1 },
  navLabel: { fontSize: 10, color: "#BDC3C7", marginTop: 3 },
});
