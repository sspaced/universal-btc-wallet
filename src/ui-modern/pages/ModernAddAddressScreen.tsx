import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton } from '../components/common/ModernButton';
import { ModernInput } from '../components/common/ModernInput';

export const ModernAddAddressScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    address: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate('ContactsScreen');
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      address: ''
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = t('name_required') || 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('name_too_short') || 'Name must be at least 2 characters';
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = t('address_required') || 'Address is required';
    } else {
      // Basic address validation
      const address = formData.address.trim();
      const isValid = validateAddress(address);
      if (!isValid) {
        newErrors.address = t('invalid_address_format') || 'Invalid address format';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const validateAddress = (address: string): boolean => {
    // Basic Bitcoin address validation (most common)
    const bitcoinPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^bc1p[a-z0-9]{58}$/;
    return bitcoinPattern.test(address);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the contact using the wallet service
      await wallet.addContact({
        name: formData.name.trim(),
        address: formData.address.trim(),
        chain: 'btc' // Default to Bitcoin
      });

      // Navigate back to contacts screen
      navigate('ContactsScreen');
    } catch (error) {
      console.error('Failed to add contact:', error);
      // You could show an error message here
    } finally {
      setIsSubmitting(false);
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
          marginBottom: '32px',
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
          {t('add_address') || 'Add Address'}
        </h1>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flex: 1
        }}>
        {/* Name Field */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              letterSpacing: '-0.08px'
            }}>
            {t('name') || 'Name'}
          </label>
          <ModernInput
            variant="primary"
            size="large"
            placeholder={t('please_enter_name') || 'Please enter name'}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: errors.name ? '1px solid #ff4757' : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff'
            }}
          />
        </div>

        {/* Address Field */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              letterSpacing: '-0.08px'
            }}>
            {t('address') || 'Address'}
          </label>
          <ModernInput
            variant="primary"
            size="large"
            placeholder={t('please_enter_address') || 'Please enter address'}
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: errors.address ? '1px solid #ff4757' : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontFamily: 'monospace'
            }}
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <ModernButton
          variant="primary"
          size="large"
          fullWidth
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}>
          {t('save') || 'Save'}
        </ModernButton>
      </motion.div>
    </div>
  );
};
