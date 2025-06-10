import { memo } from "react";
import { Flex, GridItem, Text } from "@chakra-ui/react";

interface ScheduleTableHeaderRowProps {
  days: readonly string[];
}

const ScheduleTableHeaderRow = memo(({ days }: ScheduleTableHeaderRowProps) => {
  return (
    <>
      <GridItem key="교시" borderColor="gray.300" bg="gray.100">
        <Flex justifyContent="center" alignItems="center" h="full" w="full">
          <Text fontWeight="bold">교시</Text>
        </Flex>
      </GridItem>
      {days.map((day) => (
        <GridItem
          key={day}
          borderLeft="1px"
          borderColor="gray.300"
          bg="gray.100"
        >
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontWeight="bold">{day}</Text>
          </Flex>
        </GridItem>
      ))}
    </>
  );
});

ScheduleTableHeaderRow.displayName = "ScheduleTableHeaderRow";

export default ScheduleTableHeaderRow;
