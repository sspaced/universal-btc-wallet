import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import toast from 'react-hot-toast';

interface SecurityPreferences {
  autoLockEnabled: boolean;
  autoLockTimer: number; // minutes
  biometricEnabled: boolean;
  copyProtectionEnabled: boolean;
  requirePasswordForSend: boolean;
}

export const SecuritySettings: React.FC = () => {
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    autoLockEnabled: true,
    autoLockTimer: 5,
    biometricEnabled: false,
    copyProtectionEnabled: true,
    requirePasswordForSend: true,
  });

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('wallet-security-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse security preferences:', error);
      }
    }

    // Check if biometric authentication is available
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // Check if Web Authentication API is available
      const available = 'credentials' in navigator && 'create' in navigator.credentials;
      setIsBiometricAvailable(available);
    } catch (error) {
      console.error('Biometric check failed:', error);
      setIsBiometricAvailable(false);
    }
  };

  const updatePreference = <K extends keyof SecurityPreferences>(
    key: K,
    value: SecurityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('wallet-security-preferences', JSON.stringify(newPreferences));

    toast.success('Security settings updated');
  };

  const autoLockOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
        Security Settings
      </h3>

      <div className="space-y-4">
        {/* Auto Lock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
              Auto Lock
            </p>
            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
              Automatically lock wallet after inactivity
            </p>
          </div>
          <Toggle
            checked={preferences.autoLockEnabled}
            onChange={(checked) => updatePreference('autoLockEnabled', checked)}
          />
        </div>

        {/* Auto Lock Timer */}
        {preferences.autoLockEnabled && (
          <div>
            <p className="font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Auto Lock Timer
            </p>
            <div className="grid grid-cols-3 gap-2">
              {autoLockOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference('autoLockTimer', option.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    preferences.autoLockTimer === option.value
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    backgroundColor: preferences.autoLockTimer === option.value
                      ? 'var(--apple-blue)'
                      : 'var(--apple-gray-6)',
                    color: preferences.autoLockTimer === option.value
                      ? 'white'
                      : 'var(--apple-label)'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Biometric Authentication */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
              Biometric Authentication
            </p>
            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
              {isBiometricAvailable ? 'Use Face ID or Touch ID' : 'Not available on this device'}
            </p>
          </div>
          <Toggle
            checked={preferences.biometricEnabled && isBiometricAvailable}
            onChange={(checked) => updatePreference('biometricEnabled', checked)}
            disabled={!isBiometricAvailable}
          />
        </div>

        {/* Copy Protection */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
              Copy Protection
            </p>
            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
              Prevent copying sensitive information
            </p>
          </div>
          <Toggle
            checked={preferences.copyProtectionEnabled}
            onChange={(checked) => updatePreference('copyProtectionEnabled', checked)}
          />
        </div>

        {/* Require Password for Send */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
              Password for Transactions
            </p>
            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
              Require password confirmation for sending
            </p>
          </div>
          <Toggle
            checked={preferences.requirePasswordForSend}
            onChange={(checked) => updatePreference('requirePasswordForSend', checked)}
          />
        </div>

        {/* Security Test Button */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
          <Button
            variant="tertiary"
            size="medium"
            fullWidth
            onClick={() => {
              if (isBiometricAvailable && preferences.biometricEnabled) {
                toast.success('Biometric authentication would be triggered here');
              } else {
                toast.success('Security settings are active');
              }
            }}
          >
            Test Security Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};