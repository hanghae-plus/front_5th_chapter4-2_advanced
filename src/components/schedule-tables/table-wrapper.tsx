import { useLocalScheduleContext } from "@/hooks/use-local-schedule-context";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { memo, ReactNode } from "react";

type TableWrapperProps = {
  index: number;
  isDeletable: boolean;
  children: ReactNode;
};
export const TableWrapper = memo(({ index, isDeletable, children }: TableWrapperProps) => {
  const { handleAddClick, handleDuplicateClick, handleDeleteClick } = useLocalScheduleContext();
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
      {children}
    </Stack>
  );
});
