import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const lightColors = {
  primary: '#059328',
  background: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
  clearText: '#20448bff',
  inputBg: '#f9fafb',
  inputBorder: '#e8e5ebff',
  cardBg: '#ffffff',
  resultBg: '#effff3ff',
  button: '#059328',
  error: '#dc2626',
  errorBg: '#fef2f2',
};

const darkColors = {
  primary: '#10b981',
  background: '#111827',
  text: '#f9fafb',
  textLight: '#9ca3af',
  clearText: '#60a5fa',
  inputBg: '#1f2937',
  inputBorder: '#374151',
  cardBg: '#1f2937',
  resultBg: '#4a5c80ff',
  button: '#10b981',
  error: '#ffb5b5ff',
  errorBg: '#c43232ff',
};