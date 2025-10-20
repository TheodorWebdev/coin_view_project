import { VStack, Box, Text, HStack, Heading } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { sortOrderbook, updateLevels } from './utils/helpfunctions';
// import { useBybitSocket } from './utils/useBybitSocket';
import { useExchangeSocket } from './utils/useExchangeSocket';
import type { OrderBook } from './utils/interfaces';

const getOrderbook = (message: any, prev: OrderBook | null): OrderBook | null => {
  const data = message.data;

  if (message.type === 'snapshot') {
    return {
      s: data.s,
      b: new Map(data.b),
      a: new Map(data.a),
      u: data.u,
      seq: data.seq,
    };
  } else if (message.type === 'delta') {
    if (!prev) return prev;
    const { newB, newA } = updateLevels(prev.b, prev.a, data);
    const { bids, asks } = sortOrderbook(newB, newA);

    return {
      ...prev,
      b: bids,
      a: asks,
      u: data.u,
      seq: data.seq,
    };
  }

  return prev;
}

export default function Depth({ symbol, depth }: { symbol: string, depth: string }) {
  const [ orderbook, setOrderbook ] = useState<OrderBook | null>(null);
  // const { subscribe } = useBybitSocket();
  
  const bidsRef = useRef<HTMLDivElement>(null);
  const [ isUserScroll, setIsUserScroll ] = useState(false);

  const topic = `orderbook.${depth}.${symbol}`;
  // const topic = `${symbol.toLowerCase()}@depth${depth}`;

  const handleScroll = () => {
    const container = bidsRef.current;
    if (!container) return;

    const isScrolledToBottom = (container.scrollHeight - container.scrollTop) <= (container.clientHeight + 1);

    if (!isScrolledToBottom) {
      setIsUserScroll(true);
    } else {
      setIsUserScroll(false);
    }
  };

  useExchangeSocket(topic, (msg) => {
    setOrderbook(prev => getOrderbook(msg, prev));
  });

  // useEffect(() => {
  //   const unsubscribe = subscribe(topic, (message) => {
  //     setOrderbook(prev => getOrderbook(message, prev))
  //   });

  //   return unsubscribe;
  // }, [subscribe, symbol, depth])

  useEffect(() => {
    const container = bidsRef.current;
    if (!container || isUserScroll) return;

    container.scrollTop = container.scrollHeight - container.clientHeight;

  }, [orderbook, isUserScroll]);

  if (!orderbook) {
    return <Text>Loading order book...</Text>
  } else {
    return (
      <VStack bg="gray.700" w="30vw" h="90vh" borderRadius="lg">
        <HStack w="100%" justifyContent="space-between" px="4">
          <Heading color="gray.100" w="30%">Price</Heading>
          <Heading color="gray.100" w="30%">Amount</Heading>
          <Heading color="gray.100" w="30%">Total</Heading>
        </HStack>
        <Box ref={bidsRef} onScroll={handleScroll} w="100%" flex="1" overflowY="auto" px="4">
          <HStack 
            fontWeight="700" 
            w="100%" 
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box color="red.600" w="30%">
              {Array.from(orderbook.b.keys()).map((price, index) => (
                <Text key={index}>{price}</Text>
              ))}
            </Box>

            <Box color="gray.400" w="30%">
              {Array.from(orderbook.b.values()).map((amount, index) => (
                <Text key={index}>{amount}</Text>
              ))}
            </Box>

            <Box color="orange.200" w="30%">
              {Array.from(orderbook.b.entries()).map(([price, amount], index) => (
                <Text key={index}>
                  {(parseFloat(amount) * parseFloat(price)).toFixed(2)}
                </Text>
              ))}
            </Box>
          </HStack>
        </Box>

        <Box w="100%" flex="1" overflowY="auto" px="4">
          <HStack 
            fontWeight="700"
            w="100%" 
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box color="green.600" w="30%">
              {Array.from(orderbook.a.keys()).map((price, index) => (
                <Text key={index}>{price}</Text>
              ))}
            </Box>

            <Box color="gray.400" w="30%">
              {Array.from(orderbook.a.values()).map((amount, index) => (
                <Text key={index}>{amount}</Text>
              ))}
            </Box>

            <Box color="orange.200" w="30%">
              {Array.from(orderbook.a.entries()).map(([price, amount], index) => (
                <Text key={index}>
                  {(parseFloat(amount) * parseFloat(price)).toFixed(2)}
                </Text>
              ))}
            </Box>
          </HStack>
        </Box>
      </VStack>
    );
  }
};