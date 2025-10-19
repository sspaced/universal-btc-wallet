import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AddressType, RestoreWalletType } from '@/shared/types';
import {
    ContextData,
    TabType,
    UpdateContextDataParams,
    WordsType
} from '@/ui/pages/Account/createHDWalletComponents/types';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernRecoveryPhraseImportScreen } from './ModernRecoveryPhraseImportScreen';
import { ModernRecoveryPhraseScreen } from './ModernRecoveryPhraseScreen';
import { ModernStep2Screen } from './ModernStep2Screen';
import { ModernWalletSelectionScreen } from './ModernWalletSelectionScreen';

export const ModernCreateHDWalletScreen: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isImport, restoreWalletType: initialRestoreWalletType } = (state || {
    isImport: false,
    fromUnlock: false
  }) as {
    isImport: boolean;
    fromUnlock: boolean;
    restoreWalletType?: RestoreWalletType;
  };

  const [contextData, setContextData] = useState<ContextData>({
    mnemonics: '',
    hdPath: '',
    passphrase: '',
    addressType: AddressType.P2WPKH,
    step1Completed: false,
    tabType: isImport && !initialRestoreWalletType ? TabType.STEP1 : isImport ? TabType.STEP2 : TabType.STEP1,
    restoreWalletType: initialRestoreWalletType || RestoreWalletType.UNISAT,
    isRestore: isImport,
    isCustom: false,
    customHdPath: '',
    addressTypeIndex: 0,
    wordsType: WordsType.WORDS_12
  });

  // Show wallet selection screen if in import mode and no wallet type selected
  const [showWalletSelection, setShowWalletSelection] = useState(isImport && !initialRestoreWalletType);

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      // Si on est en mode import et qu'on revient à STEP1, on doit revenir à la sélection de wallet
      if (contextData.isRestore && params.tabType === TabType.STEP1 && contextData.tabType === TabType.STEP2) {
        setShowWalletSelection(true);
        return;
      }
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const handleWalletSelect = useCallback(
    (walletType: RestoreWalletType) => {
      updateContextData({
        restoreWalletType: walletType,
        tabType: TabType.STEP2
      });
      setShowWalletSelection(false);
    },
    [updateContextData]
  );

  const currentStep = useMemo(() => {
    // Show wallet selection if in import mode and no wallet type selected
    if (showWalletSelection) {
      return <ModernWalletSelectionScreen onWalletSelect={handleWalletSelect} />;
    }

    if (contextData.isRestore) {
      // Import flow - use modern components for all steps
      if (contextData.tabType === TabType.STEP2) {
        return <ModernRecoveryPhraseImportScreen contextData={contextData} updateContextData={updateContextData} />;
      } else {
        return <ModernStep2Screen contextData={contextData} updateContextData={updateContextData} />;
      }
    } else {
      // Create flow - use modern components
      if (contextData.tabType === TabType.STEP1) {
        return <ModernRecoveryPhraseScreen contextData={contextData} updateContextData={updateContextData} />;
      } else {
        return <ModernStep2Screen contextData={contextData} updateContextData={updateContextData} />;
      }
    }
  }, [contextData, updateContextData, showWalletSelection, handleWalletSelect]);

  return <>{currentStep}</>;
};
