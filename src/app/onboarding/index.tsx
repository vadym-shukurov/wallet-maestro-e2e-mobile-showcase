/**
 * Onboarding screen — Create Wallet / Import Wallet buttons.
 * testIDs: onboarding-title, onboarding-subtitle, onboarding-wallet-button, onboarding-download-button
 */
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text testID="onboarding-title" style={styles.title}>Welcome!</Text>
        <Text testID="onboarding-subtitle" style={styles.subtitle}>
          Set up your wallet and start exploring the crypto world.
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            testID="onboarding-wallet-button"
            style={[styles.btn, styles.btnFilled]}
            onPress={() => router.push('/wallet-setup/name-wallet')}
          >
            <Text style={styles.btnTextFilled}>Create Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="onboarding-download-button"
            style={[styles.btn, styles.btnTinted]}
            onPress={() => router.push('/wallet-setup/import-wallet')}
          >
            <Text style={styles.btnTextTinted}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 48 },
  buttons: { gap: 12 },
  btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary },
  btnFilled: { backgroundColor: colors.primary },
  btnTinted: { backgroundColor: colors.tintedBackground },
  btnTextFilled: { fontSize: 16, fontWeight: '600', color: colors.black },
  btnTextTinted: { fontSize: 16, fontWeight: '600', color: colors.primary },
});
