import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNomeUsuario } from "../services/perfil";

const COLORS = {
  principal: "#00BFA5",
  principalDark: "#008E7B",
  secondary: "#E67E22",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  text: "#333333",
  lightText: "#777777",
  cardBg: "#F0FFF4",
  border: "#E0E0E0",
};

interface ModalConteudo {
  tipo: "humor" | "mensagem" | "meditacao" | "respiracao" | "gratidao" | "musica" | null;
  titulo: string;
  conteudo: string;
  detalhe?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [humorSelecionado, setHumorSelecionado] = useState<string | null>(null);

  // Modal interativo
  const [modalAtivo, setModalAtivo] = useState<ModalConteudo | null>(null);

  // Estados para Respiração Guiada
  const [etapaRespiracao, setEtapaRespiracao] = useState<"inspirar" | "segurar" | "expirar">("inspirar");
  const [tempoRespiracao, setTempoRespiracao] = useState(4);
  const [respirandoAtivo, setRespirandoAtivo] = useState(false);

  // Estados para Diário de Gratidão
  const [gratidao1, setGratidao1] = useState("");
  const [gratidao2, setGratidao2] = useState("");
  const [gratidao3, setGratidao3] = useState("");

  useEffect(() => {
    async function carregarUsuario() {
      const nome = await getNomeUsuario();
      if (nome) setNomeUsuario(nome);
    }
    carregarUsuario();
  }, []);

