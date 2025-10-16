export interface UIConfig {
  useModernUI: boolean;
  enableAnimations: boolean;
  enableGlassmorphism: boolean;
  theme: 'apple-light' | 'apple-dark';
  animationDuration: number;
}

export const defaultUIConfig: UIConfig = {
  useModernUI: true,
  enableAnimations: true,
  enableGlassmorphism: false,
  theme: 'apple-light',
  animationDuration: 0.3
};

// Configuration pour les routes qui utilisent l'UI moderne
export const modernRoutes = [
  'WelcomeScreen',
  'CreateHDWalletScreen',
  'CreatePasswordScreen',
  'CreateAccountScreen', // ModernCreateAccountScreen
  'CreateSimpleWalletScreen', // ModernCreateSimpleWalletScreen
  'MainScreen', // ModernWalletTabScreen
  'ReceiveScreen', // ModernReceiveScreen
  'TxCreateScreen', // ModernSendScreen
  'TxConfirmScreen', // ModernTxConfirmScreen
  'TxSuccessScreen', // ModernTxSuccessScreen
  'TxFailScreen', // ModernTxFailScreen
  'ExportMnemonicsScreen', // ModernExportMnemonicsScreen
  'ExportPrivateKeyScreen', // ModernExportPrivateKeyScreen
  'AddressTypeScreen', // ModernAddressTypeScreen
  'LanguageScreen', // ModernLanguageScreen
  'ChangePasswordScreen', // ModernChangePasswordScreen
  'LockTimePage', // ModernLockTimeScreen
  'NetworkTypeScreen', // ModernNetworkTypeScreen
  'ContactsScreen', // ModernContactsScreen
  'AddAddressScreen', // ModernAddAddressScreen
  'AboutUsScreen', // ModernAboutUsScreen
  'ModernTokenDetail' // ModernTokenDetail
  // Ajoutez d'autres routes ici au fur et à mesure
];

export const shouldUseModernUI = (routeKey: string): boolean => {
  return modernRoutes.includes(routeKey);
};
