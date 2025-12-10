import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import TranslatorScreen from './src/screens/TranslatorScreen';
import LoginScreen from './src/screens/LoginScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import translatorAPI from './src/api/translator.api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await translatorAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <TranslatorScreen onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}