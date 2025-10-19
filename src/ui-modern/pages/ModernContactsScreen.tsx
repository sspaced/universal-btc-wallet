import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { CHAINS_MAP } from '@/shared/constant';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton } from '../components/common/ModernButton';

interface Contact {
  address: string;
  name: string;
  chain: string;
}

export const ModernContactsScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>('all');

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const allContacts = await wallet.listContacts();
      setContacts(allContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNetwork = selectedNetworkFilter === 'all' || contact.chain === selectedNetworkFilter;
    return matchesSearch && matchesNetwork;
  });

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleAddContact = () => {
    navigate('AddAddressScreen', { state: { selectedNetworkFilter } });
  };

  const handleEditContact = (contact: Contact) => {
    navigate('EditContactWithChainScreen', {
      state: {
        address: contact.address,
        chain: contact.chain,
        selectedNetworkFilter
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  const availableNetworks = Array.from(new Set(contacts.map((c) => c.chain)));

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
          {t('address_book')}
        </h1>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px'
        }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={t('search_contacts') || 'Search contacts...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Network Filter */}
        {availableNetworks.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedNetworkFilter('all')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: selectedNetworkFilter === 'all' ? '#121212' : 'rgba(255, 255, 255, 0.7)',
                backgroundColor:
                  selectedNetworkFilter === 'all' ? 'var(--modern-accent-primary)' : 'var(--modern-bg-secondary)',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}>
              {t('all_networks') || 'All Networks'}
            </button>
            {availableNetworks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetworkFilter(network)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: selectedNetworkFilter === network ? '#121212' : 'rgba(255, 255, 255, 0.7)',
                  backgroundColor:
                    selectedNetworkFilter === network ? 'var(--modern-accent-primary)' : 'var(--modern-bg-secondary)',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}>
                {CHAINS_MAP[network]?.label || network}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Contact Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ marginBottom: '24px' }}>
        <ModernButton variant="secondary" size="large" fullWidth onClick={handleAddContact}>
          {t('add_contact') || 'Add Contact'}
        </ModernButton>
      </motion.div>

      {/* Contacts List */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid var(--modern-accent-primary)',
                borderTop: '2px solid transparent',
                animation: 'spin 1s linear infinite'
              }}
            />
            {t('loading_contacts') || 'Loading contacts...'}
          </div>
        </motion.div>
      ) : filteredContacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
            {searchTerm ? t('no_contacts_found') || 'No contacts found' : t('no_contacts') || 'No contacts yet'}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '24px',
              maxWidth: '300px'
            }}>
            {searchTerm
              ? t('try_different_search') || 'Try a different search term'
              : t('add_first_contact') || 'Add your first contact to get started'}
          </p>
          {!searchTerm && (
            <ModernButton variant="primary" onClick={handleAddContact}>
              {t('add_first_contact') || 'Add First Contact'}
            </ModernButton>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
          {filteredContacts.map((contact, index) => (
            <motion.div key={`${contact.address}_${contact.chain}`} variants={itemVariants}>
              <div
                onClick={() => handleEditContact(contact)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(114, 227, 173, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      backgroundImage: `url(${CHAINS_MAP[contact.chain]?.icon})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                    {!CHAINS_MAP[contact.chain]?.icon && '👤'}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '2px'
                      }}>
                      {contact.name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'monospace'
                      }}>
                      {formatAddress(contact.address)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}>
                    {CHAINS_MAP[contact.chain]?.label || contact.chain}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
