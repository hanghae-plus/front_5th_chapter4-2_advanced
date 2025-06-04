import { memo, useCallback } from "react";
import { Schedule } from "../types";
import { useSearchStore } from "../store/searchStore";
import { useScheduleContext } from "../ScheduleContext";
import { Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleButtonGroup from "./ScheduleButtonGroup";
import ScheduleTable from "../ScheduleTable";

interface IndividualScheduleTableProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
}

const IndividualScheduleTable = memo(
  ({ tableId, schedules, index }: IndividualScheduleTableProps) => {
    const { setSchedulesMap } = useScheduleContext();
    const { setSearchInfo } = useSearchStore();

    const handleScheduleTimeClick = useCallback(
      (tableId: string, timeInfo: { day: string; time: number }) => {
        setSearchInfo({ tableId, ...timeInfo });
      },
      [setSearchInfo]
    );

    const handleScheduleDeleteClick = useCallback(
      (tableId: string, { day, time }: { day: string; time: number }) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].filter(
            (schedule) => schedule.day !== day || !schedule.range.includes(time)
          ),
        }));
      },
      [setSchedulesMap]
    );

    return (
      <Stack key={tableId} width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ScheduleButtonGroup
            tableId={tableId}
            scheduleCount={schedules.length}
          />
        </Flex>
        <ScheduleTable
          key={`schedule-table-${index}`}
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={(timeInfo) =>
            handleScheduleTimeClick(tableId, timeInfo)
          }
          onDeleteButtonClick={({ day, time }) =>
            handleScheduleDeleteClick(tableId, { day, time })
          }
        />
      </Stack>
    );
  }
);

export default IndividualScheduleTable;
