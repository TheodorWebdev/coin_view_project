import { useEffect, useState } from 'react';
import { VStack, Box, Text, HStack, Heading } from '@chakra-ui/react';
import { useBybitSocket } from './utils/useBybitSocket'
import { sortOrderbook, updateLevels } from './utils/helpfunctions';

interface DepthProps {
  symbol: string;
  depth: string;
}

interface OrderBook {
  s: string;
  b: Map<string, string>;
  a: Map<string, string>;
  u: number;
  seq: number;
}

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

    return {
      ...prev,
      b: newB,
      a: newA,
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
    const { sortedBids, sortedAsks } = sortOrderbook(orderbook.b, orderbook.a);

    return (
      <VStack bg="gray.700" w="30vw" h="90vh" borderRadius="lg">
        <HStack w="100%" justifyContent="space-around">
          <Heading color="gray.100">Price</Heading>
          <Heading color="gray.100">Amount</Heading>
          <Heading color="gray.100">Total</Heading>
        </HStack>
        <Box w="100%" flex="1" overflowY="auto">
          <HStack 
            fontWeight="700" 
            w="100%" 
            justifyContent="space-around"
          >
            <Box color="red.600">
              {sortedBids.map(([price], index) => (
                <Text key={index}>{price}</Text>
              ))}
            </Box>

            <Box color="gray.400">
              {sortedBids.map(([,amount], index) => (
                <Text key={index}>{amount}</Text>
              ))}
            </Box>

            <Box color="orange.200">
              {sortedBids.map(([price, amount], index) => (
                <Text key={index}>
                  {(parseFloat(amount) * parseFloat(price)).toFixed(2)}
                </Text>
              ))}
            </Box>
          </HStack>
        </Box>

        <Box w="100%" flex="1" overflowY="auto">
          <HStack 
            fontWeight="700"
            w="100%" 
            justifyContent="space-around"
          >
            <Box color="green.600">
              {sortedAsks.map(([price], index) => (
                <Text key={index}>{price}</Text>
              ))}
            </Box>

            <Box color="gray.400">
              {sortedAsks.map(([,amount], index) => (
                <Text key={index}>{amount}</Text>
              ))}
            </Box>

            <Box color="orange.200">
              {sortedAsks.map(([price, amount], index) => (
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