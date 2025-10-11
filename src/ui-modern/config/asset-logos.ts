// Imports des logos d'assets
import logo2009Jan03 from '../simplicity-assets-logo/2009-jan-03_logo.png';
import logoBtcLife from '../simplicity-assets-logo/btc人生_logo.png';
import logoGamestop from '../simplicity-assets-logo/gamestop_logo.png';
import logoKek from '../simplicity-assets-logo/kek_logo.png';
import logoLol from '../simplicity-assets-logo/lol_logo.png';
import logoOpmoon from '../simplicity-assets-logo/opmoon_logo.png';
import logoOpqt from '../simplicity-assets-logo/opqt_logo.png';
import logoPrompt from '../simplicity-assets-logo/prompt_logo.png';
import logoWtf from '../simplicity-assets-logo/wtf_logo.png';

// Configuration des logos d'assets disponibles
export interface AssetLogoConfig {
  symbol: string;
  name: string;
  logoPath: string;
  type: 'simplicity' | 'btc' | 'rune' | 'brc20' | 'cat20' | 'cat721' | 'ordinal' | 'alkane';
}

// Liste des logos disponibles dans simplicity-assets-logo/
export const availableLogos: AssetLogoConfig[] = [
  {
    symbol: '2009-jan-03',
    name: '2009-jan-03',
    logoPath: logo2009Jan03,
    type: 'simplicity'
  },
  {
    symbol: 'btc人生',
    name: 'btc人生',
    logoPath: logoBtcLife,
    type: 'simplicity'
  },
  {
    symbol: 'gamestop',
    name: 'gamestop',
    logoPath: logoGamestop,
    type: 'simplicity'
  },
  {
    symbol: 'kek',
    name: 'kek',
    logoPath: logoKek,
    type: 'simplicity'
  },
  {
    symbol: 'lol',
    name: 'lol',
    logoPath: logoLol,
    type: 'simplicity'
  },
  {
    symbol: 'opmoon',
    name: 'opmoon',
    logoPath: logoOpmoon,
    type: 'simplicity'
  },
  {
    symbol: 'opqt',
    name: 'opqt',
    logoPath: logoOpqt,
    type: 'simplicity'
  },
  // Alias pour OPQT en majuscules
  {
    symbol: 'OPQT',
    name: 'OPQT',
    logoPath: logoOpqt,
    type: 'simplicity'
  },
  {
    symbol: 'prompt',
    name: 'prompt',
    logoPath: logoPrompt,
    type: 'simplicity'
  },
  {
    symbol: 'wtf',
    name: 'wtf',
    logoPath: logoWtf,
    type: 'simplicity'
  }
];

// Fonction pour trouver le logo d'un asset
export const getAssetLogo = (assetSymbol?: string, assetName?: string, assetType?: string): string | null => {
  console.log('🔍 getAssetLogo called with:', { assetSymbol, assetName, assetType });

  if (!assetSymbol && !assetName) {
    console.log('❌ No symbol or name provided');
    return null;
  }

  // Chercher par symbole d'abord
  if (assetSymbol) {
    console.log('🔍 Searching by symbol:', assetSymbol);
    const logoBySymbol = availableLogos.find((logo) => logo.symbol.toLowerCase() === assetSymbol.toLowerCase());
    if (logoBySymbol) {
      console.log('✅ Found logo by symbol:', logoBySymbol.logoPath);
      return logoBySymbol.logoPath;
    }
    console.log('❌ No logo found by symbol');
  }

  // Chercher par nom si pas trouvé par symbole
  if (assetName) {
    console.log('🔍 Searching by name:', assetName);
    const logoByName = availableLogos.find((logo) => logo.name.toLowerCase() === assetName.toLowerCase());
    if (logoByName) {
      console.log('✅ Found logo by name:', logoByName.logoPath);
      return logoByName.logoPath;
    }
    console.log('❌ No logo found by name');
  }

  console.log('❌ No logo found for asset');
  return null;
};

// Fonction pour obtenir tous les logos disponibles
export const getAllAvailableLogos = (): AssetLogoConfig[] => {
  return availableLogos;
};

// Fonction de test pour vérifier les logos
export const testAssetLogos = () => {
  console.log('🧪 Testing asset logos...');
  console.log('Available logos:', availableLogos);

  // Test avec OPQT
  const opqtLogo = getAssetLogo('OPQT', 'OPQT', 'simplicity');
  console.log('OPQT logo result:', opqtLogo);

  // Test avec d'autres assets
  const testAssets = ['opqt', 'OPQT', 'gamestop', 'kek', 'unknown'];
  testAssets.forEach((asset) => {
    const logo = getAssetLogo(asset, asset, 'simplicity');
    console.log(`${asset} logo:`, logo);
  });
};
