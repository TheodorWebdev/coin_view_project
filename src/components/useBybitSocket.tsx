import { useEffect, useState } from 'react';

// export interface Candle {
//   time: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

export interface OrderBook {
  s: string;
  b: Array<[string, string]>;
  a: Array<[string, string]>;
  u: number;
  seq: number;
}

function updateLevels(
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

function sortOrderbook(bids: Array<[string, string]>, asks: Array<[string, string]>) {
  const sortedBids = [...bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).reverse();
  const sortedAsks = [...asks].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  return { bids: sortedBids, asks: sortedAsks };
}


export function useBybitSocket(symbol: string = 'BTCUSDT', depth: string = '50') {
  // const [ candle, setCandle ] = useState<Candle | null>(null);
  const [ orderbook, setOrderbook ] = useState<OrderBook | null>(null);
  useEffect(() => {
    const wss = new WebSocket('wss://stream.bybit.com/v5/public/spot');

    wss.onopen = () => {
      console.log('Соединение с Bybit WebSocket открыто');
      wss.send(
        JSON.stringify({
          op: 'subscribe',
          args: [
            // `kline.${interval}.${symbol}`,
            `orderbook.${depth}.${symbol}`,
          ],
        })
      );
    };

    wss.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.topic?.startsWith('orderbook')) {
          const data = message.data;
          
          if (message.type === 'snapshot') {
            const orderBook = {
              s: data.s,
              b: data.b,
              a: data.a,
              u: data.u,
              seq: data.seq,
            };
            setOrderbook(orderBook);
          } else if (message.type === 'delta') {
            setOrderbook((prev) => {
              if (!prev) return null;

              let newB = [...prev.b];
              for (const [price, size] of data.b)
                newB = updateLevels(newB, price, size);

              let newA = [...prev.a];
              for (const [price, size] of data.a)
                newA = updateLevels(newA, price, size);

              const { bids, asks } = sortOrderbook(newB, newA);

              return {
                s: data.s,
                b: bids,
                a: asks,
                u: data.u,
                seq: data.seq,
              };
            })
          }
        }

      } catch (error) {
        console.error('Ошибка при обработке WebSocket-сообщения:', error);
      }
    };

    wss.onerror = (err) => {
      console.error('Ошибка WebSocket:', err);
    };

    wss.onclose = () => {
      console.log('Соединение с Bybit WebSocket закрыто');
    };

    return () => {
      wss.close();
    };
  }, []);

  return { orderbook };
}