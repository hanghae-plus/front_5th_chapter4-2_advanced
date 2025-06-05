import { HStack, VStack } from "@chakra-ui/react";
import { SearchOption } from "@/components/dialog/types";
import { memo, useCallback } from "react";
import BasicSearchControls from "./BasicSearchControls";
import TimeSelector from "./TimeSelector";
import MajorSelector from "./MajorSelector";

interface SearchFiltersProps {
  searchOptions: SearchOption;
  allMajors: string[];
  onSearchOptionChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const SearchFilters = ({
  searchOptions,
  allMajors,
  onSearchOptionChange,
}: SearchFiltersProps) => {
  const handleTimesChange = useCallback(
    (times: number[]) => {
      onSearchOptionChange("times", times);
    },
    [onSearchOptionChange]
  );

  const handleMajorsChange = useCallback(
    (majors: string[]) => {
      onSearchOptionChange("majors", majors);
    },
    [onSearchOptionChange]
  );

  return (
    <VStack spacing={4} align="stretch">
      <BasicSearchControls
        searchOptions={searchOptions}
        onSearchOptionChange={onSearchOptionChange}
      />

      {/* 시간 + 전공 */}
      <HStack spacing={4}>
        <TimeSelector
          times={searchOptions.times}
          onTimesChange={handleTimesChange}
        />

        <MajorSelector
          majors={searchOptions.majors}
          allMajors={allMajors}
          onMajorsChange={handleMajorsChange}
        />
      </HStack>
    </VStack>
  );
};

export default memo(SearchFilters);
