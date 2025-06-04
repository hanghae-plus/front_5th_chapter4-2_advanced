import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./ScheduleContext.tsx";
import { ScheduleTables } from "./ScheduleTables.tsx";
import { DialogProvider } from "./DialogContext.tsx";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <DialogProvider>
          <ScheduleTables />
        </DialogProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
