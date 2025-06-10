import { memo } from "react";
import { Flex, GridItem, Text } from "@chakra-ui/react";
import { fill2 } from "@/utils/utils.ts";

interface TimeLabelCellProps {
  timeIndex: number;
  time: string;
}

const TimeLabelCell = memo(({ timeIndex, time }: TimeLabelCellProps) => {
  return (
    <GridItem
      borderTop="1px solid"
      borderColor="gray.300"
      bg={timeIndex > 17 ? "gray.200" : "gray.100"}
    >
      <Flex justifyContent="center" alignItems="center" h="full">
        <Text fontSize="xs">
          {fill2(timeIndex + 1)} ({time})
        </Text>
      </Flex>
    </GridItem>
  );
});

TimeLabelCell.displayName = "TimeLabelCell";

export default TimeLabelCell;
