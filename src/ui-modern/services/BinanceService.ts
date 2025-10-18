/**
 * Binance API Service for BTC Price Data
 * Fetches real-time and historical Bitcoin price data from Binance Futures API
 */

// ============================================================================
// Types
// ============================================================================

export type TimeRange = '1H' | '1D' | '1W' | '1M' | 'YTD' | 'ALL';

export interface ChartDataPoint {
  timestamp: number; // Timestamp in milliseconds
  price: number; // Current price (= close)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed?: boolean; // true if the candlestick is closed
}

type BinanceKlineRaw = [
  number, // [0] Open time
  string, // [1] Open
  string, // [2] High
  string, // [3] Low
  string, // [4] Close
  string, // [5] Volume
  number, // [6] Close time
  string, // [7] Quote volume
  number, // [8] Trades
  string, // [9] Taker buy base
  string, // [10] Taker buy quote
  string // [11] Ignore
];

interface BinanceWSMessage {
  e: 'continuous_kline';
  E: number;
  ps: string;
  ct: string;
  k: {
    t: number; // Start time
    T: number; // Close time
    i: string; // Interval
    o: string; // Open
    c: string; // Close
    h: string; // High
    l: string; // Low
    v: string; // Volume
    n: number; // Trades
    x: boolean; // Is closed
    q: string;
    V: string;
    Q: string;
  };
}

interface PeriodConfig {
  interval: string;
  calculateStartTime: () => number;
}

// ============================================================================
// Period Configuration
// ============================================================================

const PERIOD_CONFIGS: Record<TimeRange, PeriodConfig> = {
  '1H': {
    interval: '1m',
    calculateStartTime: () => Date.now() - 60 * 60 * 1000 // 1 hour ago
  },

  '1D': {
    interval: '5m',
    calculateStartTime: () => Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
  },

  '1W': {
    interval: '1h',
    calculateStartTime: () => Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago
  },

  '1M': {
    interval: '4h',
    calculateStartTime: () => Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
  },

  YTD: {
    interval: '1d',
    calculateStartTime: () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return startOfYear.getTime();
    }
  },

  ALL: {
    interval: '1w',
    calculateStartTime: () => {
      // Limit to 1500 weeks max (Binance limit)
      const weeksAgo = 1500;
      return Date.now() - weeksAgo * 7 * 24 * 60 * 60 * 1000;
    }
  }
};

// ============================================================================
// REST API Functions
// ============================================================================

/**
 * Fetches historical BTC price data from Binance REST API
 * @param period - Time range to fetch (1H, 1D, 1W, 1M, YTD, ALL)
 * @returns Array of chart data points
 * @throws Error if API request fails
 */
