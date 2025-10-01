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
  'MainScreen' // ModernWalletTabScreen
  // Ajoutez d'autres routes ici au fur et à mesure
];

export const shouldUseModernUI = (routeKey: string): boolean => {
  return modernRoutes.includes(routeKey);
};
