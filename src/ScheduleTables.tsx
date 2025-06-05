import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { memo, useMemo, useState } from "react";
import { LocalScheduleProvider, useScheduleContext } from "./ScheduleContext.tsx";
import ScheduleTable from "./ScheduleTable.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { DayTime, Schedule } from "./types.ts";

export const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const scheduleTableList = useMemo(() => Object.entries(schedulesMap), [schedulesMap]);

  const disabledRemoveButton = useMemo(() => Object.keys(schedulesMap).length === 1, [schedulesMap]);

  // activeTableId는 tables 중 table 선택임으로 상위로 이동
  const dndContext = useDndContext();

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(
    () =>
      scheduleTableList.map(
        ([tableId]) =>
          ({
            handleAddClick: () => setSearchInfo({ tableId }),
            handleDuplicateClick: () =>
              setSchedulesMap((prev) => ({
                ...prev,
                [`schedule-${Date.now()}`]: [...prev[tableId]],
              })),
            handleDeleteClick: () =>
              setSchedulesMap((prev) => {
                const newMap = { ...prev };
                delete newMap[tableId];
                return newMap;
              }),
            handleScheduleTimeClick: (timeInfo: DayTime) => setSearchInfo({ tableId, ...timeInfo }),
            handleDeleteButtonClick: ({ day, time }: DayTime) =>
              setSchedulesMap((prev) => ({
                ...prev,
                [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
              })),
          } as const)
      ),
    [setSchedulesMap, scheduleTableList]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleTableList.map(([tableId, schedules], index) => (
          <TableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            schedules={schedules}
            isDeletable={disabledRemoveButton}
            isActive={tableId === activeTableId}
            {...handlers[index]}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};

type TableWrapperProps = {
  tableId: string;
  index: number;
  schedules: Schedule[];
  isDeletable: boolean;
  isActive: boolean;
  handleAddClick: () => void;
  handleDuplicateClick: () => void;
  handleDeleteClick: () => void;
  handleScheduleTimeClick: (timeInfo: DayTime) => void;
  handleDeleteButtonClick: (timeInfo: DayTime) => void;
};
const TableWrapper = memo(
  ({
    tableId,
    index,
    schedules,
    isDeletable,
    isActive,
    handleAddClick,
    handleDuplicateClick,
    handleDeleteClick,
    handleScheduleTimeClick,
    handleDeleteButtonClick,
  }: TableWrapperProps) => {
    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleAddClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicateClick}>
              복제
            </Button>
            <Button colorScheme="green" isDisabled={isDeletable} onClick={handleDeleteClick}>
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <LocalScheduleProvider // table 별 Local Context API 로 재할당
          tableId={tableId}
          schedules={schedules}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        >
          <ScheduleTable key={`schedule-table-${index}`} isActive={isActive} />
        </LocalScheduleProvider>
      </Stack>
    );
  }
);
