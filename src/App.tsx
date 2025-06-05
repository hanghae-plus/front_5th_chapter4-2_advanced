import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./providers/ScheduleContext";
import { ScheduleTables } from "./ScheduleTables";
import ScheduleDndProvider from "./providers/ScheduleDndProvider";

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
