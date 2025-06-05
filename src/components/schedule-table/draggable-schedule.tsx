import { CellSize, DAY_LABELS } from "@/config/constants";
import { Schedule } from "@/types";
import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ComponentProps, memo, useState } from "react";

// DraggableSchedule memo 사용
type DraggableScheduleProps = { id: string; data: Schedule } & ComponentProps<typeof Box> & {
    onDeleteButtonClick: () => void;
  };
export const DraggableSchedule = memo(({ id, data, bg, onDeleteButtonClick, ...props }: DraggableScheduleProps) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
  const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
  const topIndex = range[0] - 1;
  const size = range.length;
  const [isOpen, setIsOpen] = useState(false);

  const Cell = (
    <Box
      position="absolute"
      left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
      top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
      width={CellSize.WIDTH - 1 + "px"}
      height={CellSize.HEIGHT * size - 1 + "px"}
      bg={bg}
      p={1}
      boxSizing="border-box"
      cursor="pointer"
      ref={setNodeRef}
      transform={CSS.Translate.toString(transform)}
      onClick={() => setIsOpen((p) => !p)}
      {...listeners}
      {...attributes}
      {...props}
    >
      <Text fontSize="sm" fontWeight="bold">
        {lecture.title}
      </Text>
      <Text fontSize="xs">{room}</Text>
    </Box>
  );
  if (!isOpen) return Cell;
  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger>{Cell}</PopoverTrigger>
      <PopoverContent onClick={(event) => event.stopPropagation()} onMouseLeave={() => setIsOpen(false)}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
