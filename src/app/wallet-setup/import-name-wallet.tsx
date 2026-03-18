/**
 * Name Imported Wallet — testIDs: import-name-wallet-title, import-wallet-name-input, import-name-wallet-submit-button, import-wallet-loading
 */
import { useWalletSetup } from '@/contexts/WalletSetupContext';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function ImportNameWalletScreen() {
  const router = useRouter();
  const { setSeedPhrase } = useWalletSetup();
  const insets = useSafeAreaInsets();
  const [walletName, setWalletName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSeedPhrase(null);
    setIsImporting(false);
    router.replace('/wallet');
  };

  const isDisabled = walletName.length === 0 || isImporting;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <Text testID="import-name-wallet-title" style={styles.title}>Name Your Wallet</Text>
          <Text style={styles.subtitle}>This name is just for you and can be changed later.</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Wallet Name*</Text>
            <TextInput
              testID="import-wallet-name-input"
              style={styles.input}
              value={walletName}
              onChangeText={setWalletName}
              placeholder="e.g., Investment Stash"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          testID="import-name-wallet-submit-button"
          style={[styles.importBtn, isDisabled && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={isDisabled}
        >
          {isImporting ? (
            <View testID="import-wallet-loading" style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.textTertiary} />
              <Text style={[styles.importText, { marginLeft: 8 }]}>Importing...</Text>
            </View>
          ) : (
            <Text style={[styles.importText, isDisabled && styles.importTextDisabled]}>Import Wallet</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: colors.primary, fontSize: 16, marginLeft: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  inputWrap: { marginBottom: 24 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  input: { height: 50, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, color: colors.text, fontSize: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 20 },
  importBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  importBtnDisabled: { backgroundColor: colors.card },
  importText: { fontSize: 18, fontWeight: '600', color: colors.black },
  importTextDisabled: { color: colors.textTertiary },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
