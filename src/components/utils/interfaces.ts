import { createContext } from 'react';

export type handler = (message: any) => void;
export type topic = string;
export type exchangeId = 'bybit' | 'binance';

export interface ExchangeContextType {
  exchange: exchangeId;
  setExchange: (exchange: exchangeId) => void;
};

export interface ExchangeSpectator {
  url: string;
	subscribeMsg: (topic: topic) => any;
};

export interface OrderBook {
  s: string;
  b: Map<string, string>;
  a: Map<string, string>;
  u: number;
  seq: number;
};

export const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);