import { ChakraProvider } from "@chakra-ui/react";
import { SchedulePage } from "./pages";
import { ScheduleDndProvider } from "./components/dnd";

function App() {
  return (
    <ChakraProvider>
      <ScheduleDndProvider>
        <SchedulePage />
      </ScheduleDndProvider>
    </ChakraProvider>
  );
}

export default App;
