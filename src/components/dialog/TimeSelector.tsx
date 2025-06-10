import { memo, useCallback } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
  Stack,
  Box,
} from "@chakra-ui/react";
import { TIME_SLOTS } from "@/constants/constants";

const TimeSelector = memo(
  ({
    times,
    onTimesChange,
  }: {
    times: number[];
    onTimesChange: (times: number[]) => void;
  }) => {
    const handleTimeRemove = useCallback(
      (timeToRemove: number) => {
        onTimesChange(times.filter((time) => time !== timeToRemove));
      },
      [times, onTimesChange]
    );

    const handleTimeToggle = useCallback(
      (values: string[]) => {
        onTimesChange(values.map(Number));
      },
      [onTimesChange]
    );

    return (
      <FormControl>
        <FormLabel>시간</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={times}
          onChange={handleTimeToggle}
        >
          <Wrap spacing={1} mb={2}>
            {times
              .sort((a, b) => a - b)
              .map((time) => (
                <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                  <TagLabel>{time}교시</TagLabel>
                  <TagCloseButton onClick={() => handleTimeRemove(time)} />
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
    );
  }
);

export default TimeSelector;
