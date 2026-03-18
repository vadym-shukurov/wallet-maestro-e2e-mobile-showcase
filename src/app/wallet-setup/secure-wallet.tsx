/**
 * Secure Your Wallet — mock seed phrase, testIDs: secure-wallet-title, seed-word-value-*, toggle-visibility-button, secure-wallet-next-button
 */
import { SeedPhrase } from '@/components/SeedPhrase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Copy, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

const MOCK_SEED = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu'.split(' ');

export default function SecureWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ walletName?: string }>();
  const [showPhrase, setShowPhrase] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text testID="secure-wallet-title" style={styles.title}>Secure Your Wallet</Text>
        <Text style={styles.subtitle}>This secret phrase is the only way to recover your wallet.</Text>
        <SeedPhrase words={MOCK_SEED} editable={false} hidden={!showPhrase} />
        <View style={styles.actions}>
          <TouchableOpacity testID="copy-phrase-button" style={styles.actionBtn}>
            <Copy size={20} color={colors.primary} />
            <Text style={styles.actionText}>Copy Phrase</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="toggle-visibility-button" style={styles.actionBtn} onPress={() => setShowPhrase(!showPhrase)}>
            {showPhrase ? <EyeOff size={20} color={colors.primary} /> : <Eye size={20} color={colors.primary} />}
            <Text style={styles.actionText}>{showPhrase ? 'Hide Phrase' : 'Show Phrase'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          testID="secure-wallet-next-button"
          style={styles.nextBtn}
          onPress={() => router.push({ pathname: '/wallet-setup/confirm-phrase', params: { mnemonic: MOCK_SEED.join(','), walletName: params.walletName } })}
        >
          <Text style={styles.nextText}>Next</Text>
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
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tintedBackground, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: colors.primary },
  actionText: { color: colors.primary, fontSize: 16, marginLeft: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 20 },
  nextBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextText: { fontSize: 18, fontWeight: '600', color: colors.black },
});
