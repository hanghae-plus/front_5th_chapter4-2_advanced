import { memo, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Lecture } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";
import { DAY_LABELS } from "./constants.ts";
import { PAGE_SIZE, TIME_SLOTS } from "./shared/config.ts";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

interface SearchOption {
  query: string,
  grades: number[],
  days: string[],
  times: number[],
  majors: string[],
  credits?: number,
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

const cachedApi = new Map<string, ApiResponse<Lecture[]>>();

const cachedFetch = (fetchFn: () => Promise<ApiResponse<Lecture[]>>): Promise<ApiResponse<Lecture[]>> => {
  const key = fetchFn.name;
  if (cachedApi.has(key)) {
    const cached = cachedApi.get(key);
    if (cached) return Promise.resolve(cached);
  }

  const promise = fetchFn().then(res => {
    cachedApi.set(key, res);
    return res;
  });

  return promise;
}

const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json') 
const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json')

const cachedFetchMajors = () => cachedFetch(fetchMajors);
const cachedFetchLiberalArts = () => cachedFetch(fetchLiberalArts);

const fetchAllLectures = async () => {
  console.log('병렬 API 호출 시작', performance.now());
  const promises = [
    cachedFetchMajors().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 1', performance.now()), res)),
    cachedFetchLiberalArts().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 2', performance.now()), res)),
    cachedFetchMajors().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 3', performance.now()), res)),
    cachedFetchLiberalArts().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 4', performance.now()), res)),
    cachedFetchMajors().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 5', performance.now()), res)),
    cachedFetchLiberalArts().then((res: ApiResponse<Lecture[]>) => (console.log('API Call 6', performance.now()), res)),
  ];
  return Promise.all(promises)
}

/* --------- 검색 컴포넌트 --------- */
interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const SearchInput = memo(({ value, onChange }: SearchInputProps) => {
  return (
    <FormControl>
         <FormLabel>검색어</FormLabel>
         <Input
           placeholder="과목명 또는 과목코드"
           value={value}
           onChange={onChange}
          />
     </FormControl>
  )
})

/* --------- 학년 선택 컴포넌트 --------- */
interface GradeSelectProps {
  value: number[];
  onChange: (value: (string|number)[]) => void;
}
const GradeSelect = memo(({ value, onChange }: GradeSelectProps) => {
  return (
    <FormControl>
                <FormLabel>학년</FormLabel>
                <CheckboxGroup
                  value={value}
                  onChange={onChange}
                >
                  <HStack spacing={4}>
                    {[1, 2, 3, 4].map(grade => (
                      <Checkbox key={grade} value={grade}>{grade}학년</Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
   </FormControl>
  )
})

/* --------- 요일 선택 컴포넌트 --------- */
interface DaySelectProps {
  value: string[];
  onChange: (value: (string|number)[]) => void;
}
const DaySelect = memo(({ value, onChange }: DaySelectProps) => {
  return (
  <FormControl>
    <FormLabel>요일</FormLabel>
    <CheckboxGroup
      value={value}
      onChange={onChange}
    >
      <HStack spacing={4}>
        {DAY_LABELS.map(day => (
          <Checkbox key={day} value={day}>{day}</Checkbox>
        ))}
      </HStack>
    </CheckboxGroup>
  </FormControl>
  )
})

/* --------- 시간 선택 컴포넌트 --------- */
interface TimeSelectProps {
  value: number[];
  onChange: (value: (string|number)[]) => void;
  onClick: (time: number) => void;
}
const TimeSelect = memo(({ value, onChange, onClick }: TimeSelectProps) => {
  return (
    <FormControl>
    <FormLabel>시간</FormLabel>
    <CheckboxGroup
      colorScheme="green"
      value={value}
      onChange={onChange}
    >
      <Wrap spacing={1} mb={2}>
        {value.sort((a, b) => a - b).map(time => (
          <Tag key={time} size="sm" variant="outline" colorScheme="blue">
            <TagLabel>{time}교시</TagLabel>
            <TagCloseButton
              onClick={() => onClick(time)}/>
          </Tag>
        ))}
      </Wrap>
      <Stack spacing={2} overflowY="auto" h="100px" border="1px solid" borderColor="gray.200"
             borderRadius={5} p={2}>
        {TIME_SLOTS.map(({ id, label }) => (
          <Box key={id}>
            <Checkbox key={id} size="sm" value={id}>
              {id}교시({label})
            </Checkbox>
          </Box>
        ))}
      </Stack>
    </CheckboxGroup>
  </FormControl>
    
  )
})

/* --------- 학점 선택 컴포넌트 --------- */
interface CreditsSelectProps {
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
const CreditsSelect = memo(({ value, onChange }: CreditsSelectProps) => {
  return (
    <FormControl>
                <FormLabel>학점</FormLabel>
                <Select
                  value={value}
                  onChange={onChange}
                >
                  <option value="">전체</option>
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                </Select>
    </FormControl>
  )
})

/* --------- 강의 테이블 컴포넌트 --------- */
interface LectureTableProps {
  lectures: Lecture[];
  addSchedule: (lecture: Lecture) => void;
}
const LectureTable = memo(({ lectures, addSchedule }: LectureTableProps) => {
  return (
    <Table size="sm" variant="striped">
                  <Tbody>
                    {lectures.map((lecture, index) => (
                      <Tr key={`${lecture.id}-${index}`}>
                        <Td width="100px">{lecture.id}</Td>
                        <Td width="50px">{lecture.grade}</Td>
                        <Td width="200px">{lecture.title}</Td>
                        <Td width="50px">{lecture.credits}</Td>
                        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }}/>
                        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }}/>
                        <Td width="80px">
                          <Button size="sm" colorScheme="green" onClick={() => addSchedule(lecture)}>추가</Button>
                        </Td>
                      </Tr>
                    ))}
      </Tbody>
   </Table>
    
  )
})


/* --------- 검색 모달 컴포넌트 --------- */
// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: '',
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  const getFilteredLectures = () => {
    const { query = '', credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter(lecture =>
        lecture.title.toLowerCase().includes(query.toLowerCase()) ||
        lecture.id.toLowerCase().includes(query.toLowerCase())
      )
      .filter(lecture => grades.length === 0 || grades.includes(lecture.grade))
      .filter(lecture => majors.length === 0 || majors.includes(lecture.major))
      .filter(lecture => !credits || lecture.credits.startsWith(String(credits)))
      .filter(lecture => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => days.includes(s.day));
      })
      .filter(lecture => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => s.range.some(time => times.includes(time)));
      });
  }

  const filteredLectures = getFilteredLectures();
  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);
  const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);
  const allMajors = [...new Set(lectures.map(lecture => lecture.major))];

  const changeSearchOption = (field: keyof SearchOption, value: SearchOption[typeof field]) => {
    setPage(1);
    setSearchOptions(({ ...searchOptions, [field]: value }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  };

  const addSchedule = (lecture: Lecture) => {
    if (!searchInfo) return;

    const { tableId } = searchInfo;

    const schedules = parseSchedule(lecture.schedule).map(schedule => ({
      ...schedule,
      lecture
    }));

    setSchedulesMap(prev => ({
      ...prev,
      [tableId]: [...prev[tableId], ...schedules]
    }));

    onClose();
  };

  useEffect(() => {
    const start = performance.now();
    console.log('API 호출 시작: ', start)
    const result = fetchAllLectures()
    result.then(results => {
      const end = performance.now();
      console.log('모든 API 호출 완료 ', end)
      console.log('API 호출에 걸린 시간(ms): ', end - start)
      setLectures(results.flatMap(result => result.data));
    })
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setSearchOptions(prev => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }))
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay/>
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <SearchInput value={searchOptions.query} onChange={(e) => changeSearchOption('query', e.target.value)}/>
              <CreditsSelect value={searchOptions.credits} onChange={(e) => changeSearchOption('credits', e.target.value)}/>
            </HStack>

            <HStack spacing={4}>
              <GradeSelect value={searchOptions.grades} onChange={(value) => changeSearchOption('grades', value.map(Number))}/>

              <DaySelect value={searchOptions.days} onChange={(value) => changeSearchOption('days', value as string[])}/>
            </HStack>

            <HStack spacing={4}>

              <TimeSelect value={searchOptions.times} onChange={(value) => changeSearchOption('times', value.map(Number))} onClick={(time) => changeSearchOption('times', searchOptions.times.filter(v => v !== time))}/>

              <FormControl>
                <FormLabel>전공</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.majors}
                  onChange={(values) => changeSearchOption('majors', values as string[])}
                >
                  <Wrap spacing={1} mb={2}>
                    {searchOptions.majors.map(major => (
                      <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                        <TagLabel>{major.split("<p>").pop()}</TagLabel>
                        <TagCloseButton
                          onClick={() => changeSearchOption('majors', searchOptions.majors.filter(v => v !== major))}/>
                      </Tag>
                    ))}
                  </Wrap>
                  <Stack spacing={2} overflowY="auto" h="100px" border="1px solid" borderColor="gray.200"
                         borderRadius={5} p={2}>
                    {allMajors.map(major => (
                      <Box key={major}>
                        <Checkbox key={major} size="sm" value={major}>
                          {major.replace(/<p>/gi, ' ')}
                        </Checkbox>
                      </Box>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </HStack>
            <Text align="right">
              검색결과: {filteredLectures.length}개
            </Text>
            <Box>
              <Table>
                <Thead>
                  <Tr>
                    <Th width="100px">과목코드</Th>
                    <Th width="50px">학년</Th>
                    <Th width="200px">과목명</Th>
                    <Th width="50px">학점</Th>
                    <Th width="150px">전공</Th>
                    <Th width="150px">시간</Th>
                    <Th width="80px"></Th>
                  </Tr>
                </Thead>
              </Table>

              <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
                <LectureTable lectures={visibleLectures} addSchedule={addSchedule}/>
                <Box ref={loaderRef} h="20px"/>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default SearchDialog;