import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AddressType, RestoreWalletType } from '@/shared/types';
import { Step0 } from '@/ui/pages/Account/createHDWalletComponents/Step0';
import { Step1_Import } from '@/ui/pages/Account/createHDWalletComponents/Step1_Import';
import { Step2 } from '@/ui/pages/Account/createHDWalletComponents/Step2';
import {
  ContextData,
  TabType,
  UpdateContextDataParams,
  WordsType
} from '@/ui/pages/Account/createHDWalletComponents/types';

import { ModernRecoveryPhraseScreen } from './ModernRecoveryPhraseScreen';
import { ModernStep2Screen } from './ModernStep2Screen';

export const ModernCreateHDWalletScreen: React.FC = () => {
  const { state } = useLocation();
  const { isImport } = state as {
    isImport: boolean;
    fromUnlock: boolean;
  };

  const [contextData, setContextData] = useState<ContextData>({
    mnemonics: '',
    hdPath: '',
    passphrase: '',
    addressType: AddressType.P2WPKH,
    step1Completed: false,
    tabType: TabType.STEP1,
    restoreWalletType: RestoreWalletType.UNISAT,
    isRestore: isImport,
    isCustom: false,
    customHdPath: '',
    addressTypeIndex: 0,
    wordsType: WordsType.WORDS_12
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const currentStep = useMemo(() => {
    if (contextData.isRestore) {
      // Import flow - use old components
      if (contextData.tabType === TabType.STEP1) {
        return <Step0 contextData={contextData} updateContextData={updateContextData} />;
      } else if (contextData.tabType === TabType.STEP2) {
        return <Step1_Import contextData={contextData} updateContextData={updateContextData} />;
      } else {
        return <Step2 contextData={contextData} updateContextData={updateContextData} />;
      }
    } else {
      // Create flow - use modern components
      if (contextData.tabType === TabType.STEP1) {
        return <ModernRecoveryPhraseScreen contextData={contextData} updateContextData={updateContextData} />;
      } else {
        return <ModernStep2Screen contextData={contextData} updateContextData={updateContextData} />;
      }
    }
  }, [contextData, updateContextData]);

  return <>{currentStep}</>;
};
