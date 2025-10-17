import Depth from '@/components/Depth';
import { HStack } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider'
import CandlesChart from '@/components/Candles';

function App() {

  return (
    <Provider>
      <HStack minW="100vw" minH="100vh" p={8}>
        <Depth symbol={'BTCUSDT'} depth={'50'} />
        <CandlesChart symbol={'BTCUSDT'} interval={'60'} />
      </HStack>
    </Provider>
  )
}

export default App
