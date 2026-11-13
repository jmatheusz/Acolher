import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MessageResponse } from "../types/chat";

export interface MessageBubbleProps {
  mensagem: MessageResponse;
  usuarioLogadoId: number | null;
  mostrarData?: boolean;
  dataCabecalho?: string;
}

export function MessageBubble({
  mensagem,
  usuarioLogadoId,
  mostrarData,
  dataCabecalho,
}: MessageBubbleProps) {
  // Regra obrigatória: A decisão "minha ou do outro" é EXCLUSIVAMENTE remetenteId === usuarioLogadoId
  const eMinha =
    usuarioLogadoId !== null &&
    mensagem.remetenteId !== undefined &&
    mensagem.remetenteId !== null &&
    Number(mensagem.remetenteId) === Number(usuarioLogadoId);

  const formatarHora = (dataIso?: string) => {
    if (!dataIso) return "";
    try {
      const d = new Date(dataIso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <View style={styles.container}>
      {mostrarData && dataCabecalho ? (
        <View style={styles.dataSeparator}>
          <Text style={styles.dataSeparatorText}>{dataCabecalho}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.balaoWrapper,
          eMinha ? styles.balaoWrapperDireita : styles.balaoWrapperEsquerda,
        ]}
      >
        <View
          style={[
            styles.balao,
            eMinha ? styles.balaoEnviado : styles.balaoRecebido,
          ]}
        >
          <Text
            style={[
              styles.balaoTexto,
              eMinha ? styles.textoEnviado : styles.textoRecebido,
            ]}
          >
            {mensagem.conteudoTexto}
          </Text>

          <View style={styles.balaoRodape}>
            <Text
              style={[
                styles.balaoHora,
                eMinha ? styles.horaEnviada : styles.horaRecebida,
              ]}
            >
              {formatarHora(mensagem.enviadaEm)}
            </Text>

            {/* Status de entrega/leitura exibido SOMENTE em mensagens próprias */}
            {eMinha && (
              <Feather
                name={mensagem.lida ? "check-circle" : "check"}
                size={12}
                color={mensagem.lida ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dataSeparator: {
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 12,
  },
  dataSeparatorText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  balaoWrapper: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  balaoWrapperDireita: {
    justifyContent: "flex-end",
  },
  balaoWrapperEsquerda: {
    justifyContent: "flex-start",
  },
  balao: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  balaoEnviado: {
    backgroundColor: "#00BFA5",
    borderBottomRightRadius: 4,
  },
  balaoRecebido: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  balaoTexto: {
    fontSize: 15,
    lineHeight: 20,
  },
  textoEnviado: {
    color: "#FFFFFF",
  },
  textoRecebido: {
    color: "#1E293B",
  },
  balaoRodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  balaoHora: {
    fontSize: 10,
  },
  horaEnviada: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  horaRecebida: {
    color: "#94A3B8",
  },
});

