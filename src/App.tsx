import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleProvider } from './ScheduleContext.tsx';
import { ScheduleTables } from './ScheduleTables.tsx';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';
import { fetchAllLectures } from './api.ts';
import { Lecture } from './types.ts';
import { useEffect, useState } from 'react';

function App() {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    const start = performance.now();
    console.log('API 호출 시작: ', start);
    fetchAllLectures().then((data) => {
      const end = performance.now();
      console.log('모든 API 호출 완료 ', end);
      console.log('API 호출에 걸린 시간(ms): ', end - start);
      setLectures(data);
    });
  }, []);

  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <ScheduleTables lectures={lectures} />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
