import { useCallback, useEffect, useRef } from 'react';

type DataHandler = (message: any) => void;

export function useBybitSocket() {
  const wssRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Record<string, DataHandler[]>>({});

  const subscribeToTopic = useCallback((topic: string, handler: DataHandler) => {
    if (!handlersRef.current[topic]) {
      handlersRef.current[topic] = [];
    }
    handlersRef.current[topic].push(handler);

    if (wssRef.current?.readyState === WebSocket.OPEN) {
      wssRef.current.send(
        JSON.stringify({
          op: 'subscribe',
          args: [topic],
        })
      )
    }
    
    return () => {
      delete handlersRef.current[topic];
    }
  }, [])
  
  useEffect(() => {
    const wss = new WebSocket('wss://stream.bybit.com/v5/public/spot');
    wssRef.current = wss;

    wss.onopen = () => {
      Object.keys(handlersRef.current).forEach(topic => {
        wss.send(JSON.stringify({
          op: 'subscribe',
          args: [topic],
        }))
      })
    };

    wss.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { topic } = message;

        if (handlersRef.current[topic]) {
          handlersRef.current[topic].forEach(handler => handler(message));
        }

      } catch (error) {
        console.error('Ошибка при обработке WebSocket-сообщения:', error);
      }
    };

    wss.onerror = (err) => {
      console.error('Ошибка WebSocket:', err);
    };

    return () => {
      wss.close();
    };
  }, []);

  return { subscribe: subscribeToTopic };
}