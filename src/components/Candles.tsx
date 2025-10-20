import { CandlestickSeries, createChart, HistogramSeries } from 'lightweight-charts';
import type { ISeriesApi, CandlestickData, HistogramData, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VStack, Box, Text, HStack, Flex } from '@chakra-ui/react';
import { useBybitSocket } from './utils/useBybitSocket';
import { fetchHistoricalCandles } from './utils/helpfunctions';

interface CandleProps {
  symbol: string;
  interval: string;
}

type CandlestickSeries = ISeriesApi<'Candlestick'>;
type VolumeSeries = ISeriesApi<'Histogram'>;

const getCandle = (message: any): CandlestickData & { volume: number } | null => {
  const data = message.data;
  const candleArray = data[0];
  if (!candleArray) return null;

  return {
    time: candleArray.start / 1000 as UTCTimestamp,
    open: parseFloat(candleArray.open),
    close: parseFloat(candleArray.close),
    high: parseFloat(candleArray.high),
    low: parseFloat(candleArray.low),
    volume: parseFloat(candleArray.volume),
  };
};

export default function CandlesChart({ symbol, interval }: CandleProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<CandlestickSeries | null>(null);
  const volumeSeriesRef = useRef<VolumeSeries | null>(null);
  const [candles, setCandles] = useState<(CandlestickData & { volume?: number })[]>([]);
  const [hoverData, setHoverData] = useState<any>(null);

  const { subscribe } = useBybitSocket();

  // --- Загружаем исторические данные ---
  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchHistoricalCandles(symbol, interval);
      setCandles(history);
    };
    loadHistory();
  }, [symbol, interval]);

  // --- Инициализация графика ---
  useLayoutEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#111' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#1e1e1e' },
        horzLines: { color: '#1e1e1e' },
      },
      timeScale: { borderColor: '#333' },
      rightPriceScale: { borderColor: '#333' },
    });

    const candleSeries = chart.addSeries(CandlestickSeries ,{
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '', // отдельная шкала
    });

    // после создания задаём scaleMargins через applyOptions
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // --- Tooltip при наведении ---
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time ||
        !param.seriesData.size ||
        !candleSeriesRef.current ||
        !volumeSeriesRef.current
      ) {
        setHoverData(null);
        return;
      }

      const candleData = param.seriesData.get(candleSeriesRef.current) as CandlestickData;
      const volumeData = param.seriesData.get(volumeSeriesRef.current) as HistogramData;

      if (candleData && volumeData) {
        setHoverData({
          ...candleData,
          volume: volumeData.value,
        });
      }
    });

    return () => chart.remove();
  }, []);

  // --- Подписка на live-данные ---
  useEffect(() => {
    const topic = `kline.${interval}.${symbol}`;
    const unsubscribe = subscribe(topic, (message) => {
      const newCandle = getCandle(message);
      if (!newCandle) return;

      setCandles((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c.time === newCandle.time);
        if (idx !== -1) updated[idx] = newCandle;
        else updated.push(newCandle);
        return updated;
      });
    });

    return unsubscribe;
  }, [subscribe, symbol, interval]);

  // --- Обновление данных на графике ---
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;
    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume || 0,
        color: c.close > c.open ? '#26a69a' : '#ef5350',
      }))
    );
  }, [candles]);

  return (
    <VStack p={5} bg="gray.700" borderRadius="lg" w="60vw" h="70%">
      <Flex w="100%" justify="space-between" mb={2} p={2} bg="gray.800" borderRadius="md" fontSize="sm" >
        {hoverData ? (
          <HStack>
            <Text color="teal.300">O: {hoverData.open.toFixed(2)}</Text>
            <Text color="teal.300">H: {hoverData.high.toFixed(2)}</Text>
            <Text color="teal.300">L: {hoverData.low.toFixed(2)}</Text>
            <Text color="teal.300">C: {hoverData.close.toFixed(2)}</Text>
            <Text color="cyan.400">V: {hoverData.volume?.toFixed(0)}</Text>
          </HStack>
        ) : (
          <Text color="gray.400">Наведите на свечу...</Text>
        )}
      </Flex>
      <Box ref={chartContainerRef} w="100%" h="500px" borderRadius="md" overflow="hidden" />
    </VStack>
  );
}