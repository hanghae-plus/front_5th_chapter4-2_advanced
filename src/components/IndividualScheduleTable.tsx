import { memo, useCallback } from "react";
import { Schedule } from "../types";
import { useSearchStore } from "../store/searchStore";
import { Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleButtonGroup from "./ScheduleButtonGroup";
import ScheduleTable from "../ScheduleTable";
import { useDndContext } from "@dnd-kit/core";

interface IndividualScheduleTableProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
}

const IndividualScheduleTable = memo(
  ({
    tableId,
    schedules,
    index,
    setSchedulesMap,
  }: IndividualScheduleTableProps) => {
    const { setSearchInfo } = useSearchStore();
    const dndContext = useDndContext();

    const handleScheduleTimeClick = useCallback(
      (tableId: string, timeInfo: { day: string; time: number }) => {
        setSearchInfo({ tableId, ...timeInfo });
      },
      [setSearchInfo]
    );

    const handleScheduleDeleteClick = useCallback(
      (tableId: string, { day, time }: { day: string; time: number }) => {
        setSchedulesMap((prev: Record<string, Schedule[]>) => ({
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
            setSchedulesMap={setSchedulesMap}
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
          dndContext={dndContext}
        />
      </Stack>
    );
  }
);

export default IndividualScheduleTable;
