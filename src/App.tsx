import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleProvider } from './context/ScheduleContext.tsx';
import { ScheduleTables } from './components/ScheduleTables.tsx';
import ScheduleDndProvider from './context/ScheduleDndProvider.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          {({ activeTableId }) => <ScheduleTables activeTableId={activeTableId} />}
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
