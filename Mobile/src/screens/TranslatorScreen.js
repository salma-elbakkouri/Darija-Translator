import { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createStyles } from '../styles/styles.js';
import { useTheme } from '../context/ThemeContext.js';
import translatorAPI from '../api/translator.api.js';
import { speak } from '../utils/texttospeech.js';

export default function TranslatorScreen({ onLogout }) {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState({});
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    const result = await translatorAPI.getSupportedLanguages();
    if (result.success) {
      setLanguages(result.data);
      setSourceLang('en');
      setTargetLang('darija');
    }
    setLoadingLanguages(false);
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      setTranslation('');
      return;
    }

    if (!sourceLang || !targetLang) {
      setError('Please select source and target languages');
      return;
    }

    if (sourceLang === targetLang) {
      setError('Source and target languages must be different');
      return;
    }

    setLoading(true);
    setError('');
    setTranslation('');

    const result = await translatorAPI.translate(text.trim(), sourceLang, targetLang);

    if (result.success) {
      setTranslation(result.data);
    } else {
      setError(result.error);
      if (result.requiresAuth && Platform.OS === 'web') {
        if (window.confirm('Session expired. Please login again.')) {
          await translatorAPI.logout();
          onLogout();
        }
      }
    }

    setLoading(false);
  };

  const speakTranslation = () => {
    const langMap = {
      'ar': 'ar-SA', 'darija': 'ar-MA', 'en': 'en-US',
      'fr': 'fr-FR', 'es': 'es-ES', 'zh': 'zh-CN'
    };
    speak(translation, {
      language: langMap[targetLang] || 'en-US',
      pitch: 1.0,
      rate: 1,
    });
  };

  const renderLanguagePicker = (label, value, onChange) => (
    <View style={styles.pickerWrapper}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        dropdownIconColor={colors.text}
      >
        <Picker.Item label="Select" value="" />
        {Object.entries(languages).map(([code, config]) => (
          <Picker.Item key={code} label={config.name} value={code} color={colors.text} />
        ))}
      </Picker>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={async () => { await translatorAPI.logout(); onLogout(); }}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={isDark ? require('../../assets/logo-dark.png') : require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {!loadingLanguages && Object.keys(languages).length > 0 && (
          <>
            <View style={styles.pickersRow}>
              {renderLanguagePicker('FROM :', sourceLang, (lang) => { setSourceLang(lang); setTranslation(''); })}
              {renderLanguagePicker('TO :', targetLang, (lang) => { setTargetLang(lang); setTranslation(''); })}
            </View>

            <View style={styles.cardsRow}>
              <View style={styles.cardWrapper}>
                <View style={styles.card}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.sectionLabel}>
                      {sourceLang && languages[sourceLang] ? languages[sourceLang].name : 'Source'} Text
                    </Text>
                    {text.length > 0 && (
                      <TouchableOpacity onPress={() => { setText(''); setTranslation(''); setError(''); }}>
                        <Text style={styles.clearButton}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Enter text..."
                    value={text}
                    onChangeText={(t) => { setText(t); if (!t.trim()) { setTranslation(''); setError(''); }}}
                    multiline
                    maxLength={500}
                  />

                  <Text style={[styles.characterCounter, text.length > 450 && styles.characterCounterWarning]}>
                    {text.length}/500 characters
                  </Text>

                  {error && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleTranslate}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Translate</Text>}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardWrapper}>
                {translation ? (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>
                      {targetLang && languages[targetLang] ? languages[targetLang].name : 'Target'} Translation
                    </Text>
                    <Text style={[styles.resultText, (targetLang === 'ar' || targetLang === 'darija') && styles.resultTextRTL]}>
                      {translation}
                    </Text>
                    <TouchableOpacity style={styles.speakButton} onPress={speakTranslation}>
                      <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.resultPlaceholder}>
                    <Text style={styles.placeholderText}>Translation will appear here</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}