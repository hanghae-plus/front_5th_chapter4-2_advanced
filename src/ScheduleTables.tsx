import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTableWithContext from "./ScheduleTableWithContext.tsx";
import { useScheduleDispatch, useScheduleState } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useState } from "react";

export const ScheduleTables = () => {
  const schedulesMap = useScheduleState();
  const { duplicateTable, removeTable } = useScheduleDispatch();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback(
    (targetId: string) => {
      duplicateTable(targetId);
    },
    [duplicateTable],
  );

  const remove = useCallback(
    (targetId: string) => {
      removeTable(targetId);
    },
    [removeTable],
  );

  const handleScheduleTimeClick = useCallback(
    (tableId: string) => (timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    [],
  );

  return (
    <>
      <Flex
        w="full"
        gap={6}
        p={6}
        flexWrap="wrap"
      >
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack
            key={tableId}
            width="600px"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
            >
              <Heading
                as="h3"
                fontSize="lg"
              >
                시간표 {index + 1}
              </Heading>
              <ButtonGroup
                size="sm"
                isAttached
              >
                <Button
                  colorScheme="green"
                  onClick={() => setSearchInfo({ tableId })}
                >
                  시간표 추가
                </Button>
                <Button
                  colorScheme="green"
                  mx="1px"
                  onClick={() => duplicate(tableId)}
                >
                  복제
                </Button>
                <Button
                  colorScheme="green"
                  isDisabled={disabledRemoveButton}
                  onClick={() => remove(tableId)}
                >
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleTableWithContext
              tableId={tableId}
              schedules={schedules}
              onScheduleTimeClick={handleScheduleTimeClick(tableId)}
            />
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
