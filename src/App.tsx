import { ScheduleDndProvider } from "@/components/providers/schedule-dnd-provider";
import { ScheduleProvider } from "@/components/providers/schedule-provider";
import ScheduleTables from "@/components/schedule-tables";
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
