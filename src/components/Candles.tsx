import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export default function CandleChart({ candle }: { candle: Candle }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: 200,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: '#000' },
        textColor: '#fff',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#333' },
      },
      leftPriceScale: { borderColor: '#444', scaleMargins: { top: 0.3, bottom: 0.3 } },
      timeScale: { visible: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    series.setData([candle]);

    return () => {
      chart.remove();
    };
  }, [candle]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}