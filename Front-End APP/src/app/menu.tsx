import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { logout } from '../services/auth';
import { getNomeUsuario, getEmailUsuario } from '../services/perfil';
import { useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  principal: "#00BFA5",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  text: "#333333",
  lightText: "#999999",
};

export default function Menu() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [emailUsuario, setEmailUsuario] = useState("");

  useEffect(() => {
    async function carregar() {
      const [nome, email] = await Promise.all([getNomeUsuario(), getEmailUsuario()]);
      if (nome) setNomeUsuario(nome);
      if (email) setEmailUsuario(email);
    }
    carregar();
  }, []);
  const [isEnabled, setIsEnabled] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={40} color={COLORS.principal} />
          </View>
          <Text style={styles.userName}>{nomeUsuario}</Text>
          <Text style={styles.userEmail}>{emailUsuario || "carregando..."}</Text>
        </View>

        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.option}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="bell" size={20} color={COLORS.text} />
            <Text style={styles.optionText}>Notificações</Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={() => setIsEnabled(!isEnabled)}
            trackColor={{ false: "#ccc", true: COLORS.principal }}
          />
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            Alert.alert("Editar Perfil", "Funcionalidade em breve!")
          }
        >
          <Feather name="edit-3" size={20} color={COLORS.text} />
          <Text style={styles.optionText}>Editar Informações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Feather name="shield" size={20} color={COLORS.text} />
          <Text style={styles.optionText}>Privacidade e Segurança</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Sobre</Text>
        <TouchableOpacity style={styles.option}>
          <Feather name="info" size={20} color={COLORS.text} />
          <Text style={styles.optionText}>Termos de Uso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { marginTop: 20 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#FF5252" />
          <Text style={[styles.optionText, { color: "#FF5252" }]}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          { height: 70 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <NavButton
          icon={<Feather name="home" color="#BDC3C7" size={24} />}
          label="Início"
          onPress={() => router.push("/dashboard")}
        />
        <NavButton
          icon={<Feather name="users" color="#BDC3C7" size={24} />}
          label="Chat"
          onPress={() => router.push("/chat")}
        />
        <NavButton
          icon={<Feather name="heart" color="#BDC3C7" size={24} />}
          label="Apoio"
          onPress={() => router.push("/apoio")}
        />
        <NavButton
          icon={<Feather name="user" color={COLORS.principal} size={24} />}
          label="Perfil"
          active
        />
      </View>
    </SafeAreaView>
  );
}

const NavButton = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    {icon}
    <Text style={[styles.navLabel, active && { color: COLORS.principal }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 25, paddingBottom: 120 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  headerCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: { fontSize: 18, fontWeight: "bold" },
  userEmail: { color: COLORS.lightText, fontSize: 14 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.lightText,
    marginBottom: 10,
    marginTop: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  optionText: { marginLeft: 15, fontWeight: "600", fontSize: 16 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.white,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navButton: { alignItems: "center" },
  navLabel: { fontSize: 10, color: "#BDC3C7", marginTop: 4 },
});
