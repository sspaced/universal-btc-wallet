import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { isValidAddress } from '@/ui/utils';

import { ModernInput } from '../common/ModernInput';

export interface ModernAddressInputProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const ModernAddressInput: React.FC<ModernAddressInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  autoFocus = false,
  onBlur
}) => {
  const { t } = useI18n();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Validation en temps réel
    if (newValue.length > 0) {
      const valid = isValidAddress(newValue);
      setIsValid(valid);
    } else {
      setIsValid(null);
    }
  };

  // Wrapper pour gérer l'événement onChange de motion.input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    handleChange(newValue);
  };

  // Gestionnaire pour l'événement onPaste
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';

    // Nettoyer le texte collé (supprimer les espaces, retours à la ligne, etc.)
    const cleanedText = pastedText.trim().replace(/\s+/g, '');

    // Mettre à jour la valeur
    handleChange(cleanedText);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const getValidationState = () => {
    if (value.length === 0) return null;
    if (isValid === true) return 'success';
    if (isValid === false) return 'error';
    return null;
  };

  const getHelperText = () => {
    if (value.length === 0) return t('enter_valid_bitcoin_address');
    if (isValid === true) return t('valid_bitcoin_address');
    if (isValid === false) return t('invalid_bitcoin_address_format');
    return '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ModernInput
        label={label || t('recipient_address')}
        placeholder={placeholder || t('enter_bitcoin_address')}
        value={value}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        error={getValidationState() === 'error' ? getHelperText() : error}
        success={getValidationState() === 'success'}
        helperText={getValidationState() === null ? getHelperText() : undefined}
        rightIcon={
          value.length > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
              {isValid === true ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34C759"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : isValid === false ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff3b30"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : null}
            </motion.div>
          )
        }
      />
    </motion.div>
  );
};
