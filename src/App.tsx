import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleTables } from "./ScheduleTables.tsx";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";
import { ScheduleStoreProvider } from "./schedule/provider/schedule-store-provider.tsx";
import dummyScheduleMap from "./dummyScheduleMap.ts";

function App() {
  return (
    <ChakraProvider>
      <ScheduleStoreProvider initialScheduleMap={dummyScheduleMap}>
        <ScheduleDndProvider>
          <ScheduleTables />
        </ScheduleDndProvider>
      </ScheduleStoreProvider>
    </ChakraProvider>
  );
}

export default App;
