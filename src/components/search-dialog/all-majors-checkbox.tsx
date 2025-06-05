import { Box, Checkbox, Stack } from "@chakra-ui/react";
import { memo } from "react";

export const AllMajorsCheckbox = memo(({ allMajors }: { allMajors: string[] }) => {
  return (
    <Stack spacing={2} overflowY="auto" h="100px" border="1px solid" borderColor="gray.200" borderRadius={5} p={2}>
      {allMajors.map((major) => (
        <Box key={major}>
          <Checkbox key={major} size="sm" value={major}>
            {major.replace(/<p>/gi, " ")}
          </Checkbox>
        </Box>
      ))}
    </Stack>
  );
});
