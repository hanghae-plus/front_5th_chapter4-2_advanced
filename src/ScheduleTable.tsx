import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "./constants.ts";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Fragment, memo, useMemo } from "react";
import { fill2, parseHnM } from "./utils.ts";
import { Schedule } from "./types.ts";

interface Props {
  tableId: string;
  activeTableId: string | null;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTable = ({
  tableId,
  activeTableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: Props) => {
  const times = useMemo(() => {
    const base = Array.from({ length: 18 }, (_, i) => i * 30 * 분).map(
      (v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`
    );
    const extra = Array.from(
      { length: 6 },
      (_, i) => (18 * 30 + i * 55) * 분
    ).map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`);
    return [...base, ...extra] as const;
  }, []);

  const getColor = (lectureId: string): string => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return colors[lectures.indexOf(lectureId) % colors.length];
  };

  const isActive = useMemo(
    () => activeTableId === tableId,
    [activeTableId, tableId]
  );

  return (
    <Box
      position="relative"
      outline={isActive ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      <Grid
        templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
        templateRows={`40px repeat(${times.length}, ${CellSize.HEIGHT}px)`}
        bg="white"
        fontSize="sm"
        textAlign="center"
        outline="1px solid"
        outlineColor="gray.300"
      >
        <ScheduleHeader />
        <ScheduleBody times={times} onClick={onScheduleTimeClick} />
      </Grid>

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          onDeleteButtonClick={() =>
            onDeleteButtonClick?.({
              day: schedule.day,
              time: schedule.range[0],
            })
          }
        />
      ))}
    </Box>
  );
};

const ScheduleHeader = () => (
  <>
    <GridItem bg="gray.100" borderColor="gray.300">
      <Flex justifyContent="center" alignItems="center" h="full" w="full">
        <Text fontWeight="bold">교시</Text>
      </Flex>
    </GridItem>
    {DAY_LABELS.map((day) => (
      <GridItem key={day} bg="gray.100" borderLeft="1px" borderColor="gray.300">
        <Flex justifyContent="center" alignItems="center" h="full">
          <Text fontWeight="bold">{day}</Text>
        </Flex>
      </GridItem>
    ))}
  </>
);

const ScheduleBody = ({
  times,
  onClick,
}: {
  times: readonly string[];
  onClick?: (timeInfo: { day: string; time: number }) => void;
}) => (
  <>
    {times.map((time, i) => (
      <Fragment key={`row-${i}`}>
        <GridItem
          borderTop="1px solid"
          borderColor="gray.300"
          bg={i > 17 ? "gray.200" : "gray.100"}
        >
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontSize="xs">{`${fill2(i + 1)} (${time})`}</Text>
          </Flex>
        </GridItem>
        {DAY_LABELS.map((day) => (
          <GridItem
            key={`${day}-${i}`}
            borderWidth="1px 0 0 1px"
            borderColor="gray.300"
            bg={i > 17 ? "gray.100" : "white"}
            cursor="pointer"
            _hover={{ bg: "yellow.100" }}
            onClick={() => onClick?.({ day, time: i + 1 })}
          />
        ))}
      </Fragment>
    ))}
  </>
);

const DraggableSchedule = memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
  }: {
    id: string;
    data: Schedule;
    bg: string;
    onDeleteButtonClick: () => void;
  }) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform } = useDraggable({
      id,
    });

    const left =
      120 +
      CellSize.WIDTH * DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]) +
      1;
    const top = 40 + (range[0] - 1) * CellSize.HEIGHT + 1;
    const height = CellSize.HEIGHT * range.length - 1;
    const width = CellSize.WIDTH - 1;

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            ref={setNodeRef}
            transform={CSS.Translate.toString(transform)}
            position="absolute"
            left={`${left}px`}
            top={`${top}px`}
            width={`${width}px`}
            height={`${height}px`}
            bg={bg}
            p={1}
            boxSizing="border-box"
            cursor="pointer"
            {...listeners}
            {...attributes}
          >
            <Text fontSize="sm" fontWeight="bold">
              {lecture.title}
            </Text>
            <Text fontSize="xs">{room}</Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent onClick={(e) => e.stopPropagation()}>
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
  }
);

export default ScheduleTable;
