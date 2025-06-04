import {
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";
import { memo } from "react";
import { TIME_SLOTS } from "../constants";
import { SearchOption } from "../types";

interface TimeCheckboxGroupProps {
  searchOptions: SearchOption;
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const TimeCheckboxGroup = memo(
  ({ searchOptions, onChange }: TimeCheckboxGroupProps) => {
    return (
      <FormControl>
        <FormLabel>시간</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={searchOptions.times}
          onChange={(values) => onChange("times", values.map(Number))}
        >
          <Wrap spacing={1} mb={2}>
            {searchOptions.times
              .sort((a, b) => a - b)
              .map((time) => (
                <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                  <TagLabel>{time}교시</TagLabel>
                  <TagCloseButton
                    onClick={() =>
                      onChange(
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
    );
  }
);

export default TimeCheckboxGroup;
