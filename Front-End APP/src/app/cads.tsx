import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import { Input } from "../components/input";
import { cadastrar, cadastrarEspecialista } from "../services/auth";

const FRASES = [
  "Sua jornada para o bem-estar começa aqui.",
  "Estamos preparando um espaço seguro para você.",
  "Cuidar de si é o melhor investimento.",
  "Quase pronto! Vamos começar essa caminhada juntos.",
];

export default function Cadastro() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"formulario" | "carregando" | "sucesso">(
    "formulario",
  );
  const [currentFrase, setCurrentFrase] = useState(0);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEspecialista, setIsEspecialista] = useState(false);
  const [crp, setCrp] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [credenciais, setCredenciais] = useState("");
  const [biografia, setBiografia] = useState("");

  // Tratamento de erros por campo e controle de envio único
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const limparErro = (campo: string) => {
    if (erros[campo]) {
      setErros((prev) => {
        const novo = { ...prev };
        delete novo[campo];
        return novo;
      });
    }
  };

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<any>(null);

  const progress = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: any;
    if (etapa === "carregando") {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      interval = setInterval(() => {
        setCurrentFrase((prev) => (prev + 1) % FRASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [etapa]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleFlip = () => {
    Keyboard.dismiss();
    setErros({});
    const targetValue = isEspecialista ? 0 : 180;

    Animated.timing(flipAnim, {
      toValue: targetValue,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsEspecialista(!isEspecialista);

      setNome("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setCrp("");
      setEspecialidade("");
      setCredenciais("");
      setBiografia("");
      setErros({});
    }, 250);
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const handleCadastro = async () => {
    // 1. Evita duplo envio se já estiver em andamento
    if (enviando) return;

    // 2. Validação prévia de campos no cliente
    const novosErros: Record<string, string> = {};

    if (!nome.trim()) {
      novosErros.nome = "Informe o seu nome completo.";
    }
    if (!email.trim()) {
      novosErros.email = "Informe o seu e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = "Formato de e-mail inválido.";
    }

    if (!password) {
      novosErros.password = "Informe a senha.";
    } else if (password.length < 8) {
      novosErros.password = "A senha deve ter pelo menos 8 caracteres.";
    } else {
      const temLetra = /[A-Za-z]/.test(password);
      const temNumero = /\d/.test(password);
      if (!temLetra || !temNumero) {
        novosErros.password = "A senha deve conter ao menos uma letra e um número.";
      }
    }

    if (!isEspecialista) {
      if (!confirmPassword) {
        novosErros.confirmPassword = "Por favor, confirme a sua senha.";
      } else if (password !== confirmPassword) {
        novosErros.confirmPassword = "As senhas digitadas não coincidem.";
      }
    } else {
      if (!crp.trim()) {
        novosErros.crp = "Informe o seu código CRP.";
      }
      if (!especialidade.trim()) {
        novosErros.especialidade = "Informe a sua especialidade clínica.";
      }
      if (!biografia.trim()) {
        novosErros.biografia = "Escreva uma breve apresentação profissional.";
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setEnviando(true);

    try {
      setEtapa("carregando");

      // Criação atômica no backend (já inclui perfil se for especialista)
      const dadosUsuario = await cadastrar({
        nomeCompleto: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: password,
        anonimo: false,
        tipo: isEspecialista ? "especialista" : "usuario",
        crp: isEspecialista ? crp.trim() : undefined,
        especialidade: isEspecialista ? especialidade.trim() : undefined,
        credenciais: isEspecialista ? credenciais.trim() || undefined : undefined,
        biografia: isEspecialista ? biografia.trim() : undefined,
      });

      // Se for especialista, também garante sincronização com endpoint complementar se necessário
      if (isEspecialista && dadosUsuario?.id) {
        try {
          await cadastrarEspecialista({
            usuarioId: dadosUsuario.id,
            nomeCompleto: nome.trim(),
            crm: crp.trim(),
            especialidade: especialidade.trim(),
            credenciais: credenciais.trim() || undefined,
            biografia: biografia.trim(),
            disponivel: true,
          });
        } catch {
          // Já persistido atomicamente no CadastroService
        }
      }

      setEtapa("sucesso");
    } catch (error: any) {
      setEtapa("formulario");
      console.error("Erro no cadastro:", error);

      if (!error.response) {
        Alert.alert(
          "Falha de Conexão",
          "Não foi possível conectar ao servidor. Verifique se o servidor está ativo e se o dispositivo está conectado à mesma rede."
        );
      } else if (error.response?.status === 409) {
        // Conflito tratado: identifica o campo único em duplicidade
        const campo = error.response?.data?.campo || "email";
        const mensagem =
          error.response?.data?.mensagem ||
          error.response?.data?.detail ||
          "Este e-mail já está cadastrado.";

        setErros({ [campo]: mensagem });
        Alert.alert("Cadastro Não Realizado", mensagem);
      } else if (error.response?.status === 400) {
        const camposBackend = error.response?.data?.campos;
        if (camposBackend && typeof camposBackend === "object") {
          setErros(camposBackend);
          const mensagens = Object.values(camposBackend).join("\n");
          Alert.alert("Dados Inválidos", mensagens);
        } else {
          Alert.alert(
            "Erro de Validação",
            error.response?.data?.detail || "Verifique os dados informados."
          );
        }
      } else {
        Alert.alert(
          "Erro no Servidor",
          error.response?.data?.detail ||
            "Não foi possível concluir seu cadastro no momento. Tente novamente mais tarde."
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  if (etapa === "carregando") {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("@/assets/img1.png")}
          style={styles.loadingLogo}
        />
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.fraseBox}>
          <Text style={styles.fraseText}>{FRASES[currentFrase]}</Text>
        </View>
      </View>
    );
  }

  if (etapa === "sucesso") {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <Feather name="check" size={50} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Dados Cadastrados!</Text>
        <Text style={styles.successSubtitle}>
          Sua conta foi criada com sucesso. Agora você já pode acessar o
          sistema.
        </Text>
        <Button
          label="Voltar para o Login"
          onPress={() => router.replace("../")}
          style={styles.buttonDefault}
        />
      </View>
    );
  }

  const canScroll = () => {
    if (isEspecialista) return true;
    if (isKeyboardVisible) return true;
    return false;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#00BFA5" }}
      edges={["right", "left", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#00BFA5" }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ backgroundColor: "#00BFA5" }}
          keyboardShouldPersistTaps="always"
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.container}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Feather name="arrow-left" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFlip}
                  style={styles.toggleButton}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={isEspecialista ? "user" : "user-plus"}
                    size={18}
                    color="#00BFA5"
                  />
                  <Text style={styles.toggleButtonText}>
                    {isEspecialista ? "Sou Paciente" : "Sou Especialista"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={[{ flex: 1, transform: [{ rotateY }] }]}>
                {!isEspecialista ? (
                  <View style={styles.cardInternal}>
                    <Image
                      source={require("@/assets/paciente.png")}
                      style={styles.pacienteIllustration}
                    />

                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={[styles.subtitle, { opacity: 0.8 }]}>
                      Preencha os dados abaixo para começar.
                    </Text>

                    <View style={styles.form}>
                      <Input
                        placeholder="Nome Completo"
                        value={nome}
                        onChangeText={(val) => {
                          setNome(val);
                          limparErro("nome");
                        }}
                        error={erros.nome}
                      />
                      <Input
                        placeholder="E-mail"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(val) => {
                          setEmail(val);
                          limparErro("email");
                        }}
                        error={erros.email}
                      />
                      <Input
                        placeholder="Senha"
                        secureTextEntry
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          limparErro("password");
                        }}
                        error={erros.password}
                      />
                      <Input
                        placeholder="Confirmar Senha"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={(val) => {
                          setConfirmPassword(val);
                          limparErro("confirmPassword");
                        }}
                        error={erros.confirmPassword}
                      />

                      <Button
                        label="Cadastrar"
                        onPress={handleCadastro}
                        loading={enviando}
                        disabled={enviando}
                        style={styles.buttonDefault}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.cardInternal,
                      { transform: [{ rotateY: "180deg" }] },
                    ]}
                  >
                    <Image
                      source={require("@/assets/especialista.png")}
                      style={styles.especialistaIllustration}
                    />

                    <Text style={styles.title}>Especialista</Text>
                    <Text style={[styles.subtitle, { opacity: 0.8 }]}>
                      Insira seus dados profissionais abaixo.
                    </Text>

                    <View style={styles.form}>
                      <Input
                        placeholder="Nome Completo"
                        value={nome}
                        onChangeText={(val) => {
                          setNome(val);
                          limparErro("nome");
                        }}
                        error={erros.nome}
                      />
                      <Input
                        placeholder="E-mail"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(val) => {
                          setEmail(val);
                          limparErro("email");
                        }}
                        error={erros.email}
                      />
                      <Input
                        placeholder="Senha"
                        secureTextEntry
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          limparErro("password");
                        }}
                        error={erros.password}
                      />
                      <Input
                        placeholder="Código CRP"
                        value={crp}
                        onChangeText={(val) => {
                          setCrp(val);
                          limparErro("crp");
                        }}
                        error={erros.crp}
                      />
                      <Input
                        placeholder="Especialidade"
                        value={especialidade}
                        onChangeText={(val) => {
                          setEspecialidade(val);
                          limparErro("especialidade");
                        }}
                        error={erros.especialidade}
                      />
                      <Input
                        placeholder="Credenciais / Títulos"
                        value={credenciais}
                        onChangeText={(val) => {
                          setCredenciais(val);
                          limparErro("credenciais");
                        }}
                        error={erros.credenciais}
                      />

                      <View
                        style={[
                          styles.bioContainer,
                          erros.biografia ? styles.bioContainerError : null,
                        ]}
                      >
                        <TextInput
                          placeholder="Biografia / Resumo"
                          placeholderTextColor="#a0a0a0"
                          value={biografia}
                          onChangeText={(val) => {
                            setBiografia(val);
                            limparErro("biografia");
                          }}
                          multiline={true}
                          numberOfLines={4}
                          maxLength={500}
                          style={styles.bioInput}
                        />
                      </View>
                      {erros.biografia ? (
                        <Text style={styles.errorBio}>{erros.biografia}</Text>
                      ) : null}

                      <Text style={styles.counterText}>
                        {biografia.length}/500 caracteres
                      </Text>

                      <Button
                        label="Cadastrar Especialista"
                        onPress={handleCadastro}
                        loading={enviando}
                        disabled={enviando}
                        style={styles.buttonDefault}
                      />
                    </View>
                  </View>
                )}
              </Animated.View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00BFA5",
    padding: 32,
    paddingBottom: Platform.OS === "android" ? 50 : 32,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 40,
    width: "100%",
  },
  backButton: { marginLeft: -12, padding: 4 },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginRight: -12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleButtonText: {
    color: "#00BFA5",
    fontWeight: "bold",
    fontSize: 13,
  },
  cardInternal: { flex: 1 },
  pacienteIllustration: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    marginTop: -46,
  },
  especialistaIllustration: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    marginTop: -46,
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "900", color: "#ffffff" },
  subtitle: { fontSize: 16, color: "#000000" },
  form: { marginTop: 24, gap: 12 },

  bioContainer: {
    width: "100%",
    height: 110,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  bioContainerError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorBio: {
    color: "#FFFFFF",
    backgroundColor: "#EF4444",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    marginTop: -4,
    alignSelf: "flex-start",
    fontWeight: "500",
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    textAlignVertical: "top",
  },
  counterText: {
    color: "#ffffff",
    fontSize: 11,
    textAlign: "right",
    marginTop: -4,
    opacity: 0.8,
  },

  buttonDefault: {
    width: "100%",
    height: 48,
    backgroundColor: "#00238e",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingLogo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 40,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#00BFA5" },
  fraseBox: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  fraseText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    fontStyle: "italic",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00BFA5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
});
