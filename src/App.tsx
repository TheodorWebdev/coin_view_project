import Depth from '@/components/Depth';
import { VStack, Text } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider'
import { useBybitSocket } from '@/components/useBybitSocket';

function App() {
  // console.log(useBybitSocket('BTCUSDT', '50'));
  const { orderbook } = useBybitSocket('BTCUSDT', '50');

  return (
    <Provider>
      <VStack justifyContent="center" alignItems="center" minW="100vw" minH="100vh">
        {orderbook ? (
            <Depth orderbook={orderbook} />
          ) : (
            <Text>Loading order book...</Text>
          )}
      </VStack>
    </Provider>
  )
}

export default App
