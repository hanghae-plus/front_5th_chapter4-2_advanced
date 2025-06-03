import { Stack, Box, Checkbox } from "@chakra-ui/react";
import { memo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { FixedSizeList as MajorsList } from "react-window";

function ScheduleMemoizedMajors({ majors }: { majors: string[] }) {
  console.log("전공 렌더링");
  return (
    <Stack
      spacing={2}
      overflowY="auto"
      h="100px"
      border="1px solid"
      borderColor="gray.200"
      borderRadius={5}
      p={2}
    >
      <MajorsList
        itemCount={majors.length}
        itemSize={22}
        height={500}
        width={"100%"}
      >
        {({ index, style }: { index: number; style: React.CSSProperties }) => {
          const major = majors[index];
          return (
            <Box style={style} key={index}>
              <Checkbox key={major} size="sm" value={major}>
                {major.replace(/<p>/gi, " ")}
              </Checkbox>
            </Box>
          );
        }}
      </MajorsList>
    </Stack>
  );
}

export default memo(ScheduleMemoizedMajors);
