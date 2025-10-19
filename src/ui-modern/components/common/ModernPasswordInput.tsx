import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { EyeIcon } from './Icons';

export interface ModernPasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  helperText?: string;
  autoFocus?: boolean;
  showStrengthIndicator?: boolean;
  className?: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password || password.length === 0) return null;
  if (password.length < 8) return 'weak';

  let strength = 0;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return '#ff3b30'; // Apple red
    case 'medium':
      return '#ff9500'; // Apple orange
    case 'strong':
      return '#34c759'; // Apple green
    default:
      return 'rgba(255, 255, 255, 0.2)';
  }
};

const getStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
};

export const ModernPasswordInput: React.FC<ModernPasswordInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  helperText,
  autoFocus,
  showStrengthIndicator = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const strength = showStrengthIndicator ? getPasswordStrength(value) : null;
  const hasError = Boolean(error);

  const getBorderColor = () => {
    if (hasError) return 'rgba(255, 59, 48, 0.5)';
    if (isFocused) return 'var(--modern-border-focus)';
    return 'var(--modern-border-color)';
  };

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );

  return (
    <div className={`modern-password-input-container ${className}`} style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '6px',
            letterSpacing: '-0.08px'
          }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <motion.input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            setIsFocused(false);
            e.target.style.backgroundColor = 'var(--modern-bg-secondary)';
            onBlur?.();
          }}
          onFocus={(e) => {
            setIsFocused(true);
            e.target.style.backgroundColor = 'var(--modern-bg-tertiary)';
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            fontSize: '15px',
            fontWeight: '400',
            color: '#ffffff',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: `var(--modern-border-width) solid ${getBorderColor()}`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'border-color 0.2s, background-color 0.2s',
            letterSpacing: '-0.022em',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
          }}
        />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'rgba(255, 255, 255, 0.5)',
            transition: 'color 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
          }}>
          {isVisible ? <EyeOffIcon /> : <EyeIcon style={{ width: '20px', height: '20px' }} />}
        </button>
      </div>

      {showStrengthIndicator && strength && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            {[1, 2, 3].map((level) => {
              const isActive =
                (strength === 'weak' && level === 1) ||
                (strength === 'medium' && level <= 2) ||
                (strength === 'strong' && level <= 3);

              return (
                <div
                  key={level}
                  style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: isActive ? getStrengthColor(strength) : 'rgba(255, 255, 255, 0.1)',
                    transition: 'background-color 0.3s'
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '500',
              color: getStrengthColor(strength),
              letterSpacing: '-0.08px'
            }}>
            {getStrengthLabel(strength)} password
          </div>
        </motion.div>
      )}

      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: '6px',
            fontSize: '12px',
            fontWeight: '400',
            color: hasError ? '#ff3b30' : 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.08px'
          }}>
          {error || helperText}
        </motion.div>
      )}
    </div>
  );
};
