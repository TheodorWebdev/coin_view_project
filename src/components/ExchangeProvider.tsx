import { useState } from 'react';

import { ExchangeContext } from './utils/interfaces';
import type { exchangeId, ExchangeContextType } from './utils/interfaces';
import type { ReactNode } from 'react';

export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [exchange, setExchange] = useState<exchangeId>('bybit');

  const value: ExchangeContextType = { exchange, setExchange };

  return (
    <ExchangeContext.Provider value={value}>
      {children}
    </ExchangeContext.Provider>
  );
}