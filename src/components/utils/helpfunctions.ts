import type { CandlestickData, UTCTimestamp } from 'lightweight-charts'

export function updateLevels(
  levels: Array<[string, string]>,
  price: string,
  size: string,
): Array<[string, string]> {
  const index = levels.findIndex(([p]) => p === price);

  if (size === '0')
    return levels.filter((_, i) => i !== index);

  if (index !== -1) {
    return levels.map(([p, s], i) => (i === index ? [price, size] : [p, s]));
  } else {
    return [...levels, [price, size]];
  }
}

export function sortOrderbook(bids: Array<[string, string]>, asks: Array<[string, string]>) {
  const sortedBids = [...bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).reverse();
  const sortedAsks = [...asks].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
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