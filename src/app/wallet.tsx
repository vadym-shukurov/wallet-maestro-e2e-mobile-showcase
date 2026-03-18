/**
 * Wallet placeholder — shown after import completes.
 * testID: wallet-title (for E2E post-import assertion)
 */
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

export default function WalletScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text testID="wallet-title" style={styles.title}>Wallet (E2E Showcase)</Text>
      <Text style={styles.subtitle}>Import flow completed successfully.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/onboarding')}>
        <Text style={styles.btnText}>Back to Onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  btn: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  btnText: { fontSize: 16, fontWeight: '600', color: colors.black },
});
