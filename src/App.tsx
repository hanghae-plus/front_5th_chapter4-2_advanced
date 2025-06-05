import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./providers/ScheduleContext.tsx";
import { ScheduleTables } from "./components/ScheduleTables";
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
