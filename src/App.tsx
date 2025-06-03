import { ScheduleProvider } from "@/ScheduleContext.tsx";
import ScheduleDndProvider from "@/ScheduleDndProvider.tsx";
import { ScheduleTables } from "@/ScheduleTables.tsx";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <ScheduleTables />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
