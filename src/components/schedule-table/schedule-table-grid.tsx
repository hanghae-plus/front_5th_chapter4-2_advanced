import { CellSize, DAY_LABELS, SCHEDULE_TIMES } from "@/config/constants";
import { useLocalScheduleContext } from "@/hooks/use-local-schedule-context";
import { fill2 } from "@/lib/utils";
import { Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { Fragment, memo, useMemo } from "react";

// ScheduleTableGrid memo 사용
export const ScheduleTableGrid = memo(() => {
  const { handleScheduleTimeClick } = useLocalScheduleContext();

  const dayLabels = useMemo(() => {
    return DAY_LABELS.map((day) => {
      const Days = memo(() => (
        <GridItem borderLeft="1px" borderColor="gray.300" bg="gray.100">
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontWeight="bold">{day}</Text>
          </Flex>
        </GridItem>
      ));

      return <Days key={day} />;
    });
  }, []);

  const scheduleTimes = useMemo(() => {
    return SCHEDULE_TIMES.map((time, timeIndex) => {
      const Frag = memo(() => (
        <Fragment>
          <GridItem borderTop="1px solid" borderColor="gray.300" bg={timeIndex > 17 ? "gray.200" : "gray.100"}>
            <Flex justifyContent="center" alignItems="center" h="full">
              <Text fontSize="xs">
                {fill2(timeIndex + 1)} ({time})
              </Text>
            </Flex>
          </GridItem>
          {DAY_LABELS.map((day) => {
            const Grid = memo(() => (
              <GridItem
                borderWidth="1px 0 0 1px"
                borderColor="gray.300"
                bg={timeIndex > 17 ? "gray.100" : "white"}
                cursor="pointer"
                _hover={{ bg: "yellow.100" }}
                onClick={() => handleScheduleTimeClick({ day, time: timeIndex + 1 })}
              />
            ));
            return <Grid key={`${day}-${timeIndex + 2}`} />;
          })}
        </Fragment>
      ));
      return <Frag key={`시간-${timeIndex + 1}`} />;
    });
  }, [handleScheduleTimeClick]);

  return (
    <Grid
      templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
      templateRows={`40px repeat(${SCHEDULE_TIMES.length}, ${CellSize.HEIGHT}px)`}
      bg="white"
      fontSize="sm"
      textAlign="center"
      outline="1px solid"
      outlineColor="gray.300"
    >
      <GridItem key="교시" borderColor="gray.300" bg="gray.100">
        <Flex justifyContent="center" alignItems="center" h="full" w="full">
          <Text fontWeight="bold">교시</Text>
        </Flex>
      </GridItem>
      {dayLabels}
      {scheduleTimes}
    </Grid>
  );
});
