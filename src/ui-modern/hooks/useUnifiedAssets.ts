import { useEffect, useState } from 'react';

import { CAT_VERSION } from '@/shared/types';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';
import { useSupportedAssets } from '@/ui/state/ui/hooks';
import { useWallet } from '@/ui/utils';

import { Asset } from '../components/wallet/ModernAssetsList';

export const useUnifiedAssets = () => {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const accountBalance = useAccountBalance();
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const supportedAssets = useSupportedAssets();
  const { coinPrice } = usePrice();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  // Function to examine UTXOs for inscriptions and JSON data
  const examineUTXOs = async () => {
    try {
      console.log('=== EXAMINING UTXOs FOR INSCRIPTIONS ===');

      // Get all UTXOs
      const utxos = await wallet.getBTCUtxos();
      console.log(`Found ${utxos.length} UTXOs`);

      // Log raw UTXO data first
      console.log('\n🔍 RAW UTXO DATA:');
      console.log('Raw UTXOs array:', utxos);
      console.log('Raw UTXOs JSON:', JSON.stringify(utxos, null, 2));

      for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i];
        console.log(`\n--- UTXO ${i + 1}/${utxos.length} ---`);
        console.log('Raw UTXO object:', utxo);
        console.log('Raw UTXO JSON:', JSON.stringify(utxo, null, 2));

        console.log(`TXID: ${utxo.txid}`);
        console.log(`VOUT: ${utxo.vout}`);
        console.log(`Satoshis: ${utxo.satoshis}`);
        console.log(`ScriptPk: ${utxo.scriptPk}`);
        console.log(`AddressType: ${utxo.addressType}`);
        console.log(`Pubkey: ${utxo.pubkey}`);
        console.log(`Inscriptions count: ${utxo.inscriptions.length}`);
        console.log(`Atomicals count: ${utxo.atomicals.length}`);
        console.log(`Runes count: ${utxo.runes.length}`);

        // Log raw inscriptions data
        if (utxo.inscriptions.length > 0) {
          console.log('\n📝 RAW INSCRIPTIONS DATA:');
          console.log('Raw inscriptions array:', utxo.inscriptions);
          console.log('Raw inscriptions JSON:', JSON.stringify(utxo.inscriptions, null, 2));
        }

        // Log raw atomicals data
        if (utxo.atomicals.length > 0) {
          console.log('\n⚛️ RAW ATOMICALS DATA:');
          console.log('Raw atomicals array:', utxo.atomicals);
          console.log('Raw atomicals JSON:', JSON.stringify(utxo.atomicals, null, 2));
        }

        // Log raw runes data
        if (utxo.runes.length > 0) {
          console.log('\n🏷️ RAW RUNES DATA:');
          console.log('Raw runes array:', utxo.runes);
          console.log('Raw runes JSON:', JSON.stringify(utxo.runes, null, 2));
        }

        // Check inscriptions
        if (utxo.inscriptions.length > 0) {
          console.log('\n📝 INSCRIPTIONS FOUND:');
          for (let j = 0; j < utxo.inscriptions.length; j++) {
            const inscription = utxo.inscriptions[j];
            console.log(`  Inscription ${j + 1}:`);
            console.log(`    ID: ${inscription.inscriptionId}`);
            console.log(`    Number: ${inscription.inscriptionNumber || 'N/A'}`);
            console.log(`    Offset: ${inscription.offset}`);

            try {
              // Get detailed inscription info
              const inscriptionDetails = await wallet.getInscriptionInfo(inscription.inscriptionId);
              console.log(`    Content Type: ${inscriptionDetails.contentType}`);
              console.log(`    Content Length: ${inscriptionDetails.contentLength}`);
              console.log(`    Preview URL: ${inscriptionDetails.preview}`);
              console.log(`    Content URL: ${inscriptionDetails.content}`);

              // Log raw inscription details
              console.log('    Raw inscription details:', inscriptionDetails);
              console.log('    Raw inscription details JSON:', JSON.stringify(inscriptionDetails, null, 2));

              // Check if it's JSON
              if (inscriptionDetails.contentType === 'application/json') {
                console.log('    🎯 JSON INSCRIPTION DETECTED!');
                if (inscriptionDetails.contentBody) {
                  try {
                    const jsonData = JSON.parse(inscriptionDetails.contentBody);
                    console.log('    JSON Data:', jsonData);
                    console.log('    JSON Data (formatted):', JSON.stringify(jsonData, null, 2));
                  } catch (e) {
                    console.log('    JSON parsing failed:', e);
                    console.log('    Raw content body:', inscriptionDetails.contentBody);
                  }
                } else {
                  console.log('    No content body available');
                }
              }

              // Check for BRC20 data
              if (inscriptionDetails.brc20) {
                console.log('    🪙 BRC20 Data:', inscriptionDetails.brc20);
                console.log('    🪙 BRC20 Data (formatted):', JSON.stringify(inscriptionDetails.brc20, null, 2));
              }
            } catch (error) {
              console.log(`    Error fetching inscription details: ${error}`);
            }
          }
        }

        // Check atomicals
        if (utxo.atomicals.length > 0) {
          console.log('\n⚛️ ATOMICALS FOUND:');
          utxo.atomicals.forEach((atom, index) => {
            console.log(`  Atom ${index + 1}:`);
            console.log(`    ID: ${atom.atomicalId}`);
            console.log(`    Type: ${atom.type}`);
            console.log(`    Ticker: ${atom.ticker || 'N/A'}`);
            console.log(`    Value: ${atom.atomicalValue || 'N/A'}`);
          });
        }

        // Check runes
        if (utxo.runes.length > 0) {
          console.log('\n🏷️ RUNES FOUND:');
          utxo.runes.forEach((rune, index) => {
            console.log(`  Rune ${index + 1}:`);
            console.log(`    ID: ${rune.runeid}`);
            console.log(`    Name: ${rune.rune}`);
            console.log(`    Amount: ${rune.amount}`);
          });
        }
      }

      console.log('\n=== UTXO EXAMINATION COMPLETE ===');
    } catch (error) {
      console.error('Error examining UTXOs:', error);
    }
  };

  useEffect(() => {
    const fetchAllAssets = async () => {
      console.log('=== ASSETS FETCH DEBUG START ===');
      console.log('Current account:', currentAccount);
      console.log('Account balance:', accountBalance);
      console.log('BTC unit:', btcUnit);
      console.log('Coin price:', coinPrice);
      console.log('Supported assets:', supportedAssets);

      setLoading(true);
      const allAssets: Asset[] = [];

      try {
        // Examine UTXOs first
        await examineUTXOs();

        // Add BTC as the first asset
        if (accountBalance.totalBalance > 0) {
          const btcAmount = satoshisToAmount(accountBalance.totalBalance);
          const btcValue = coinPrice ? coinPrice.btc * parseFloat(btcAmount) : 0;

          console.log('=== BTC ASSET DEBUG ===');
          console.log('BTC amount (satoshis):', accountBalance.totalBalance);
          console.log('BTC amount (BTC):', btcAmount);
          console.log('BTC value (USD):', btcValue);
          console.log('Coin price:', coinPrice);

          const btcAsset = {
            id: 'btc',
            type: 'btc' as const,
            name: 'Bitcoin',
            symbol: btcUnit,
            amount: btcAmount,
            value: btcValue,
            usdValue: btcValue > 0 ? `$${btcValue.toFixed(2)}` : '-',
            onClick: () => {
              // BTC doesn't need navigation, it's the main balance
            }
          };

          console.log('BTC asset created:', btcAsset);
          allAssets.push(btcAsset);
        } else {
          console.log('No BTC balance found');
        }

        // Fetch Runes
        if (supportedAssets.assets.runes) {
          console.log('=== FETCHING RUNES ===');
          try {
            const { list: runesList } = await wallet.getRunesList(currentAccount.address, 1, 100);
            console.log('Runes list:', runesList);

            const runesPriceMap =
              runesList.length > 0 ? await wallet.getRunesPrice(runesList.map((item) => item.spacedRune)) : {};
            console.log('Runes price map:', runesPriceMap);

            runesList.forEach((rune) => {
              const price = runesPriceMap[rune.spacedRune];
              const value = price ? price.curPrice * parseFloat(rune.amount) : 0;
              const runeAsset = {
                id: rune.runeid,
                type: 'rune' as const,
                name: rune.spacedRune,
                symbol: rune.symbol || rune.spacedRune,
                amount: rune.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-',
                onClick: () => {
                  // Will be handled in ModernWalletTabScreen
                }
              };
              console.log('Rune asset created:', runeAsset);
              allAssets.push(runeAsset);
            });
          } catch (e) {
            console.error('Failed to fetch runes:', e);
          }
        } else {
          console.log('Runes not supported');
        }

        // Fetch Alkanes
        if (supportedAssets.assets.alkanes) {
          console.log('=== FETCHING ALKANES ===');
          try {
            const { list: alkanesList } = await wallet.getAlkanesList(currentAccount.address, 1, 100);
            console.log('Alkanes list:', alkanesList);

            const alkanesPriceMap =
              alkanesList.length > 0 ? await wallet.getAlkanesPrice(alkanesList.map((item) => item.alkaneid)) : {};
            console.log('Alkanes price map:', alkanesPriceMap);

            alkanesList.forEach((alkane) => {
              const price = alkanesPriceMap[alkane.alkaneid];
              const value = price ? price.curPrice * parseFloat(alkane.amount) : 0;
              const alkaneAsset = {
                id: alkane.alkaneid,
                type: 'alkane' as const,
                name: alkane.name,
                symbol: alkane.symbol,
                amount: alkane.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
              };
              console.log('Alkane asset created:', alkaneAsset);
              allAssets.push(alkaneAsset);
            });
          } catch (e) {
            console.error('Failed to fetch alkanes:', e);
          }
        } else {
          console.log('Alkanes not supported');
        }

        // Fetch CAT20
        if (supportedAssets.assets.CAT20) {
          console.log('=== FETCHING CAT20 ===');
          try {
            const { list: cat20List } = await wallet.getCAT20List(CAT_VERSION.V1, currentAccount.address, 1, 100);
            console.log('CAT20 list:', cat20List);

            const cat20PriceMap =
              cat20List.length > 0 ? await wallet.getCAT20sPrice(cat20List.map((item) => item.tokenId)) : {};
            console.log('CAT20 price map:', cat20PriceMap);

            cat20List.forEach((cat20) => {
              const price = cat20PriceMap[cat20.tokenId];
              const value = price ? price.curPrice * parseFloat(cat20.amount) : 0;
              const cat20Asset = {
                id: cat20.tokenId,
                type: 'cat20' as const,
                name: cat20.symbol,
                symbol: cat20.symbol,
                amount: cat20.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
              };
              console.log('CAT20 asset created:', cat20Asset);
              allAssets.push(cat20Asset);
            });
          } catch (e) {
            console.error('Failed to fetch CAT20:', e);
          }
        } else {
          console.log('CAT20 not supported');
        }

        // Fetch Simplicity tokens
        if (supportedAssets.assets.simplicity) {
          console.log('=== FETCHING SIMPLICITY TOKENS ===');
          try {
            const { list: simplicityList } = await wallet.getSimplicityTokensList(currentAccount.address, 1, 100);
            console.log('Simplicity list:', simplicityList);

            if (simplicityList.length > 0) {
              // Get prices for all Simplicity tokens
              const tickers = simplicityList.map((token) => token.ticker);
              const priceMap = await wallet.getSimplicitysPrice(tickers);
              console.log('Simplicity price map:', priceMap);

              simplicityList.forEach((token) => {
                const price = priceMap[token.ticker];
                const tokenPrice = price ? price.curPrice : 0;
                const balance = parseFloat(token.balance);
                const valueInSats = balance * tokenPrice;

                const simplicityAsset = {
                  id: token.ticker,
                  type: 'simplicity' as const,
                  name: token.ticker,
                  symbol: token.ticker,
                  amount: token.balance,
                  value: valueInSats, // Value in satoshis
                  usdValue: valueInSats > 0 ? `$${((valueInSats / 100000000) * coinPrice.btc).toFixed(2)}` : '-'
                };
                console.log('Simplicity asset created:', simplicityAsset);
                allAssets.push(simplicityAsset);
              });
            }
          } catch (e) {
            console.error('Failed to fetch Simplicity tokens:', e);
          }
        } else {
          console.log('Simplicity not supported');
        }

        console.log('=== ALL ASSETS BEFORE SORTING ===');
        console.log('Total assets found:', allAssets.length);
        allAssets.forEach((asset, index) => {
          console.log(`Asset ${index + 1}:`, {
            id: asset.id,
            type: asset.type,
            name: asset.name,
            symbol: asset.symbol,
            amount: asset.amount,
            value: asset.value,
            usdValue: asset.usdValue
          });
        });

        // Sort by value (ascending) - assets with lowest value first
        allAssets.sort((a, b) => a.value - b.value);

        console.log('=== ALL ASSETS AFTER SORTING ===');
        allAssets.forEach((asset, index) => {
          console.log(`Asset ${index + 1}:`, {
            id: asset.id,
            type: asset.type,
            name: asset.name,
            symbol: asset.symbol,
            amount: asset.amount,
            value: asset.value,
            usdValue: asset.usdValue
          });
        });

        setAssets(allAssets);
        console.log('=== ASSETS SET IN STATE ===');
        console.log('Final assets array:', allAssets);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
        console.log('=== ASSETS FETCH DEBUG END ===');
      }
    };

    if (currentAccount.address) {
      fetchAllAssets();
    } else {
      console.log('No current account address, skipping assets fetch');
    }
  }, [currentAccount.address, chainType, supportedAssets.key, accountBalance.totalBalance, coinPrice, btcUnit]);

  return { assets, loading };
};
