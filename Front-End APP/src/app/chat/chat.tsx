import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble } from "../../components/MessageBubble";
import { useChat } from "../../hooks/useChat";

const COLORS = {
  principal: "#00BFA5",
  principalDark: "#00897B",
  fundo: "#F1F5F9",
  card: "#FFFFFF",
  texto: "#1E293B",
  textoClaro: "#64748B",
  borda: "#E2E8F0",
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chatId, nome, foto } = useLocalSearchParams<{
    chatId: string;
    nome?: string;
    foto?: string;
  }>();

  const idConversa = Number(chatId);
  const [texto, setTexto] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Hook desacoplado de chat com STOMP WebSocket e sincronização
  const { mensagens, meuId, loading, enviando, conectado, enviar } = useChat(idConversa);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensagens.length]);

  const handleEnviar = async () => {
    const textoLimpo = texto.trim();
    if (!textoLimpo || enviando) return;

    setTexto("");
    try {
      await enviar(textoLimpo);
    } catch {
      // O erro já é tratado no hook com reversão otimista
    }
  };

  const formatarDataCabecalho = (dataIso?: string) => {
    if (!dataIso) return "";
    try {
      const d = new Date(dataIso);
      const hoje = new Date();
      if (
        d.getDate() === hoje.getDate() &&
        d.getMonth() === hoje.getMonth() &&
        d.getFullYear() === hoje.getFullYear()
      ) {
        return "Hoje";
      }

      const ontem = new Date();
      ontem.setDate(hoje.getDate() - 1);
      if (
        d.getDate() === ontem.getDate() &&
        d.getMonth() === ontem.getMonth() &&
        d.getFullYear() === ontem.getFullYear()
      ) {
        return "Ontem";
      }

      return d.toLocaleDateString([], { day: "2-digit", month: "long" });
    } catch {
      return "";
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Cabeçalho do Chat */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerAvatarContainer}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarInitial}>
                {nome ? nome.charAt(0).toUpperCase() : "P"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerNome} numberOfLines={1}>
            {nome || "Atendimento Acolher"}
          </Text>
          <View style={styles.headerStatusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: conectado ? "#34D399" : "#FBBF24" },
              ]}
            />
            <Text style={styles.headerStatusText}>
              {conectado ? "Em tempo real" : "Conectando..."}
            </Text>
          </View>
        </View>
      </View>

      {/* Área de Mensagens */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.principal} />
          <Text style={styles.loadingText}>Carregando mensagens...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.mensagensContent,
            { paddingBottom: 16 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Feather name="shield" size={36} color={COLORS.principal} />
              </View>
              <Text style={styles.emptyTitle}>Espaço Seguro e Confidencial</Text>
              <Text style={styles.emptySubtitle}>
                Esta conversa é protegida com privacidade ética e sigilo. Envie uma mensagem
                para iniciar seu diálogo acolhedor.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const dataAtual = item.enviadaEm ? item.enviadaEm.substring(0, 10) : "";
            const dataAnterior =
              index > 0 && mensagens[index - 1].enviadaEm
                ? mensagens[index - 1].enviadaEm.substring(0, 10)
                : "";
            const mostrarData = dataAtual !== dataAnterior && !!item.enviadaEm;

            return (
              <MessageBubble
                mensagem={item}
                usuarioLogadoId={meuId}
                mostrarData={mostrarData}
                dataCabecalho={formatarDataCabecalho(item.enviadaEm)}
              />
            );
          }}
        />
      )}

      {/* Campo de Envio de Mensagem */}
      <View
        style={[
          styles.inputArea,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem acolhedora..."
            placeholderTextColor="#94A3B8"
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={5000}
            editable={!enviando}
          />

          <TouchableOpacity
            onPress={handleEnviar}
            disabled={!texto.trim() || enviando}
            style={[
              styles.sendButton,
              texto.trim() && !enviando
                ? styles.sendButtonActive
                : styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Feather name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundo,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.principal,
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerAvatarContainer: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerInfo: {
    flex: 1,
  },
  headerNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerStatusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textoClaro,
  },
  mensagensContent: {
    paddingTop: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0, 191, 165, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.texto,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textoClaro,
    textAlign: "center",
    lineHeight: 18,
  },
  inputArea: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borda,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borda,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.texto,
    maxHeight: 120,
    paddingTop: Platform.OS === "ios" ? 4 : 0,
    paddingBottom: Platform.OS === "ios" ? 4 : 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: COLORS.principal,
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
});
