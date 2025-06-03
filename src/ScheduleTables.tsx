import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable";
import { useSchedulesData, useScheduleActions } from "./ScheduleContext";
import SearchDialog from "./SearchDialog";
import { useState } from "react";
import { Schedule } from "./types";

export const ScheduleTables = () => {
  const schedulesMap = useSchedulesData();
  const actions = useScheduleActions();

  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length <= 1;

  const duplicate = (targetId: string) => {
    const copiedScheduleItem = schedulesMap[targetId];
    if (copiedScheduleItem) {
      const newTableId = `schedule-${Date.now()}`;
      actions.updateScheduleList(newTableId, [...copiedScheduleItem]);
    }
  };

  const remove = (targetId: string) => {
    actions.removeScheduleTable(targetId);
  };

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">시간표 {index + 1}</Heading>
              <ButtonGroup size="sm" isAttached>
                <Button colorScheme="green" onClick={() => setSearchInfo({ tableId })}>시간표 추가</Button>
                <Button colorScheme="green" mx="1px" onClick={() => duplicate(tableId)}>복제</Button>
                <Button colorScheme="green" isDisabled={disabledRemoveButton}
                        onClick={() => remove(tableId)}>삭제</Button>
              </ButtonGroup>
            </Flex>
            <ScheduleTable
              key={`schedule-table-${index}`}
              schedules={schedules}
              tableId={tableId}
              onScheduleTimeClick={(timeInfo) => setSearchInfo({ tableId, ...timeInfo })}
              onDeleteButtonClick={({ day, time }) => {
                const target = schedulesMap[tableId];
                if (target) {
                  const newList = target.filter(schedule => schedule.day !== day || !schedule.range.includes(time));
                  actions.updateScheduleList(tableId, newList);
                }
              }}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
}
