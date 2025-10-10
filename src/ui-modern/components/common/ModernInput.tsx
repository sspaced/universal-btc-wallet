import { motion } from 'framer-motion';
import React from 'react';

export interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'number';
  error?: string;
  success?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  autoFocus?: boolean;
  maxLength?: number;
  className?: string;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  error,
  success,
  disabled = false,
  leftIcon,
  rightIcon,
  helperText,
  autoFocus,
  maxLength,
  className = ''
}) => {
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError;

  const handleIncrement = () => {
    if (type === 'number' && !disabled) {
      const currentValue = parseFloat(value) || 0;
      onChange((currentValue + 1).toString());
    }
  };

  const handleDecrement = () => {
    if (type === 'number' && !disabled) {
      const currentValue = parseFloat(value) || 0;
      onChange((currentValue - 1).toString());
    }
  };

  const getBorderColor = () => {
    if (hasError) return 'rgba(255, 59, 48, 0.5)'; // Apple red
    if (hasSuccess) return 'rgba(52, 199, 89, 0.5)'; // Apple green
    return 'rgba(255, 255, 255, 0.2)';
  };

  const getFocusBorderColor = () => {
    if (hasError) return 'rgba(255, 59, 48, 0.8)';
    if (hasSuccess) return 'rgba(52, 199, 89, 0.8)';
    return 'rgba(114, 227, 173, 0.6)'; // Green theme
  };

  return (
    <div className={`modern-input-container ${className}`} style={{ width: '100%' }}>
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
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
            {leftIcon}
          </div>
        )}

        <motion.input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          style={{
            width: '100%',
            padding: leftIcon ? '10px 12px 10px 40px' : rightIcon ? '10px 40px 10px 12px' : '10px 12px',
            fontSize: '15px',
            fontWeight: '400',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: `1.5px solid ${getBorderColor()}`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'border-color 0.2s, background-color 0.2s',
            letterSpacing: '-0.022em',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = getFocusBorderColor();
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = getBorderColor();
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
        />

        {type === 'number' && !disabled ? (
          <div
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
            <button
              type="button"
              onClick={handleIncrement}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : rightIcon ? (
          <div
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
            {rightIcon}
          </div>
        ) : null}
      </div>

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
