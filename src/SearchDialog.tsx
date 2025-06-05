import { useEffect, useCallback, useState, useMemo } from "react";
import {
  Box,
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
  Tag,
  TagCloseButton,
  TagLabel,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { Lecture, LectureWithLowerCased } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import { filterLectures } from "./utils.lecture-filters.ts";
import { DAY_LABELS } from "./constants.ts";
import { useApiCache } from "./use-api-cache.ts";
import { FixedSizeList as List } from "react-window";
import { MajorItem } from "./search-dialog.major-item.tsx";
import { LectureTable } from "./search-dialog.lecture-table.tsx";
import { useSetScheduleMap } from "./schedule/hooks/use-set-schedule-map.ts";
interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

const TIME_SLOTS = [
  { id: 1, label: "09:00~09:30" },
  { id: 2, label: "09:30~10:00" },
  { id: 3, label: "10:00~10:30" },
  { id: 4, label: "10:30~11:00" },
  { id: 5, label: "11:00~11:30" },
  { id: 6, label: "11:30~12:00" },
  { id: 7, label: "12:00~12:30" },
  { id: 8, label: "12:30~13:00" },
  { id: 9, label: "13:00~13:30" },
  { id: 10, label: "13:30~14:00" },
  { id: 11, label: "14:00~14:30" },
  { id: 12, label: "14:30~15:00" },
  { id: 13, label: "15:00~15:30" },
  { id: 14, label: "15:30~16:00" },
  { id: 15, label: "16:00~16:30" },
  { id: 16, label: "16:30~17:00" },
  { id: 17, label: "17:00~17:30" },
  { id: 18, label: "17:30~18:00" },
  { id: 19, label: "18:00~18:50" },
  { id: 20, label: "18:55~19:45" },
  { id: 21, label: "19:50~20:40" },
  { id: 22, label: "20:45~21:35" },
  { id: 23, label: "21:40~22:30" },
  { id: 24, label: "22:35~23:25" },
];

const PAGE_SIZE = 100;

const INITIAL_SEARCH_OPTIONS: SearchOption = {
  query: "",
  grades: [],
  days: [],
  times: [],
  majors: [],
};

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const setSchedulesMap = useSetScheduleMap();
  const { cachedFetch } = useApiCache();

  const [lectures, setLectures] = useState<LectureWithLowerCased[]>([]);
  const [page, setPage] = useState(1);
  const [searchOptions, setSearchOptions] = useState<SearchOption>(
    INITIAL_SEARCH_OPTIONS
  );

  const filteredLectures = useMemo(() => {
    return filterLectures(lectures, searchOptions);
  }, [lectures, searchOptions]);

  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [filteredLectures, page]
  );

  const hasNextPage = visibleLectures.length < filteredLectures.length;
  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);

  const allMajors = useMemo(() => {
    return [...new Set(lectures.map((lecture) => lecture.major))];
  }, [lectures]);

  const majorListData = useMemo(
    () => ({
      majors: allMajors,
      selectedMajors: searchOptions.majors,
    }),
    [allMajors, searchOptions.majors]
  );

  const fetchNextPage = useCallback(() => {
    setPage((prevPage) => {
      return Math.min(lastPage, prevPage + 1);
    });
  }, [lastPage]);

  const changeSearchOption = (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => {
    setPage(1);
    setSearchOptions({ ...searchOptions, [field]: value });
  };

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

  // Dialog가 닫힐 때 모든 state 초기화
  const reset = () => {
    onClose();
    setSearchOptions(INITIAL_SEARCH_OPTIONS);
  };

  useEffect(() => {
    const fetchMajors = () => cachedFetch<Lecture[]>("/schedules-majors.json");

    const fetchLiberalArts = () =>
      cachedFetch<Lecture[]>("/schedules-liberal-arts.json");

    // TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
    const fetchAllLectures = async () =>
      await Promise.all([
        (console.log("API Call 1", performance.now()), fetchMajors()),
        (console.log("API Call 2", performance.now()), fetchLiberalArts()),
        (console.log("API Call 3", performance.now()), fetchMajors()),
        (console.log("API Call 4", performance.now()), fetchLiberalArts()),
        (console.log("API Call 5", performance.now()), fetchMajors()),
        (console.log("API Call 6", performance.now()), fetchLiberalArts()),
      ]);

    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);
      setLectures(
        results
          .flatMap((result) => result.data)
          .map((lecture) => ({
            ...lecture,
            lowerCasedId: lecture.id.toLowerCase(),
            lowerCasedTitle: lecture.title.toLowerCase(),
          })) satisfies LectureWithLowerCased[]
      );
    });
  }, [cachedFetch]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={reset} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>검색어</FormLabel>
                <Input
                  placeholder="과목명 또는 과목코드"
                  value={searchOptions.query}
                  onChange={(e) => changeSearchOption("query", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>학점</FormLabel>
                <Select
                  value={searchOptions.credits}
                  onChange={(e) =>
                    changeSearchOption("credits", e.target.value)
                  }
                >
                  <option value="">전체</option>
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>학년</FormLabel>
                <CheckboxGroup
                  value={searchOptions.grades}
                  onChange={(value) =>
                    changeSearchOption("grades", value.map(Number))
                  }
                >
                  <HStack spacing={4}>
                    {[1, 2, 3, 4].map((grade) => (
                      <Checkbox key={grade} value={grade}>
                        {grade}학년
                      </Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>요일</FormLabel>
                <CheckboxGroup
                  value={searchOptions.days}
                  onChange={(value) =>
                    changeSearchOption("days", value as string[])
                  }
                >
                  <HStack spacing={4}>
                    {DAY_LABELS.map((day) => (
                      <Checkbox key={day} value={day}>
                        {day}
                      </Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>시간</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.times}
                  onChange={(values) =>
                    changeSearchOption("times", values.map(Number))
                  }
                >
                  <Wrap spacing={1} mb={2}>
                    {searchOptions.times
                      .sort((a, b) => a - b)
                      .map((time) => (
                        <Tag
                          key={time}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                        >
                          <TagLabel>{time}교시</TagLabel>
                          <TagCloseButton
                            onClick={() =>
                              changeSearchOption(
                                "times",
                                searchOptions.times.filter((v) => v !== time)
                              )
                            }
                          />
                        </Tag>
                      ))}
                  </Wrap>
                  <Stack
                    spacing={2}
                    overflowY="auto"
                    h="100px"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius={5}
                    p={2}
                  >
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

              <FormControl>
                <FormLabel>전공</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.majors}
                  onChange={(values) =>
                    changeSearchOption("majors", values as string[])
                  }
                >
                  <Wrap spacing={1} mb={2}>
                    {searchOptions.majors.map((major) => (
                      <Tag
                        key={major}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                      >
                        <TagLabel>{major.split("<p>").pop()}</TagLabel>
                        <TagCloseButton
                          onClick={() =>
                            changeSearchOption(
                              "majors",
                              searchOptions.majors.filter((v) => v !== major)
                            )
                          }
                        />
                      </Tag>
                    ))}
                  </Wrap>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius={5}
                  >
                    <List
                      height={100}
                      width={"100%"}
                      itemCount={allMajors.length}
                      itemSize={32}
                      itemData={majorListData}
                    >
                      {MajorItem}
                    </List>
                  </Box>
                </CheckboxGroup>
              </FormControl>
            </HStack>

            <LectureTable
              filteredLectures={filteredLectures}
              visibleLectures={visibleLectures}
              onAddSchedule={addSchedule}
              hasNextPage={hasNextPage}
              isFetchingNextPage={false}
              fetchNextPage={fetchNextPage}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
