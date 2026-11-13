import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  listarConversas,
  listarEspecialistas,
  criarOuRecuperarChat,
} from '../../services/chat';
import { getTipoUsuario } from '../../services/perfil';
import { ChatSummary, Especialista } from '../../types/chat';

const COLORS = {
  principal: "#00BFA5",
  principalDark: "#00897B",
  fundo: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  subtext: "#64748B",
  borda: "#E2E8F0",
  badge: "#00BFA5",
  branco: "#FFFFFF",
};

export default function ListaDeConversas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [abaAtiva, setAbaAtiva] = useState<'conversas' | 'especialistas'>('conversas');
  const [conversas, setConversas] = useState<ChatSummary[]>([]);
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<string>("usuario");
  const [iniciandoChat, setIniciandoChat] = useState<number | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const [listaConversas, listaEsp, tipo] = await Promise.all([
        listarConversas().catch((err) => {
          console.warn('Erro ao carregar conversas:', err);
          return [] as ChatSummary[];
        }),
        listarEspecialistas().catch((err) => {
          console.warn('Erro ao carregar especialistas:', err);
          return [] as Especialista[];
        }),
        getTipoUsuario().catch(() => "usuario"),
      ]);

      setConversas(listaConversas);
      setEspecialistas(listaEsp);
      if (tipo) setTipoUsuario(tipo.toLowerCase());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const handleAbrirChatExistente = (chat: ChatSummary) => {
    router.push({
      pathname: "/chat/chat",
      params: {
        chatId: chat.id.toString(),
        nome: chat.outroParticipanteNome,
        foto: chat.outroParticipanteFoto || "",
        outroId: chat.outroParticipanteId.toString(),
      },
    });
  };

  const handleIniciarChatComEspecialista = async (esp: Especialista) => {
    try {
      setIniciandoChat(esp.usuarioId);
      const chat = await criarOuRecuperarChat(esp.usuarioId);
      router.push({
        pathname: "/chat/chat",
        params: {
          chatId: chat.id.toString(),
          nome: esp.nomeCompleto,
          foto: esp.fotoPerfil || esp.imagemAvatar || "",
          outroId: esp.usuarioId.toString(),
        },
      });
    } catch (error) {
      console.error('Erro ao iniciar chat com especialista:', error);
    } finally {
      setIniciandoChat(null);
    }
  };

  const formatarHorario = (dataIso?: string | null) => {
    if (!dataIso) return "";
    try {
      const data = new Date(dataIso);
      const hoje = new Date();
      const mesmoDia =
        data.getDate() === hoje.getDate() &&
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear();

      if (mesmoDia) {
        return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const ontem = new Date();
      ontem.setDate(hoje.getDate() - 1);
      const foiOntem =
        data.getDate() === ontem.getDate() &&
        data.getMonth() === ontem.getMonth() &&
        data.getFullYear() === ontem.getFullYear();

      if (foiOntem) return "Ontem";

      return data.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch {
      return "";
    }
  };

  const conversasFiltradas = conversas.filter((c) =>
    c.outroParticipanteNome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (c.ultimaMensagem && c.ultimaMensagem.toLowerCase().includes(pesquisa.toLowerCase()))
  );

  const especialistasFiltrados = especialistas.filter((e) =>
    e.nomeCompleto.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (e.especialidade && e.especialidade.toLowerCase().includes(pesquisa.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Conversas</Text>
            <Text style={styles.headerSubtitle}>Apoio psicológico e orientações</Text>
          </View>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar conversas ou psicólogos..."
            placeholderTextColor="#94A3B8"
            value={pesquisa}
            onChangeText={setPesquisa}
          />
          {pesquisa.length > 0 && (
            <TouchableOpacity onPress={() => setPesquisa("")}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Abas Alternadoras */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, abaAtiva === 'conversas' && styles.tabButtonActive]}
            onPress={() => setAbaAtiva('conversas')}
          >
            <Text style={[styles.tabText, abaAtiva === 'conversas' && styles.tabTextActive]}>
              Minhas Conversas ({conversas.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, abaAtiva === 'especialistas' && styles.tabButtonActive]}
            onPress={() => setAbaAtiva('especialistas')}
          >
            <Text style={[styles.tabText, abaAtiva === 'especialistas' && styles.tabTextActive]}>
              Psicólogos Disponíveis
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo Principal */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.principal} />
          <Text style={styles.loadingText}>Carregando conversas...</Text>
        </View>
      ) : abaAtiva === 'conversas' ? (
        <FlatList
          data={conversasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.principal]} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 85 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="message-circle" size={40} color={COLORS.principal} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma conversa iniciada</Text>
              <Text style={styles.emptySubtitle}>
                {tipoUsuario === 'especialista'
                  ? "Você ainda não possui atendimentos iniciados com pacientes."
                  : "Conecte-se com um de nossos psicólogos acolhedores para começar seu atendimento."}
              </Text>
              {tipoUsuario !== 'especialista' && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setAbaAtiva('especialistas')}
                  activeOpacity={0.8}
                >
                  <Feather name="user-plus" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyButtonText}>Ver Psicólogos Disponíveis</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleAbrirChatExistente(item)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                {item.outroParticipanteFoto ? (
                  <Image source={{ uri: item.outroParticipanteFoto }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {item.outroParticipanteNome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.outroParticipanteNome}
                  </Text>
                  <Text style={styles.cardTime}>
                    {formatarHorario(item.ultimaMensagemHorario || item.criadoEm)}
                  </Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text
                    style={[
                      styles.cardMessage,
                      item.mensagensNaoLidas > 0 && styles.cardMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.ultimaMensagem || "Conversa iniciada"}
                  </Text>

                  {item.mensagensNaoLidas > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {item.mensagensNaoLidas > 99 ? '99+' : item.mensagensNaoLidas}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={especialistasFiltrados}
          keyExtractor={(item) => item.usuarioId.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.principal]} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 85 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={40} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhum psicólogo encontrado</Text>
              <Text style={styles.emptySubtitle}>Tente pesquisar por outro nome ou especialidade.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleIniciarChatComEspecialista(item)}
              activeOpacity={0.7}
              disabled={iniciandoChat === item.usuarioId}
            >
              <View style={styles.avatarContainer}>
                {item.fotoPerfil || item.imagemAvatar ? (
                  <Image source={{ uri: (item.fotoPerfil || item.imagemAvatar)! }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: '#E0F2F1' }]}>
                    <Text style={styles.avatarInitial}>
                      {item.nomeCompleto.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.nomeCompleto}
                  </Text>
                  {item.codigoCrp && (
                    <Text style={styles.crpBadge}>CRP {item.codigoCrp}</Text>
                  )}
                </View>

                <Text style={styles.especialidadeText} numberOfLines={1}>
                  {item.especialidade || "Psicólogo(a) Clínico(a)"}
                </Text>

                <View style={styles.cardActionRow}>
                  <Text style={styles.iniciarChatLink}>Iniciar atendimento</Text>
                  {iniciandoChat === item.usuarioId ? (
                    <ActivityIndicator size="small" color={COLORS.principal} />
                  ) : (
                    <Feather name="arrow-right" size={16} color={COLORS.principal} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Barra de Navegação Inferior */}
      <View style={[styles.bottomNav, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push(tipoUsuario === 'especialista' ? "/especialista" as any : "/dashboard" as any)}
        >
          <Feather name="home" color="#94A3B8" size={22} />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="message-square" color={COLORS.principal} size={22} />
          <Text style={[styles.navLabel, { color: COLORS.principal, fontWeight: '700' }]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/apoio" as any)}>
          <Feather name="heart" color="#94A3B8" size={22} />
          <Text style={styles.navLabel}>Apoio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/menu" as any)}>
          <Feather name="user" color="#94A3B8" size={22} />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundo,
  },
  header: {
    backgroundColor: COLORS.principal,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  tabTextActive: {
    color: COLORS.principalDark,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.subtext,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borda,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.principal,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.subtext,
    marginLeft: 8,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.subtext,
    flex: 1,
    marginRight: 8,
  },
  cardMessageUnread: {
    color: COLORS.text,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: COLORS.principal,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  crpBadge: {
    fontSize: 11,
    color: COLORS.principalDark,
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "600",
  },
  especialidadeText: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  iniciarChatLink: {
    fontSize: 13,
    color: COLORS.principal,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: COLORS.principal,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.principal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borda,
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },
});
