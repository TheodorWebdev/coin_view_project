import { useEffect, useState } from 'react';
import { VStack, Box, Text, HStack, Heading } from '@chakra-ui/react';
import { useBybitSocket } from './utils/useBybitSocket'
import { updateLevels, sortOrderbook } from './utils/helpfunctions';

interface DepthProps {
  symbol: string;
  depth: string;
}

interface OrderBook {
  s: string;
  b: Array<[string, string]>;
  a: Array<[string, string]>;
  u: number;
  seq: number;
}

const getOrderbook = (message: any, prev: OrderBook | null): OrderBook | null => {
  const data = message.data;

  if (message.type === 'snapshot') {
    return {
      s: data.s,
      b: data.b,
      a: data.a,
      u: data.u,
      seq: data.seq,
    };
  } else if (message.type === 'delta') {
    if (!prev) return prev;

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
  }
  return prev;
}

export default function Depth({ symbol, depth }: DepthProps) {
  const [ orderbook, setOrderbook ] = useState<OrderBook | null>(null);
  const { subscribe } = useBybitSocket();

  useEffect(() => {
    const topic = `orderbook.${depth}.${symbol}`;
    
    const unsubscribe = subscribe(topic, (message) => {
      setOrderbook(prev => getOrderbook(message, prev))
    });

    return unsubscribe;
  }, [subscribe, symbol, depth])

  if (!orderbook) {
    return <Text>Loading order book...</Text>
  } else {
    return (
      <VStack bg="gray.700" w="30vw" h="90vh" alignItems="center" justifyContent="center" overflowY="auto" borderRadius="lg">
        <HStack fontWeight="700" w="100%" justifyContent="space-around" alignItems="center">
          <Box color="red.600">
            <Heading color="gray.100">Price</Heading>
            {orderbook.b.slice(35).map(([price], index) => (
              <Text key={index}>{price}</Text>
            ))}
          </Box>
          <Box color="gray.400">
            <Heading color="gray.100">Amount</Heading>
            {orderbook.b.slice(35).map(([,size], index) => (
              <Text key={index}>{size}</Text>
            ))}
          </Box>
          <Box color="orange.200">
            <Heading color="gray.100">Total</Heading>
            {orderbook.b.slice(35).map(([price, size], index) => (
              <Text key={index}>
                {(parseFloat(size) * parseFloat(price)).toFixed(2)}
              </Text>
            ))}
          </Box>
        </HStack>
        <HStack fontWeight="700" w="100%" justifyContent="space-around"  alignItems="center">
          <Box color="green.600">
            {orderbook!.a.slice(0, 15).map(([price], index) => (
              <Text key={index}>{price}</Text>
            ))}
          </Box>
          <Box color="gray.400">
            {orderbook.a.slice(0, 15).map(([,size], index) => (
              <Text key={index}>{size}</Text>
            ))}
          </Box>
          <Box color="orange.200">
            {orderbook.a.slice(0, 15).map(([price, size], index) => (
              <Text key={index}>
                {(parseFloat(size) * parseFloat(price)).toFixed(2)}
              </Text>
            ))}
          </Box>
        </HStack>
      </VStack>
    );
  }
};