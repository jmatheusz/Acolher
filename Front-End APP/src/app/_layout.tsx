import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Layout raiz do aplicativo.
 * Define a pilha de navegação com expo-router e oculta os cabeçalhos
 * padrão para que cada tela cuide do seu próprio cabeçalho.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="cads" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="especialista" />
        <Stack.Screen name="apoio" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="chat/chat" />
      </Stack>
    </>
  );
}
