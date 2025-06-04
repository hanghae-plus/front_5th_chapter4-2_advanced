import { Flex, GridItem, Text } from "@chakra-ui/react";
import React, { Fragment } from "react";
import { DAY_LABELS } from "../constants";
import { fill2 } from "../utils";

interface TimeRowProps {
  timeIndex: number;
  time: string;
  onScheduleTimeClick?: (day: string, time: number) => void;
}

export const TimeRow = React.memo(
  ({ timeIndex, time, onScheduleTimeClick }: TimeRowProps) => {
    return (
      <Fragment key={`시간-${timeIndex + 1}`}>
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
        {DAY_LABELS.map((day) => (
          <GridItem
            key={`${day}-${timeIndex + 2}`}
            borderWidth="1px 0 0 1px"
            borderColor="gray.300"
            bg={timeIndex > 17 ? "gray.100" : "white"}
            cursor="pointer"
            _hover={{ bg: "yellow.100" }}
            onClick={() => onScheduleTimeClick?.(day, timeIndex + 1)}
          />
        ))}
      </Fragment>
    );
  }
);
