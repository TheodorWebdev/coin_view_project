import { useContext } from 'react';

import type { CandlestickData, UTCTimestamp } from 'lightweight-charts'
import type { ExchangeContextType } from './interfaces';
import { ExchangeContext } from './interfaces';

export function updateLevels(
  bids: Map<string, string>,
  asks: Map<string, string>,
  delta: { b: Array<[string, string]>, a: Array<[string, string]> },): { newB: Map<string, string>; newA: Map<string, string> } {
  const newB = new Map(bids);
  const newA = new Map(asks);

  for (const [price, amount] of delta.b) {
    if (amount === "0") {
      newB.delete(price);
    } else {
      newB.set(price, amount);
    }
  }

  for (const [price, amount] of delta.a) {
    if (amount === "0") {
      newA.delete(price);
    } else {
      newA.set(price, amount);
    }
  }

  return { newB, newA };
}

export function sortOrderbook(bids: Map<string, string>, asks: Map<string, string>): {
  bids: Map<string, string>,
  asks: Map<string, string>,
} {
  const sortedBids = new Map(Array.from(bids.entries()).sort(
    ([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB)
  ));
  const sortedAsks = new Map(Array.from(asks.entries()).sort(
    ([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB)
  ));
  return { bids: sortedBids, asks: sortedAsks };
}

export async function fetchHistoricalCandles(
  symbol: string,
  interval: string,
): Promise<CandlestickData[]> {
  const url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}`

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.retCode === 0 && data.result.list) {
      return data.result.list.map((item: string[]) => ({
        time: parseFloat(item[0]) / 1000 as UTCTimestamp,
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
      })).reverse();
    }
    throw new Error('Bad response');
  } catch (err) {
    console.error(err);
    return [];
  }
};

export function useExchange(): ExchangeContextType {
  const context = useContext(ExchangeContext);

  if (!context) {
    throw new Error('useExchange must be used with ExchangeProvider');
  }

  return context;
}