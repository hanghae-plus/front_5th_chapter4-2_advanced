/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import {
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  CheckboxGroup,
  Checkbox,
} from "@chakra-ui/react";
import { SearchOption } from "./types";
import { DAY_LABELS } from "@/constants/constants";

// 기본 검색 컨트롤들 (학점, 학년, 요일)
const BasicSearchControls = memo(
  ({
    searchOptions,
    onSearchOptionChange,
  }: {
    searchOptions: SearchOption;
    onSearchOptionChange: (field: keyof SearchOption, value: any) => void;
  }) => {
    return (
      <>
        {/* 검색어 + 학점 */}
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>검색어</FormLabel>
            <Input
              placeholder="과목명 또는 과목코드"
              value={searchOptions.query}
              onChange={(e) => onSearchOptionChange("query", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>학점</FormLabel>
            <Select
              value={searchOptions.credits}
              onChange={(e) => onSearchOptionChange("credits", e.target.value)}
            >
              <option value="">전체</option>
              <option value="1">1학점</option>
              <option value="2">2학점</option>
              <option value="3">3학점</option>
            </Select>
          </FormControl>
        </HStack>

        {/* 학년 + 요일 */}
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>학년</FormLabel>
            <CheckboxGroup
              value={searchOptions.grades}
              onChange={(value) =>
                onSearchOptionChange("grades", value.map(Number))
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
                onSearchOptionChange("days", value as string[])
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
      </>
    );
  }
);

export default BasicSearchControls;
