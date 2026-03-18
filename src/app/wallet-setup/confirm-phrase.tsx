/**
 * Confirm Phrase — testIDs: confirm-phrase-title, Word #3, #5, #7, #12
 */
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

export default function ConfirmPhraseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mnemonic?: string; walletName?: string }>();
  const words = (params.mnemonic || '').split(',').filter(Boolean);
  const positions = [2, 4, 6, 11]; // Word #3, #5, #7, #12 (0-indexed)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text testID="confirm-phrase-title" style={styles.title}>Confirm Your Secret Phrase</Text>
        <Text style={styles.subtitle}>Select the correct word for each position.</Text>
        {positions.map((pos) => (
          <View key={pos} style={styles.wordRow} testID={`confirm-phrase-word-${pos + 1}`}>
            <Text style={styles.label}>Word #{pos + 1}</Text>
            <Text style={styles.value}>{words[pos] || '—'}</Text>
          </View>
        ))}
      </ScrollView>
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
  wordRow: { marginBottom: 16 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  value: { fontSize: 18, color: colors.text },
});