  // Timer da Respiração 4-7-8
  useEffect(() => {
    let timer: any;
    if (respirandoAtivo) {
      timer = setInterval(() => {
        setTempoRespiracao((prev) => {
          if (prev <= 1) {
            if (etapaRespiracao === "inspirar") {
              setEtapaRespiracao("segurar");
              return 7;
            } else if (etapaRespiracao === "segurar") {
              setEtapaRespiracao("expirar");
              return 8;
            } else {
              setEtapaRespiracao("inspirar");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [respirandoAtivo, etapaRespiracao]);

  const handleSelecionarHumor = (humor: string) => {
    setHumorSelecionado(humor);
    const mensagens: Record<string, { titulo: string; desc: string }> = {
      Feliz: {
        titulo: "Que alegria! ✨",
        desc: "Ficamos muito felizes por você estar se sentindo bem hoje. Aproveite essa energia positiva e espalhe para quem está ao seu redor!",
      },
      Triste: {
        titulo: "Estamos aqui com você 💙",
        desc: "Não há problema em ter dias difíceis. Respeite o seu momento. Que tal ver mensagens de conforto ou solicitar apoio com nossos psicólogos?",
      },
      Ansioso: {
        titulo: "Respire com calma 🌿",
        desc: "A ansiedade pode parecer pesada agora, mas ela vai passar. Sugerimos fazer o Exercício de Respiração 4-7-8 para desacelerar seus batimentos.",
      },
      Neutro: {
        titulo: "Um dia de serenidade 🕊️",
        desc: "Dias calmos são ótimos para o autocuidado. Que tal dedicar 5 minutos para uma reflexão no Diário de Gratidão?",
      },
    };

    const info = mensagens[humor] || { titulo: "Humor Registrado", desc: "Seu sentimento foi salvo com sucesso." };
    setModalAtivo({
      tipo: "humor",
      titulo: `${humor}: ${info.titulo}`,
      conteudo: info.desc,
    });
  };

  const abrirMensagem = (tema: string) => {
    const mensagens: Record<string, { titulo: string; desc: string }> = {
      Ansiedade: {
        titulo: "Acalmando a Mente",
        desc: "Lembre-se: pensamentos não são fatos. Quando o futuro parecer incerto demais, traga sua atenção para o momento presente. Respire fundo, você está seguro aqui e agora.",
      },
      Tristeza: {
        titulo: "Acolhendo suas Emoções",
        desc: "Permita-se sentir sem julgamentos. As tempestades chegam, mas o céu sempre volta a se abrir. Seja gentil consigo mesmo hoje.",
      },
      Autoestima: {
        titulo: "Seu Valor é Inestimável",
        desc: "Você não precisa ser perfeito para ser incrível. Celebre as pequenas vitórias e reconheça a sua trajetória com orgulho e carinho.",
      },
    };

    const item = mensagens[tema];
    if (item) {
      setModalAtivo({
        tipo: "mensagem",
        titulo: `Mensagem: ${tema}`,
        conteudo: item.desc,
      });
    }
  };

  const abrirRespiracao = () => {
    setEtapaRespiracao("inspirar");
    setTempoRespiracao(4);
    setRespirandoAtivo(true);
    setModalAtivo({
      tipo: "respiracao",
      titulo: "Respiração Guiada 4-7-8",
      conteudo: "Siga o ritmo na tela para relaxar o sistema nervoso e diminuir a tensão.",
    });
  };

  const abrirGratidao = () => {
    setModalAtivo({
      tipo: "gratidao",
      titulo: "Diário de Gratidão",
      conteudo: "Escreva três momentos ou coisas pelas quais você se sente grato hoje:",
    });
  };

  const salvarGratidao = () => {
    if (!gratidao1 && !gratidao2 && !gratidao3) {
      Alert.alert("Aviso", "Preencha ao menos uma gratidão para salvar.");
      return;
    }
    Alert.alert("Gratidão Registrada! 🙏", "O hábito da gratidão transforma o seu dia a dia.");
    setModalAtivo(null);
    setGratidao1("");
    setGratidao2("");
    setGratidao3("");
  };

  const abrirMusica = () => {
    setModalAtivo({
      tipo: "musica",
      titulo: "Música & Sons da Natureza",
      conteudo: "Sons suaves acalmam o cérebro e aumentam a concentração e o relaxamento.",
    });
  };

  const abrirMeditacao = () => {
    setModalAtivo({
      tipo: "meditacao",
      titulo: "Meditação: Aliviando o Estresse",
      conteudo: "Encontre uma posição confortável, feche suavemente os olhos e relaxe os ombros. Deixe as preocupações do dia passarem como nuvens.",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {nomeUsuario}</Text>
          <Text style={styles.subGreeting}>
            Como você está se sentindo hoje?
          </Text>
          <View style={styles.moodRow}>
            <MoodItem
              label="Feliz"
              emoji="😃"
              selected={humorSelecionado === "Feliz"}
              onPress={() => handleSelecionarHumor("Feliz")}
            />
            <MoodItem
              label="Triste"
              emoji="😥"
              selected={humorSelecionado === "Triste"}
              onPress={() => handleSelecionarHumor("Triste")}
            />
            <MoodItem
              label="Ansioso"
              emoji="🤯"
              selected={humorSelecionado === "Ansioso"}
              onPress={() => handleSelecionarHumor("Ansioso")}
            />
            <MoodItem
              label="Neutro"
              emoji="😐"
              selected={humorSelecionado === "Neutro"}
              onPress={() => handleSelecionarHumor("Neutro")}
            />
          </View>
        </View>

        {/* Card Precisa de Ajuda */}
        <TouchableOpacity
          style={styles.helpCard}
          activeOpacity={0.7}
          onPress={() => router.push("/apoio" as any)}
        >
          <View style={styles.helpIconCircle}>
            <Feather name="help-circle" color={COLORS.secondary} size={22} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
            <Text style={styles.helpSub}>Solicite apoio imediato agora</Text>
          </View>
          <Feather name="chevron-right" color="#999" size={20} />
        </TouchableOpacity>

        {/* Seção Mensagens Motivacionais */}
        <SectionHeader
          title="Mensagens Motivacionais"
          onVerTodos={() =>
            setModalAtivo({
              tipo: "mensagem",
              titulo: "Mensagens Motivacionais",
              conteudo: "Toque em qualquer categoria para receber uma mensagem de apoio e inspiração para o seu dia.",
            })
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          <GroupCard
            title="Ansiedade"
            icon={<Feather name="zap" color={COLORS.principal} size={28} />}
            onPress={() => abrirMensagem("Ansiedade")}
          />
          <GroupCard
            title="Tristeza"
            icon={<Feather name="frown" color="#3498DB" size={28} />}
            onPress={() => abrirMensagem("Tristeza")}
          />
          <GroupCard
            title="Autoestima"
            icon={<Feather name="heart" color="#E74C3C" size={28} />}
            onPress={() => abrirMensagem("Autoestima")}
          />
        </ScrollView>

        {/* Seção Destaques */}
        <SectionHeader
          title="Destaques para você"
          onVerTodos={() => router.push("/apoio" as any)}
        />
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.8}
          onPress={abrirMeditacao}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredTextContent}>
              <Text style={styles.featuredTag}>MEDITAÇÃO</Text>
              <Text style={styles.featuredTitle}>Aliviando o estresse</Text>
              <Text style={styles.featuredSub}>5 minutos de relaxamento guiado</Text>
            </View>
            <View style={styles.featuredIconContainer}>
              <Feather name="play-circle" color={COLORS.principal} size={44} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Seção Atividades Recomendadas */}
        <SectionHeader
          title="Atividades Recomendadas"
          onVerTodos={() =>
            Alert.alert("Atividades", "Escolha entre Respiração, Gratidão ou Música para praticar autocuidado.")
          }
        />
        <View style={styles.verticalList}>
          <ActivityItem
            title="Exercício de Respiração"
            sub="Controle sua respiração no ritmo 4-7-8"
            icon="wind"
            color="#3498DB"
            onPress={abrirRespiracao}
          />
          <ActivityItem
            title="Diário de Gratidão"
            sub="Escreva 3 coisas boas do seu dia"
            icon="edit-3"
            color="#9B59B6"
            onPress={abrirGratidao}
          />
          <ActivityItem
            title="Música Relaxante"
            sub="Sons da natureza para acalmar a mente"
            icon="music"
            color="#F1C40F"
            onPress={abrirMusica}
          />
        </View>
      </ScrollView>

      {/* Modal Interativo Central */}
      <Modal
        visible={!!modalAtivo}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRespirandoAtivo(false);
          setModalAtivo(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{modalAtivo?.titulo}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRespirandoAtivo(false);
                  setModalAtivo(null);
                }}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalContent}>{modalAtivo?.conteudo}</Text>

            {/* Conteúdo específico: Respiração 4-7-8 */}
            {modalAtivo?.tipo === "respiracao" && (
              <View style={styles.breathBox}>
                <View
                  style={[
                    styles.breathCircle,
                    etapaRespiracao === "inspirar" && { borderColor: "#3498DB", transform: [{ scale: 1.1 }] },
                    etapaRespiracao === "segurar" && { borderColor: "#F1C40F", transform: [{ scale: 1.15 }] },
                    etapaRespiracao === "expirar" && { borderColor: "#2ECC71", transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={styles.breathEtapaText}>
                    {etapaRespiracao === "inspirar" && "Inspire pelo nariz"}
                    {etapaRespiracao === "segurar" && "Segure o ar"}
                    {etapaRespiracao === "expirar" && "Solte pela boca"}
                  </Text>
                  <Text style={styles.breathCountText}>{tempoRespiracao}s</Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: respirandoAtivo ? "#E74C3C" : COLORS.principal }]}
                  onPress={() => setRespirandoAtivo(!respirandoAtivo)}
                >
                  <Text style={styles.modalButtonText}>
                    {respirandoAtivo ? "Pausar Exercício" : "Continuar Exercício"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Conteúdo específico: Diário de Gratidão */}
            {modalAtivo?.tipo === "gratidao" && (
              <View style={styles.gratidaoBox}>
                <TextInput
                  style={styles.inputGratidao}
                  placeholder="1. Pelo que você é grato?"
                  value={gratidao1}
                  onChangeText={setGratidao1}
                />
                <TextInput
                  style={styles.inputGratidao}
                  placeholder="2. Algo que te fez sorrir hoje..."
                  value={gratidao2}
                  onChangeText={setGratidao2}
                />
                <TextInput
                  style={styles.inputGratidao}
                  placeholder="3. Uma vitória ou pessoa especial..."
                  value={gratidao3}
                  onChangeText={setGratidao3}
                />
                <TouchableOpacity style={styles.modalButton} onPress={salvarGratidao}>
                  <Text style={styles.modalButtonText}>Salvar no Diário</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Conteúdo específico: Música e Sons */}
            {modalAtivo?.tipo === "musica" && (
              <View style={styles.soundList}>
                <TouchableOpacity
                  style={styles.soundItem}
                  onPress={() => Alert.alert("Sons de Chuva 🌧️", "Tocando som ambiente suave de chuva...")}
                >
                  <Feather name="cloud-rain" size={20} color="#3498DB" />
                  <Text style={styles.soundText}>Chuva Suave na Janela</Text>
                  <Feather name="play" size={16} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.soundItem}
                  onPress={() => Alert.alert("Sons da Floresta 🌲", "Tocando canto de pássaros e vento nas folhas...")}
                >
                  <Feather name="wind" size={20} color="#2ECC71" />
                  <Text style={styles.soundText}>Floresta & Pássaros</Text>
                  <Feather name="play" size={16} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.soundItem}
                  onPress={() => Alert.alert("Ondas do Oceano 🌊", "Tocando o ritmo suave das ondas na praia...")}
                >
                  <Feather name="activity" size={20} color="#9B59B6" />
                  <Text style={styles.soundText}>Ondas do Mar Calmo</Text>
                  <Feather name="play" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Botão de Fechar / Ação */}
            {modalAtivo?.tipo !== "respiracao" && modalAtivo?.tipo !== "gratidao" && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setRespirandoAtivo(false);
                  setModalAtivo(null);
                }}
              >
                <Text style={styles.modalButtonText}>Entendido</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Navegação Inferior */}
      <View
        style={[
          styles.bottomNav,
          { height: 65 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <NavButton
          icon={<Feather name="home" color={COLORS.principal} size={24} />}
          label="Início"
          active
        />
        <NavButton
          icon={<Feather name="users" color="#BDC3C7" size={24} />}
          label="Chat"
          onPress={() => router.push("/chat" as any)}
        />
        <NavButton
          icon={<Feather name="heart" color="#BDC3C7" size={24} />}
          label="Apoio"
          onPress={() => router.push("/apoio" as any)}
        />
        <NavButton
          icon={<Feather name="user" color="#BDC3C7" size={24} />}
          label="Perfil"
          onPress={() => router.push("/menu" as any)}
        />
      </View>
    </SafeAreaView>
  );
}

const MoodItem = ({ label, emoji, selected, onPress }: any) => (
  <View style={styles.moodItem}>
    <TouchableOpacity
      style={[
        styles.moodCircle,
        selected && { backgroundColor: COLORS.white, transform: [{ scale: 1.1 }] },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </TouchableOpacity>
    <Text style={[styles.moodLabel, selected && { fontWeight: "bold" }]}>
      {label}
    </Text>
  </View>
);

const SectionHeader = ({ title, onVerTodos }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onVerTodos ? (
      <TouchableOpacity onPress={onVerTodos}>
        <Text style={styles.seeAllText}>Ver todos</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.seeAllText}>Ver todos</Text>
    )}
  </View>
);

const GroupCard = ({ title, icon, onPress }: any) => (
  <TouchableOpacity style={styles.groupCard} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.groupIconContainer}>{icon}</View>
    <Text style={styles.groupCardTitle}>{title}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ title, sub, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.activityItem} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.activityIconCircle, { backgroundColor: color + "20" }]}>
      <Feather name={icon} color={color} size={22} />
    </View>
    <View style={styles.activityTextContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySub}>{sub}</Text>
    </View>
    <Feather name="chevron-right" color="#BDC3C7" size={18} />
  </TouchableOpacity>
);

const NavButton = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress} activeOpacity={0.7}>
    {icon}
    <Text style={[styles.navLabel, active && { color: COLORS.principal, fontWeight: "bold" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.principal,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  greeting: { fontSize: 24, fontWeight: "bold", color: COLORS.white },
  subGreeting: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 20 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodItem: { alignItems: "center" },
  moodCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  moodLabel: { color: COLORS.white, fontSize: 12, marginTop: 8 },
  helpCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -22,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  helpIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(230, 126, 34, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  helpTitle: { fontWeight: "bold", fontSize: 15, color: COLORS.text },
  helpSub: { fontSize: 12, color: COLORS.lightText, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  seeAllText: { fontSize: 13, color: COLORS.principal, fontWeight: "600" },
  horizontalList: { paddingLeft: 22 },
  groupCard: {
    width: 125,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  groupIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  groupCardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  featuredCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  featuredContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  featuredTextContent: { flex: 1 },
  featuredTag: { fontSize: 11, fontWeight: "bold", color: COLORS.principal, letterSpacing: 0.8 },
  featuredTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.text, marginTop: 4 },
  featuredSub: { fontSize: 13, color: COLORS.lightText, marginTop: 2 },
  featuredIconContainer: { marginLeft: 14 },
  verticalList: { paddingHorizontal: 20, gap: 12 },
  activityItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  activityIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTextContent: { flex: 1, marginLeft: 14 },
  activityTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  activitySub: { fontSize: 12, color: COLORS.lightText, marginTop: 2 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
  },
  navButton: { alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 11, color: "#BDC3C7", marginTop: 4 },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text, flex: 1 },
  modalContent: { fontSize: 14, color: "#555", lineHeight: 22, marginBottom: 18 },
  modalButton: {
    backgroundColor: COLORS.principal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },

  // Respiração
  breathBox: { alignItems: "center", marginVertical: 12 },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.principal,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4FAF8",
    marginBottom: 20,
  },
  breathEtapaText: { fontSize: 14, fontWeight: "bold", color: COLORS.text, textAlign: "center" },
  breathCountText: { fontSize: 32, fontWeight: "bold", color: COLORS.principal, marginTop: 4 },

  // Gratidão
  gratidaoBox: { gap: 10, marginBottom: 12 },
  inputGratidao: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  // Sons
  soundList: { gap: 10, marginBottom: 14 },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  soundText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600", color: COLORS.text },
});