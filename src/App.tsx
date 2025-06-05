import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleTables } from "./ScheduleTables.tsx";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";
import { ScheduleStoreProvider } from "./schedule/provider/schedule-store-provider.tsx";
import dummyScheduleMap from "./dummyScheduleMap.ts";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <ScheduleStoreProvider initialScheduleMap={dummyScheduleMap}>
          <ScheduleDndProvider>
            <ScheduleTables />
          </ScheduleDndProvider>
        </ScheduleStoreProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
