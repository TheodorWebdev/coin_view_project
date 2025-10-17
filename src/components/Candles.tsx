import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts'
import type { ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { VStack, Box } from '@chakra-ui/react';
import { useBybitSocket } from './utils/useBybitSocket';
import { fetchHistoricalCandles } from './utils/helpfunctions';

interface CandleProps {
  symbol: string;
  interval: string;
}

type CandlestickSeries = ISeriesApi<'Candlestick'>;

const getCandle = (message: any): CandlestickData | null => {
  const data = message.data;
  const candleArray = data[0];

  return {
    time: candleArray.start / 1000 as UTCTimestamp,
    open: parseFloat(candleArray.open),
    close: parseFloat(candleArray.close),
    high: parseFloat(candleArray.high),
    low: parseFloat(candleArray.low),
  }
}

export default function CandlesChart({ symbol, interval }: CandleProps) {
  const chartContainerRef = useRef(null);
  const candleSeriesRef = useRef<CandlestickSeries | null>(null);
  const [ candles, setCandles ] = useState<CandlestickData[]>([]);

  const { subscribe } = useBybitSocket();

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchHistoricalCandles(symbol, interval);
      setCandles(history);
    };

    loadHistory();
  }, [symbol, interval]);

  useLayoutEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = { layout: { textColor: 'black', background: { type: ColorType.Solid, color: 'white' } } };
    const chart = createChart(chartContainerRef.current, chartOptions);
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    candleSeriesRef.current = candleSeries;
    candleSeries.setData([]);

    return () => {
      chart.remove();
    };
  }, [])

  useEffect(() => {
    const topic = `kline.${interval}.${symbol}`;

    const unsubscribe = subscribe(topic, (message) => {
      const newCandle = getCandle(message);
      if (!newCandle) return;

      setCandles((prev) => {
        const updatedCandles = [...prev];
        const index = updatedCandles.findIndex(c => c.time === newCandle.time);

        if (index !== -1) {
          updatedCandles[index] = newCandle;
        }
        else {
          updatedCandles.push(newCandle);
        }

        return updatedCandles;
      });
    });

    return unsubscribe;
  }, [subscribe, symbol, interval])

  useEffect(() => {
    if (candleSeriesRef.current && candles.length > 0) {
      candleSeriesRef.current.setData(candles);
    }
  }, [candles]);

  return (
    <VStack p={5} bg="gray.700" borderRadius="lg" w="65vw">
      <Box 
        ref={chartContainerRef} 
        w="100%" 
        h="500px"
        borderRadius="md"
        overflow="hidden"
      />
    </VStack>
  )
}