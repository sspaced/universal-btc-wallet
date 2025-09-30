import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`w-12 h-7 rounded-full peer transition-colors duration-200 ease-in-out ${
          checked
            ? 'bg-green-500'
            : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          backgroundColor: checked ? 'var(--apple-green)' : 'var(--apple-gray-4)'
        }}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
};