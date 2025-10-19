export interface BTCBalance {
  availableBalance: number;
  unavailableBalance: number;
  totalBalance: number;
}

export interface BTCPrice {
  btc: number;
  lastUpdated: number;
}

export class BTCService {
  /**
   * Récupère le balance BTC pour une adresse donnée
   * Utilise la même approche que les autres tokens (appel API direct)
   */
  static async getBTCBalance(address: string, wallet: any): Promise<BTCBalance> {
    try {
      const balanceV2 = await wallet.getAddressBalanceV2(address);
      return {
        availableBalance: balanceV2.availableBalance,
        unavailableBalance: balanceV2.unavailableBalance,
        totalBalance: balanceV2.totalBalance
      };
    } catch (error) {
      console.error('Failed to fetch BTC balance:', error);
      return {
        availableBalance: 0,
        unavailableBalance: 0,
        totalBalance: 0
      };
    }
  }

  /**
   * Convertit les satoshis en BTC
   */
  static satoshisToBTC(satoshis: number): string {
    return (satoshis / 100000000).toFixed(8);
  }

  /**
   * Convertit les BTC en satoshis
   */
  static btcToSatoshis(btc: number): number {
    return Math.round(btc * 100000000);
  }

  /**
   * Calcule la valeur USD du BTC
   */
  static calculateUSDValue(btcAmount: number, btcPrice: number): number {
    return btcAmount * btcPrice;
  }

  /**
   * Formate la valeur USD pour l'affichage
   */
  static formatUSDValue(usdValue: number): string {
    return usdValue > 0 ? `$${usdValue.toFixed(2)}` : '-';
  }

  /**
   * Crée un asset BTC unifié
   */
  static createBTCAsset(
    balance: BTCBalance,
    btcPrice: number,
    btcUnit: string
  ): {
    id: string;
    type: 'btc';
    name: string;
    symbol: string;
    amount: string;
    value: number;
    usdValue: string;
  } | null {
    if (balance.totalBalance <= 0) {
      return null;
    }

    const btcAmount = parseFloat(this.satoshisToBTC(balance.totalBalance));
    const usdValue = this.calculateUSDValue(btcAmount, btcPrice);

    return {
      id: 'btc',
      type: 'btc' as const,
      name: 'Bitcoin',
      symbol: btcUnit,
      amount: btcAmount.toString(),
      value: usdValue,
      usdValue: this.formatUSDValue(usdValue)
    };
  }

  /**
   * Vérifie si le balance BTC a changé
   */
  static hasBalanceChanged(oldBalance: BTCBalance, newBalance: BTCBalance): boolean {
    return (
      oldBalance.availableBalance !== newBalance.availableBalance ||
      oldBalance.unavailableBalance !== newBalance.unavailableBalance ||
      oldBalance.totalBalance !== newBalance.totalBalance
    );
  }

  /**
   * Obtient les statistiques du balance BTC
   */
  static getBalanceStats(balance: BTCBalance) {
    return {
      totalBTC: this.satoshisToBTC(balance.totalBalance),
      availableBTC: this.satoshisToBTC(balance.availableBalance),
      unavailableBTC: this.satoshisToBTC(balance.unavailableBalance),
      hasUnavailable: balance.unavailableBalance > 0
    };
  }
}

