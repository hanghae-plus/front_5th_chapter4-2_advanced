import { memo, useCallback } from "react";
import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { DAY_LABELS } from "../../constants.ts";
import { MajorCheckbox, TimeSlotCheckbox } from "./index";

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

interface SearchFormProps {
  searchOptions: SearchOption;
  allMajors: string[];
  idPrefix: string;
  onSearchOptionChange: (field: keyof SearchOption, value: SearchOption[typeof field]) => void;
  onMajorToggle: (major: string, checked: boolean) => void;
  onTimeSlotToggle: (id: number, checked: boolean) => void;
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

// 검색 폼 컴포넌트 - 검색 옵션이 변경되어도 테이블은 리렌더링되지 않음
const SearchForm = memo(
  ({ searchOptions, allMajors, idPrefix, onSearchOptionChange, onMajorToggle, onTimeSlotToggle }: SearchFormProps) => {
    const handleQueryChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchOptionChange("query", e.target.value);
      },
      [onSearchOptionChange]
    );

    const handleCreditsChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSearchOptionChange("credits", e.target.value);
      },
      [onSearchOptionChange]
    );

    const handleGradesChange = useCallback(
      (value: (string | number)[]) => {
        onSearchOptionChange("grades", value.map(Number));
      },
      [onSearchOptionChange]
    );

    const handleDaysChange = useCallback(
      (value: (string | number)[]) => {
        onSearchOptionChange("days", value as string[]);
      },
      [onSearchOptionChange]
    );

    const handleTimeTagClose = useCallback(
      (timeToRemove: number) => {
        onSearchOptionChange(
          "times",
          searchOptions.times.filter(v => v !== timeToRemove)
        );
      },
      [onSearchOptionChange, searchOptions.times]
    );

    const handleMajorTagClose = useCallback(
      (majorToRemove: string) => {
        onSearchOptionChange(
          "majors",
          searchOptions.majors.filter(v => v !== majorToRemove)
        );
      },
      [onSearchOptionChange, searchOptions.majors]
    );

    return (
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-query`}>검색어</FormLabel>
            <Input
              id={`${idPrefix}-query`}
              placeholder="과목명 또는 과목코드"
              value={searchOptions.query}
              onChange={handleQueryChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-credits`}>학점</FormLabel>
            <Select id={`${idPrefix}-credits`} value={searchOptions.credits} onChange={handleCreditsChange}>
              <option value="">전체</option>
              <option value="1">1학점</option>
              <option value="2">2학점</option>
              <option value="3">3학점</option>
            </Select>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-grades`}>학년</FormLabel>
            <CheckboxGroup value={searchOptions.grades} onChange={handleGradesChange}>
              <HStack spacing={4}>
                {[1, 2, 3, 4].map(grade => (
                  <Checkbox key={grade} value={grade} id={`${idPrefix}-grade-${grade}`}>
                    {grade}학년
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-days`}>요일</FormLabel>
            <CheckboxGroup value={searchOptions.days} onChange={handleDaysChange}>
              <HStack spacing={4}>
                {DAY_LABELS.map(day => (
                  <Checkbox key={day} value={day} id={`${idPrefix}-day-${day}`}>
                    {day}
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-times`}>시간</FormLabel>
            <Wrap spacing={1} mb={2}>
              {searchOptions.times
                .sort((a, b) => a - b)
                .map(time => (
                  <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                    <TagLabel>{time}교시</TagLabel>
                    <TagCloseButton onClick={() => handleTimeTagClose(time)} />
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
              {TIME_SLOTS.map(timeSlot => (
                <TimeSlotCheckbox
                  key={timeSlot.id}
                  timeSlot={timeSlot}
                  idPrefix={idPrefix}
                  isChecked={searchOptions.times.includes(timeSlot.id)}
                  onToggle={onTimeSlotToggle}
                />
              ))}
            </Stack>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor={`${idPrefix}-majors`}>전공</FormLabel>
            <Wrap spacing={1} mb={2}>
              {searchOptions.majors.map(major => (
                <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                  <TagLabel>{major.split("<p>").pop()}</TagLabel>
                  <TagCloseButton onClick={() => handleMajorTagClose(major)} />
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
              {allMajors.map((major, index) => (
                <MajorCheckbox
                  key={major}
                  major={major}
                  index={index}
                  idPrefix={idPrefix}
                  isChecked={searchOptions.majors.includes(major)}
                  onToggle={onMajorToggle}
                />
              ))}
            </Stack>
          </FormControl>
        </HStack>
      </VStack>
    );
  }
);

SearchForm.displayName = "SearchForm";

export default SearchForm;
