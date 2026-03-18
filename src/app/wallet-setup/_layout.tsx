import { WalletSetupProvider } from '@/contexts/WalletSetupContext';
import { Stack } from 'expo-router';

export default function WalletSetupLayout() {
  return (
    <WalletSetupProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WalletSetupProvider>
  );
}
