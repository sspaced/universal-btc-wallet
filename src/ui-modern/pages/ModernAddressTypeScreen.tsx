import { motion } from 'framer-motion';
import log from 'loglevel';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount, useReloadAccounts } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { satoshisToAmount, useWallet } from '@/ui/utils';
import { KeyringType } from '@unisat/keyring-service/types';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernAddressTypeCard } from '../components/common/ModernAddressTypeCard';

export const ModernAddressTypeScreen: React.FC = () => {
  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const reloadAccounts = useReloadAccounts();
  const tools = useTools();

  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressAssets, setAddressAssets] = useState<{
    [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
  }>({});

  const selfRef = useRef<{
    addressAssets: { [key: string]: { total_btc: string; satoshis: number; total_inscription: number } };
  }>({
    addressAssets: {}
  });
  const self = selfRef.current;

  const loadAddresses = async () => {
    try {
      tools.showLoading(true);
      const _res = await wallet.getAllAddresses(currentKeyring, account.index || 0);
      setAddresses(_res);
      const balances = await wallet.getMultiAddressAssets(_res.join(','));
      for (let i = 0; i < _res.length; i++) {
        const address = _res[i];
        const balance = balances[i];
        const satoshis = balance.totalSatoshis;
        self.addressAssets[address] = {
          total_btc: satoshisToAmount(balance.totalSatoshis),
          satoshis,
          total_inscription: balance.inscriptionCount
        };
      }
      setAddressAssets(self.addressAssets);
    } catch (e) {
      log.error(e);
    } finally {
      tools.showLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const addressTypes = useMemo(() => {
    // Cold wallets do not allow switching address types, only show the current type
    if (currentKeyring.type === KeyringType.ColdWalletKeyring) {
      return ADDRESS_TYPES.filter((v) => v.value === currentKeyring.addressType);
    }

    if (currentKeyring.type === KeyringType.HdKeyring) {
      return ADDRESS_TYPES.filter((v) => {
        if (v.displayIndex < 0) {
          return false;
        }
        const address = addresses[v.value];
        const balance = addressAssets[address];
        if (v.isUnisatLegacy) {
          if (!balance || balance.satoshis == 0) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => a.displayIndex - b.displayIndex);
    } else {
      return ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && v.isUnisatLegacy != true).sort(
        (a, b) => a.displayIndex - b.displayIndex
      );
    }
  }, [currentKeyring.type, currentKeyring.addressType, addressAssets, addresses]);

  const handleBack = () => {
    window.history.go(-1);
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
        padding: '16px',
        backgroundColor: 'var(--modern-bg-primary)'
      }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '12px'
        }}>
        <button
          onClick={handleBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--modern-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--modern-bg-secondary)';
          }}>
          <span style={{ color: '#ffffff', fontSize: '18px' }}>←</span>
        </button>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0
          }}>
          Address Type
        </h1>
      </motion.div>

      {/* Address Type Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
        {addressTypes.map((item, index) => {
          const address = addresses[item.value];
          const assets = addressAssets[address] || {
            total_btc: '--',
            satoshis: 0,
            total_inscription: 0
          };
          let name = `${item.name} (${item.hdPath}/${account.index})`;
          if (currentKeyring.type === KeyringType.SimpleKeyring) {
            name = `${item.name}`;
          } else if (currentKeyring.type === KeyringType.ColdWalletKeyring) {
            name = `❄️ ${item.name} (${item.hdPath}/${account.index}) - Fixed by cold wallet`;
          }

          return (
            <motion.div key={index} variants={itemVariants}>
              <ModernAddressTypeCard
                label={name}
                address={address}
                balance={assets.total_btc}
                inscriptionCount={assets.total_inscription}
                checked={item.value == currentKeyring.addressType}
                onClick={async () => {
                  if (item.value == currentKeyring.addressType) {
                    return;
                  }

                  // Cold wallets do not allow switching address types
                  if (currentKeyring.type === KeyringType.ColdWalletKeyring) {
                    tools.toastError(t('cold_wallet_address_type_cannot_be_changed'));
                    return;
                  }

                  await wallet.changeAddressType(item.value);
                  reloadAccounts();
                  navigate('MainScreen');
                  tools.toastSuccess(t('address_type_changed_successfully'));
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          marginTop: '24px',
          padding: '14px',
          backgroundColor: 'rgba(114, 227, 173, 0.08)',
          border: '1px solid rgba(114, 227, 173, 0.2)',
          borderRadius: '10px',
          maxWidth: '600px',
          margin: '24px auto 0'
        }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5',
            letterSpacing: '-0.08px'
          }}>
          Choose the address type for your Bitcoin wallet. Each type has different features and compatibility.
        </div>
      </motion.div>
    </div>
  );
};