export async function fetchBTCHistoricalData(period: TimeRange): Promise<ChartDataPoint[]> {
  try {
    // 1. Get period configuration
    const config = PERIOD_CONFIGS[period];

    // 2. Calculate start time
    const startTime = config.calculateStartTime();

    // 3. Build URL
    const baseUrl = 'https://fapi.binance.com/fapi/v1/continuousKlines';
    const params = new URLSearchParams({
      pair: 'BTCUSDT',
      contractType: 'PERPETUAL',
      interval: config.interval,
      startTime: startTime.toString(),
      limit: '1500'
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log(`[BinanceService] Fetching ${period} data from:`, url);

    // 4. Fetch data
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    // 5. Parse response
    const rawData: BinanceKlineRaw[] = await response.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid or empty response from Binance API');
    }

    console.log(`[BinanceService] Received ${rawData.length} data points for ${period}`);

    // 6. Transform to usable format
    const chartData: ChartDataPoint[] = rawData.map((kline) => {
      // IMPORTANT: Binance returns prices as strings, must convert to numbers
      const open = parseFloat(kline[1]);
      const high = parseFloat(kline[2]);
      const low = parseFloat(kline[3]);
      const close = parseFloat(kline[4]);
      const volume = parseFloat(kline[5]);

      // Validate parsed numbers
      if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
        console.warn('[BinanceService] Invalid number in kline data:', kline);
      }

      return {
        timestamp: kline[0], // Open time
        open,
        high,
        low,
        close,
        price: close, // Price = close price
        volume
      };
    });

    return chartData;
  } catch (error) {
    console.error('[BinanceService] Error fetching historical data:', error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Get the Binance interval for a given period
 * @param period - Time range
 * @returns Binance interval string (e.g., '1h', '1d')
 */
export function getBinanceInterval(period: TimeRange): string {
  return PERIOD_CONFIGS[period].interval;
}

// ============================================================================
// WebSocket Class
// ============================================================================

/**
 * Manages WebSocket connection to Binance for real-time price updates
 */
export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private reconnectTimeout: number | null = null;
  private currentInterval: string | null = null;
  private onUpdateCallback: ((data: ChartDataPoint) => void) | null = null;

  /**
   * Connect to Binance WebSocket
   * @param interval - Candlestick interval (e.g., '1m', '1h', '1d')
   * @param onUpdate - Callback called on each new candlestick update
   */
  connect(interval: string, onUpdate: (data: ChartDataPoint) => void): void {
    // Disconnect existing connection if any
    if (this.ws) {
      this.disconnect();
    }

    this.currentInterval = interval;
    this.onUpdateCallback = onUpdate;

    const url = `wss://fstream.binance.com/ws/btcusdt_perpetual@continuousKline_${interval}`;
    console.log(`[BinanceWebSocket] Connecting to:`, url);

    this.ws = new WebSocket(url);

    // When a message arrives
    this.ws.onmessage = (event) => {
      try {
        const message: BinanceWSMessage = JSON.parse(event.data);
        const kline = message.k;

        // Transform to ChartDataPoint
        const open = parseFloat(kline.o);
        const high = parseFloat(kline.h);
        const low = parseFloat(kline.l);
        const close = parseFloat(kline.c);
        const volume = parseFloat(kline.v);

        // Validate parsed numbers
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
          console.warn('[BinanceWebSocket] Invalid number in WebSocket data:', kline);
          return;
        }

        const dataPoint: ChartDataPoint = {
          timestamp: kline.t,
          open,
          high,
          low,
          close,
          price: close,
          volume,
          isClosed: kline.x // Important: true if candlestick is closed
        };

        // Call the callback
        if (this.onUpdateCallback) {
          this.onUpdateCallback(dataPoint);
        }
      } catch (error) {
        console.error('[BinanceWebSocket] Error parsing message:', error);
      }
    };

    // Error handling
    this.ws.onerror = (error) => {
      console.error('[BinanceWebSocket] WebSocket error:', error);
      this.reconnect();
    };

    // Disconnection handling
    this.ws.onclose = (event) => {
      console.log(`[BinanceWebSocket] WebSocket closed (code: ${event.code})`);
      // Only reconnect if it wasn't a manual disconnect
      if (event.code !== 1000) {
        this.reconnect();
      }
    };

    // Connection established
    this.ws.onopen = () => {
      console.log('[BinanceWebSocket] WebSocket connected successfully');
      this.reconnectAttempts = 0; // Reset counter
    };
  }

  /**
   * Automatic reconnection with exponential backoff
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.error('[BinanceWebSocket] Max reconnect attempts reached');
      return;
    }

    if (!this.currentInterval || !this.onUpdateCallback) {
      console.log('[BinanceWebSocket] No interval or callback, not reconnecting');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s

    console.log(
      `[BinanceWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnects})`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      if (this.currentInterval && this.onUpdateCallback) {
        this.connect(this.currentInterval, this.onUpdateCallback);
      }
    }, delay);
  }

  /**
   * Cleanly close the connection
   */
  disconnect(): void {
    console.log('[BinanceWebSocket] Disconnecting...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect'); // Normal closure
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.currentInterval = null;
    this.onUpdateCallback = null;
  }

  /**
   * Check if WebSocket is currently connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

/**
 * Singleton WebSocket instance for global use
 */
export const binanceWebSocket = new BinanceWebSocket();

