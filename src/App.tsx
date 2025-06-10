import { ChakraProvider } from "@chakra-ui/react";
import SchedulePage from "@/pages/SchedulePage.tsx";
import ScheduleDndProvider from "@/contexts/ScheduleDndProvider.tsx";
import { ScheduleProvider } from "@/contexts/ScheduleContext.tsx";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <SchedulePage />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
