import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useMemo, useState, useCallback, memo } from "react";
import { useDndContext } from "@dnd-kit/core";
import { ScheduleTableContextProvider } from "./ScheduleTableContext.tsx";

interface TableActionsProps {
  tableId: string;
  index: number;
  onAdd: (tableId: string) => void;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
  disabledRemove: boolean;
}

const TableActions = memo(
  ({
    tableId,
    index,
    onAdd,
    onDuplicate,
    onRemove,
    disabledRemove,
  }: TableActionsProps) => {
    return (
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h3" fontSize="lg">
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size="sm" isAttached>
          <Button colorScheme="green" onClick={() => onAdd(tableId)}>
            시간표 추가
          </Button>
          <Button
            colorScheme="green"
            mx="1px"
            onClick={() => onDuplicate(tableId)}
          >
            복제
          </Button>
          <Button
            colorScheme="green"
            isDisabled={disabledRemove}
            onClick={() => onRemove(tableId)}
          >
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
    );
  }
);

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap]
  );

  const remove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap]
  );

  const handleAdd = useCallback((tableId: string) => {
    setSearchInfo({ tableId });
  }, []);

  const dndContext = useDndContext();
  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  const schedulesEntries = useMemo(
    () => Object.entries(schedulesMap),
    [schedulesMap]
  );

  const handleScheduleTimeClick = useCallback(
    (tableId: string) => (timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    []
  );

  const handleDeleteButtonClick = useCallback(
    (tableId: string) =>
      ({ day, time }: { day: string; time: number }) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].filter(
            (schedule) => schedule.day !== day || !schedule.range.includes(time)
          ),
        }));
      },
    [setSchedulesMap]
  );

  const scheduleHandlers = useMemo(() => {
    return schedulesEntries.map(([tableId]) => ({
      handleScheduleTimeClick: handleScheduleTimeClick(tableId),
      handleDeleteButtonClick: handleDeleteButtonClick(tableId),
    }));
  }, [schedulesEntries, handleScheduleTimeClick, handleDeleteButtonClick]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {schedulesEntries.map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <TableActions
              tableId={tableId}
              index={index}
              onAdd={handleAdd}
              onDuplicate={duplicate}
              onRemove={remove}
              disabledRemove={disabledRemoveButton}
            />
            <ScheduleTableContextProvider schedules={schedules}>
              <ScheduleTable
                key={`schedule-table-${index}`}
                tableId={tableId}
                activeOutline={activeTableId === tableId}
                onScheduleTimeClick={
                  scheduleHandlers[index].handleScheduleTimeClick
                }
                onDeleteButtonClick={
                  scheduleHandlers[index].handleDeleteButtonClick
                }
              />
            </ScheduleTableContextProvider>
          </Stack>
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
};
