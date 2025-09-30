import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES, getRestoreWallets } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { ContextData, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCreateAccountCallback } from '@/ui/state/global/hooks';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { ModernButton } from '../components/common';
import { ModernAddressTypeCard } from '../components/common/ModernAddressTypeCard';

export const ModernStep2Screen: React.FC<{
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}> = ({ contextData, updateContextData }) => {
  const wallet = useWallet();
  const tools = useTools();
  const createAccount = useCreateAccountCallback();
  const navigate = useNavigate();

  const hdPathOptions = useMemo(() => {
    const restoreWallet = getRestoreWallets()[contextData.restoreWalletType];
    return ADDRESS_TYPES.filter((v) => {
      if (v.displayIndex < 0) {
        return false;
      }
      if (!restoreWallet.addressTypes.includes(v.value)) {
        return false;
      }

      if (!contextData.isRestore && v.isUnisatLegacy) {
        return false;
      }

      if (contextData.customHdPath && v.isUnisatLegacy) {
        return false;
      }

      return true;
    })
      .sort((a, b) => a.displayIndex - b.displayIndex)
      .map((v) => {
        return {
          label: v.name,
          hdPath: v.hdPath,
          addressType: v.value,
          isUnisatLegacy: v.isUnisatLegacy
        };
      });
  }, [contextData]);

  const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));
  const [addressAssets, setAddressAssets] = useState<{
    [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
  }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateAddress = async () => {
    const addresses: string[] = [];
    for (let i = 0; i < hdPathOptions.length; i++) {
      const options = hdPathOptions[i];
      try {
        const keyring = await wallet.createTmpKeyringWithMnemonics(
          contextData.mnemonics,
          contextData.customHdPath || options.hdPath,
          contextData.passphrase,
          options.addressType
        );
        keyring.accounts.forEach((v) => {
          addresses.push(v.address);
        });
      } catch (e) {
        console.log(e);
        setError((e as any).message);
        return;
      }
    }
    setPreviewAddresses(addresses);
  };

  useEffect(() => {
    generateAddress();
  }, [contextData.passphrase, contextData.customHdPath]);

  const fetchAddressesBalance = async () => {
    if (!contextData.isRestore) {
      return;
    }

    const addresses = previewAddresses;
    if (!addresses[0]) return;

    setLoading(true);
    const balances = await wallet.getMultiAddressAssets(addresses.join(','));
    setLoading(false);

    const addressAssets: { [key: string]: { total_btc: string; satoshis: number; total_inscription: number } } = {};
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const balance = balances[i];
      const satoshis = balance.totalSatoshis;
      addressAssets[address] = {
        total_btc: satoshisToAmount(balance.totalSatoshis),
        satoshis,
        total_inscription: balance.inscriptionCount
      };
    }
    setAddressAssets(addressAssets);
  };

  useEffect(() => {
    fetchAddressesBalance();
  }, [previewAddresses]);

  useEffect(() => {
    const option = hdPathOptions[0];
    if (option) {
      updateContextData({ addressType: option.addressType, addressTypeIndex: 0 });
    }
  }, []);

  const onNext = async () => {
    try {
      const option = hdPathOptions[contextData.addressTypeIndex];
      const hdPath = contextData.customHdPath || option.hdPath;
      await createAccount(contextData.mnemonics, hdPath, contextData.passphrase, contextData.addressType, 1);
      navigate('MainScreen');
    } catch (e) {
      tools.toastError((e as any).message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#000000'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '520px' }}>
        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}>
          Choose Address Type
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            marginBottom: '24px',
            letterSpacing: '-0.2px'
          }}>
          Select the Bitcoin address type for your wallet
        </motion.p>

        {/* Address Type Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}>
          {hdPathOptions.map((item, index) => {
            const address = previewAddresses[index];
            const assets = addressAssets[address] || {
              total_btc: '--',
              satoshis: 0,
              total_inscription: 0
            };
            const hasVault = contextData.isRestore && assets.satoshis > 0;
            if (item.isUnisatLegacy && !hasVault) {
              return null;
            }

            const hdPath = (contextData.customHdPath || item.hdPath) + '/0';
            return (
              <motion.div key={index} variants={itemVariants}>
                <ModernAddressTypeCard
                  label={`${item.label} (${hdPath})`}
                  address={address}
                  balance={contextData.isRestore ? assets.total_btc : undefined}
                  inscriptionCount={contextData.isRestore ? assets.total_inscription : undefined}
                  checked={index === contextData.addressTypeIndex}
                  loading={loading}
                  onClick={() => {
                    updateContextData({
                      addressTypeIndex: index,
                      addressType: item.addressType
                    });
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '10px',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
            <p style={{ fontSize: '13px', color: '#ff3b30', margin: 0 }}>{error}</p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}>
          <ModernButton variant="primary" size="medium" onClick={onNext} fullWidth disabled={!!error}>
            Continue
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
