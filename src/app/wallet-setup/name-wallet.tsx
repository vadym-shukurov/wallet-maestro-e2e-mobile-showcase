/**
 * Name Your Wallet — testIDs: name-wallet-title, wallet-name-input, name-wallet-next-button
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

export default function NameWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [walletName, setWalletName] = useState('');
  const isNextDisabled = walletName.length === 0;

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
          <Text testID="name-wallet-title" style={styles.title}>Name Your Wallet</Text>
          <Text style={styles.subtitle}>This name is just for you and can be changed later.</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Wallet Name*</Text>
            <TextInput
              testID="wallet-name-input"
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
          testID="name-wallet-next-button"
          style={[styles.nextBtn, isNextDisabled && styles.nextBtnDisabled]}
          onPress={() => router.push({ pathname: '/wallet-setup/secure-wallet', params: { walletName } })}
          disabled={isNextDisabled}
        >
          <Text style={[styles.nextText, isNextDisabled && styles.nextTextDisabled]}>Next</Text>
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
  nextBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled: { backgroundColor: colors.card },
  nextText: { fontSize: 18, fontWeight: '600', color: colors.black },
  nextTextDisabled: { color: colors.textTertiary },
});
