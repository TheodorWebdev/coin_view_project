import { useEffect, useRef } from 'react';

import { socketManager } from './socketManager';
import { useExchange } from './helpfunctions';

export function useExchangeSocket(topic: string, onData: (msg: any) => void) {
  const { exchange } = useExchange();
  const handlerRef = useRef(onData);

  useEffect(() => {
    handlerRef.current = onData;
  }, [onData]);

  useEffect(() => {
    const handler = (msg: any) => handlerRef.current(msg);
    const unsubscribe = socketManager.subscribe(exchange, topic, handler);

    return unsubscribe;
  }, [exchange, topic]);
}