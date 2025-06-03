import { memo, useCallback, useState, useRef } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  Stack,
  Box,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";

interface SearchOption {
  majors: string[];
}

const ITEM_HEIGHT = 24; // 각 체크박스 아이템의 높이 (px)
const CONTAINER_HEIGHT = 100; // 컨테이너 높이 (px)
const BUFFER_SIZE = 3; // 위아래로 추가로 렌더링할 아이템 수

const MajorSelection = memo(
  ({
    searchOptions,
    onSearchOptionChange,
    allMajors,
  }: {
    searchOptions: SearchOption;
    onSearchOptionChange: (field: keyof SearchOption, value: any) => void;
    allMajors: string[];
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMajorRemove = useCallback(
      (majorToRemove: string) => {
        onSearchOptionChange(
          "majors",
          searchOptions.majors.filter((v) => v !== majorToRemove)
        );
      },
      [searchOptions.majors, onSearchOptionChange]
    );

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // 보이는 영역 계산
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE
    );
    const endIndex = Math.min(
      allMajors.length - 1,
      Math.floor((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER_SIZE
    );

    const visibleItems = allMajors.slice(startIndex, endIndex + 1);
    const totalHeight = allMajors.length * ITEM_HEIGHT;
    const offsetY = startIndex * ITEM_HEIGHT;

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={searchOptions.majors}
          onChange={(values) =>
            onSearchOptionChange("majors", values as string[])
          }
        >
          <Wrap spacing={1} mb={2}>
            {searchOptions.majors.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split("<p>").pop()}</TagLabel>
                <TagCloseButton onClick={() => handleMajorRemove(major)} />
              </Tag>
            ))}
          </Wrap>

          <Box
            ref={containerRef}
            h={`${CONTAINER_HEIGHT}px`}
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            overflowY="auto"
            onScroll={handleScroll}
          >
            {/* 전체 높이를 유지하기 위한 컨테이너 */}
            <Box h={`${totalHeight}px`} position="relative">
              {/* 실제 렌더링되는 아이템들 */}
              <Box position="absolute" top={`${offsetY}px`} width="100%">
                <Stack spacing={2} p={2}>
                  {visibleItems.map((major, index) => (
                    <Box key={startIndex + index} h={`${ITEM_HEIGHT}px`}>
                      <Checkbox size="sm" value={major}>
                        {major.replace(/<p>/gi, " ")}
                      </Checkbox>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </CheckboxGroup>
      </FormControl>
    );
  }
);

export default MajorSelection;
