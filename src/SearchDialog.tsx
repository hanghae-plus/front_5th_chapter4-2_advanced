import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useScheduleContext } from './ScheduleContext.tsx';
import { Lecture } from './types.ts';
import { parseSchedule } from './utils.ts';
import axios from 'axios';
import SearchQueryControl from './search/SearchQueryControl.tsx';
import SearchCreditsControl from './search/SearchCreditsControl.tsx';
import SearchGradesControl from './search/SearchGradesControl.tsx';
import SearchDaysControl from './search/SearchDaysControl.tsx';
import SearchTimesControl from './search/SearchTimesControl.tsx';
import SearchMajorsControl from './search/SearchMajorsControl.tsx';

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

const PAGE_SIZE = 100;

type Cache<T> = {
  data: T;
  timestamp: number;
};

const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24;
const MajorsCache: Cache<Lecture[]> = {
  data: [],
  timestamp: 0,
};
const LiberalArtsCache: Cache<Lecture[]> = {
  data: [],
  timestamp: 0,
};

const fetchMajors = async () => {
  if (MajorsCache.timestamp + CACHE_EXPIRATION_TIME < Date.now()) {
    const response = await axios.get<Lecture[]>('/schedules-majors.json');
    MajorsCache.data = response.data;
    MajorsCache.timestamp = Date.now();
  }
  return MajorsCache;
};
const fetchLiberalArts = async () => {
  if (LiberalArtsCache.timestamp + CACHE_EXPIRATION_TIME < Date.now()) {
    const response = await axios.get<Lecture[]>('/schedules-liberal-arts.json');
    LiberalArtsCache.data = response.data;
    LiberalArtsCache.timestamp = Date.now();
  }
  return LiberalArtsCache;
};

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
const fetchAllLectures = async () =>
  await Promise.all([
    (console.log('API Call 1', performance.now()), fetchMajors()),
    (console.log('API Call 2', performance.now()), fetchLiberalArts()),
    (console.log('API Call 3', performance.now()), fetchMajors()),
    (console.log('API Call 4', performance.now()), fetchLiberalArts()),
    (console.log('API Call 5', performance.now()), fetchMajors()),
    (console.log('API Call 6', performance.now()), fetchLiberalArts()),
  ]);

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = ({ searchInfo, onClose }: Props) => {
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

  const filteredLectures = useMemo(() => {
    if (lectures.length === 0) {
      return [];
    }

    const { query = '', credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase())
      )
      .filter((lecture) => grades.length === 0 || grades.includes(lecture.grade))
      .filter((lecture) => majors.length === 0 || majors.includes(lecture.major))
      .filter((lecture) => !credits || lecture.credits.startsWith(String(credits)))
      .filter((lecture) => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => days.includes(s.day));
      })
      .filter((lecture) => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => s.range.some((time) => times.includes(time)));
      });
  }, [searchOptions, lectures]);

  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);
  const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );
  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    []
  );

  const addSchedule = (lecture: Lecture) => {
    if (!searchInfo) return;

    const { tableId } = searchInfo;

    const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
      ...schedule,
      lecture,
    }));

    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: [...prev[tableId], ...schedules],
    }));

    onClose();
  };

  useEffect(() => {
    const start = performance.now();
    console.log('API 호출 시작: ', start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log('모든 API 호출 완료 ', end);
      console.log('API 호출에 걸린 시간(ms): ', end - start);
      setLectures(results.flatMap((result) => result.data));
    });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  const handleQueryChange = useCallback(
    (query: string) => {
      changeSearchOption('query', query);
    },
    [changeSearchOption]
  );

  const handleCreditsChange = useCallback(
    (credits: number) => {
      changeSearchOption('credits', credits);
    },
    [changeSearchOption]
  );

  const handleGradesChange = useCallback(
    (grades: number[]) => {
      changeSearchOption('grades', grades);
    },
    [changeSearchOption]
  );

  const handleDaysChange = useCallback(
    (days: string[]) => {
      changeSearchOption('days', days);
    },
    [changeSearchOption]
  );

  const handleTimesChange = useCallback(
    (times: number[]) => {
      changeSearchOption('times', times);
    },
    [changeSearchOption]
  );

  const handleMajorsChange = useCallback(
    (majors: string[]) => {
      changeSearchOption('majors', majors);
    },
    [changeSearchOption]
  );

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <SearchQueryControl query={searchOptions.query} onChange={handleQueryChange} />

              <SearchCreditsControl
                credits={searchOptions.credits}
                onChange={handleCreditsChange}
              />
            </HStack>

            <HStack spacing={4}>
              <SearchGradesControl grades={searchOptions.grades} onChange={handleGradesChange} />

              <SearchDaysControl days={searchOptions.days} onChange={handleDaysChange} />
            </HStack>

            <HStack spacing={4}>
              <SearchTimesControl
                times={searchOptions.times}
                onChange={handleTimesChange}
                changeSearchOption={changeSearchOption}
              />

              <SearchMajorsControl
                majors={searchOptions.majors}
                onChange={handleMajorsChange}
                changeSearchOption={changeSearchOption}
                allMajors={allMajors}
              />
            </HStack>
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
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
                <Table size="sm" variant="striped">
                  <Tbody>
                    {visibleLectures.map((lecture, index) => (
                      <Tr key={`${lecture.id}-${index}`}>
                        <Td width="100px">{lecture.id}</Td>
                        <Td width="50px">{lecture.grade}</Td>
                        <Td width="200px">{lecture.title}</Td>
                        <Td width="50px">{lecture.credits}</Td>
                        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
                        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
                        <Td width="80px">
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => addSchedule(lecture)}
                          >
                            추가
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Box ref={loaderRef} h="20px" />
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
