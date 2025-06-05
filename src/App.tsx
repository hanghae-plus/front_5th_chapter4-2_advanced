import { ScheduleProvider } from "@/components/providers/schedule-provider";
import ScheduleTables from "@/components/schedule-tables";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleTables />
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
