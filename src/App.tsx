import Depth from '@/components/Depth';
import { HStack } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider'
import CandlesChart from '@/components/Candles';
import { ExchangeProvider } from './components/ExchangeProvider';

function App() {

  return (
    <ExchangeProvider>
      <Provider>
        <HStack minW="100vw" minH="100vh" p={8} gap={5}>
          <Depth symbol={'BTCUSDT'} depth={'50'} />
          {/* <CandlesChart symbol={'BTCUSDT'} interval={'5'} /> "D" */}
        </HStack>
      </Provider>
    </ExchangeProvider>
  )
}

export default App
