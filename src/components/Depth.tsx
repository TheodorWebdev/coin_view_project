import React from 'react';
import type { OrderBook } from './useBybitSocket'
import { VStack, Box, Text, HStack, Heading } from '@chakra-ui/react';

interface DepthProps {
  orderbook: OrderBook;
}

const Depth: React.FC<DepthProps> = ({ orderbook }) => {
  const { b, a } = orderbook;

  return (
    <VStack bg="gray.700" w="500px" h="90vh" alignItems="center" justifyContent="center" overflowY="auto">
      <HStack fontWeight="700" w="100%" justifyContent="space-around" alignItems="center">
        <Box color="red.600">
          <Heading color="gray.100">Price</Heading>
          {b.slice(34).map(([price], index) => (
            <Text key={index}>{price}</Text>
          ))}
        </Box>
        <Box color="gray.400">
          <Heading color="gray.100">Amount</Heading>
          {b.slice(34).map(([,size], index) => (
            <Text key={index}>{size}</Text>
          ))}
        </Box>
        <Box color="orange.200">
          <Heading color="gray.100">Total</Heading>
          {b.slice(34).map(([price, size], index) => (
            <Text key={index}>
              {(parseFloat(size) * parseFloat(price)).toFixed(2)}
            </Text>
          ))}
        </Box>
      </HStack>
      <HStack fontWeight="700" w="100%" justifyContent="space-around"  alignItems="center">
        <Box color="green.600">
          {a.slice(0, 16).map(([price], index) => (
            <Text key={index}>{price}</Text>
          ))}
        </Box>
        <Box color="gray.400">
          {a.slice(0, 16).map(([,size], index) => (
            <Text key={index}>{size}</Text>
          ))}
        </Box>
        <Box color="orange.200">
          {a.slice(0, 16).map(([price, size], index) => (
            <Text key={index}>
              {(parseFloat(size) * parseFloat(price)).toFixed(2)}
            </Text>
          ))}
        </Box>
      </HStack>
    </VStack>
  );
};

export default Depth;