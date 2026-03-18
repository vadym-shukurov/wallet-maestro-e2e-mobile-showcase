/**
 * WalletSetupContext — holds seed phrase in memory during import flow.
 * Avoids passing sensitive data via URL params (which can be logged/cached).
 */
import React, { createContext, useCallback, useContext, useState } from 'react';

type WalletSetupContextValue = {
  seedPhrase: string | null;
  setSeedPhrase: (phrase: string | null) => void;
};

const WalletSetupContext = createContext<WalletSetupContextValue | null>(null);

export function WalletSetupProvider({ children }: { children: React.ReactNode }) {
  const [seedPhrase, setSeedPhraseState] = useState<string | null>(null);
  const setSeedPhrase = useCallback((phrase: string | null) => {
    setSeedPhraseState(phrase);
  }, []);
  return (
    <WalletSetupContext.Provider value={{ seedPhrase, setSeedPhrase }}>
      {children}
    </WalletSetupContext.Provider>
  );
}

export function useWalletSetup() {
  const ctx = useContext(WalletSetupContext);
  if (!ctx) throw new Error('useWalletSetup must be used within WalletSetupProvider');
  return ctx;
}
