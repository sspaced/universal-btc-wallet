import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import WalletResetService from '../../services/WalletResetService';

export interface ModernSeedInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showValidation?: boolean;
}

export const ModernSeedInput: React.FC<ModernSeedInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = 'Enter your 12 or 24 word recovery phrase...',
  autoFocus = false,
  showValidation = true
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const count = WalletResetService.countWords(value);
    setWordCount(count);

    // Valider seulement si on a au moins 12 mots
    if (count >= 12) {
      const result = WalletResetService.validateSeedPhrase(value);
      setValidation(result);
      onValidationChange?.(result.isValid, result.error);
    } else {
      setValidation({ isValid: false });
      onValidationChange?.(false, undefined);
    }
  }, [value, onValidationChange]);

  const expectedWordCounts = [12, 15, 18, 21, 24];
  const isExpectedCount = expectedWordCounts.includes(wordCount);

  return (
    <div style={{ width: '100%' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px',
          letterSpacing: '-0.022em'
        }}>
        Recovery Phrase
      </label>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={4}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: '400',
          color: '#ffffff',
          backgroundColor: 'var(--modern-bg-secondary)',
          border: `var(--modern-border-width) solid ${
            validation.error && wordCount >= 12
              ? 'rgba(255, 59, 48, 0.5)'
              : isFocused
                ? 'var(--modern-border-focus)'
                : 'var(--modern-border-color)'
          }`,
          borderRadius: '12px',
          outline: 'none',
          transition: 'all 0.2s ease',
          resize: 'vertical',
          minHeight: '100px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          lineHeight: '1.5',
          boxSizing: 'border-box'
        }}
      />

      {/* Validation Info */}
      {showValidation && (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Word Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                color: isExpectedCount ? '#34C759' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500'
              }}>
              {wordCount} words
            </span>
            {isExpectedCount && (
              <span style={{ fontSize: '12px', color: '#34C759' }}>
                ✓ Expected: {expectedWordCounts.join(', ')}
              </span>
            )}
          </div>

          {/* Validation Status */}
          {wordCount >= 12 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {validation.isValid ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#34C759" opacity="0.2" />
                    <path
                      d="M7 12l3 3 7-7"
                      stroke="#34C759"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#34C759', fontWeight: '500' }}>Valid</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FF3B30" opacity="0.2" />
                    <path d="M15 9l-6 6M9 9l6 6" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#FF3B30', fontWeight: '500' }}>Invalid</span>
                </>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Error Message */}
      {validation.error && wordCount >= 12 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#FF3B30',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2" />
            <path d="M12 8v4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="#FF3B30" />
          </svg>
          {validation.error}
        </motion.div>
      )}

      {/* Helper Text */}
      {!value && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.022em'
          }}>
          💡 Paste your recovery phrase here. Words should be separated by spaces.
        </div>
      )}
    </div>
  );
};

