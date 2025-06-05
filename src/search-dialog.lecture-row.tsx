import { memo } from "react";
import { Button, Box, Flex } from "@chakra-ui/react";
import { Lecture, LectureWithLowerCased } from "./types.ts";

interface LectureRowProps {
  lecture: LectureWithLowerCased;
  onAddSchedule: (lecture: Lecture) => void;
  isEven: boolean;
}

export const LectureRow = memo(
  ({ lecture, onAddSchedule, isEven }: LectureRowProps) => {
    return (
      <Flex
        bg={isEven ? "#EDF2F7" : "white"}
        align="center"
        minH="65px"
        lineHeight={1.1}
      >
        <Box width="12.5%" px={2} fontSize="sm">
          {lecture.id}
        </Box>
        <Box width="6.6%" px={2} fontSize="sm" textAlign="center">
          {lecture.grade}
        </Box>
        <Box width="25%" px={2} fontSize="sm" noOfLines={1}>
          {lecture.title}
        </Box>
        <Box width="8.5%" px={2} fontSize="sm" textAlign="center">
          {lecture.credits}
        </Box>
        <Box
          width="18.7%"
          px={2}
          fontSize="sm"
          noOfLines={1}
          dangerouslySetInnerHTML={{ __html: lecture.major }}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        />
        <Box
          width="18.7%"
          px={2}
          fontSize="sm"
          noOfLines={1}
          dangerouslySetInnerHTML={{ __html: lecture.schedule }}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        />
        <Box width="10%" px={2}>
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => onAddSchedule(lecture)}
          >
            추가
          </Button>
        </Box>
      </Flex>
    );
  }
);

LectureRow.displayName = "LectureRow";
