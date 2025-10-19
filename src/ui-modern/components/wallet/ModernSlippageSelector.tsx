import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface ModernSlippageSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
}

export const ModernSlippageSelector: React.FC<ModernSlippageSelectorProps> = ({ value = 1, onChange }) => {
  const [selectedSlippage, setSelectedSlippage] = useState(value);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const presetValues = [1, 10];

  const handlePresetClick = (val: number) => {
    setSelectedSlippage(val);
    setIsCustom(false);
    onChange?.(val);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    if (val && !isNaN(parseFloat(val))) {
      const numVal = parseFloat(val);
      setSelectedSlippage(numVal);
      setIsCustom(true);
      onChange?.(numVal);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
      {/* Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '-0.2px'
          }}>
          Slippage Tolerance
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.2px'
          }}>
          {selectedSlippage}%
        </span>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center'
        }}>
        {presetValues.map((val) => (
          <motion.button
            key={val}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePresetClick(val)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background:
                selectedSlippage === val && !isCustom ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedSlippage === val && !isCustom ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: selectedSlippage === val && !isCustom ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.2px'
            }}>
            {val}%
          </motion.button>
        ))}

        {/* Custom Input */}
        <div
          style={{
            flex: 1.5,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
          <input
            type="number"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="Custom"
            style={{
              width: '100%',
              padding: '8px 24px 8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: isCustom ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: isCustom ? '600' : '500',
              outline: 'none',
              letterSpacing: '-0.2px'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none'
            }}>
            %
          </span>
        </div>
      </div>
    </motion.div>
  );
};
