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
} from "@chakra-ui/react"
import { CellSize, DAY_LABELS, 분 } from "./constants.ts"
import { Schedule } from "./types.ts"
import { fill2, parseHnM } from "./utils.ts"
import { useDndContext, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { ComponentProps, Fragment, memo, useCallback, useMemo } from "react"

interface Props {
	tableId: string
	schedules: Schedule[]
	onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void
	onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void
}

// 메모이제이션된 TimeRow 컴포넌트
interface TimeRowProps {
	timeIndex: number
	time: string
	onScheduleTimeClick?: (day: string, time: number) => void
}

const TIMES = [
	...Array(18)
		.fill(0)
		.map((v, k) => v + k * 30 * 분)
		.map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

	...Array(6)
		.fill(18 * 30 * 분)
		.map((v, k) => v + k * 55 * 분)
		.map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const

// 메모이제이션된 Schedule 내부 텍스트 컴포넌트
const ScheduleContent = memo(
	({ title, room }: { title: string; room?: string }) => {
		console.log(`ScheduleContent ${title} 렌더링`, performance.now())
		return (
			<>
				<Text fontSize="sm" fontWeight="bold">
					{title}
				</Text>
				<Text fontSize="xs">{room}</Text>
			</>
		)
	}
)

// 메모이제이션된 ScheduleTableHeader 컴포넌트
const ScheduleTableHeader = memo(() => {
	return (
		<>
			<GridItem key="교시" borderColor="gray.300" bg="gray.100">
				<Flex justifyContent="center" alignItems="center" h="full" w="full">
					<Text fontWeight="bold">교시</Text>
				</Flex>
			</GridItem>
			{DAY_LABELS.map((day) => (
				<GridItem
					key={day}
					borderLeft="1px"
					borderColor="gray.300"
					bg="gray.100"
				>
					<Flex justifyContent="center" alignItems="center" h="full">
						<Text fontWeight="bold">{day}</Text>
					</Flex>
				</GridItem>
			))}
		</>
	)
})

// 테이블 그리드를 담당하는 컴포넌트를 분리하여 메모이제이션
const TableGrid = memo(
	({ onTimeClick }: { onTimeClick: (day: string, time: number) => void }) => {
		console.log("TableGrid 렌더링", performance.now())

		return (
			<Grid
				templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
				templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
				bg="white"
				fontSize="sm"
				textAlign="center"
				outline="1px solid"
				outlineColor="gray.300"
			>
				<ScheduleTableHeader />

				{TIMES.map((time, timeIndex) => (
					<TimeRow
						key={`time-row-${timeIndex}`}
						timeIndex={timeIndex}
						time={time}
						onScheduleTimeClick={onTimeClick}
					/>
				))}
			</Grid>
		)
	}
)

const TimeRow = memo(
	({ timeIndex, time, onScheduleTimeClick }: TimeRowProps) => {
		return (
			<Fragment key={`시간-${timeIndex + 1}`}>
				<GridItem
					borderTop="1px solid"
					borderColor="gray.300"
					bg={timeIndex > 17 ? "gray.200" : "gray.100"}
				>
					<Flex justifyContent="center" alignItems="center" h="full">
						<Text fontSize="xs">
							{fill2(timeIndex + 1)} ({time})
						</Text>
					</Flex>
				</GridItem>
				{DAY_LABELS.map((day) => (
					<GridItem
						key={`${day}-${timeIndex + 2}`}
						borderWidth="1px 0 0 1px"
						borderColor="gray.300"
						bg={timeIndex > 17 ? "gray.100" : "white"}
						cursor="pointer"
						_hover={{ bg: "yellow.100" }}
						onClick={() => onScheduleTimeClick?.(day, timeIndex + 1)}
					/>
				))}
			</Fragment>
		)
	}
)

// 테이블 외부 컨테이너 컴포넌트도 분리
const TableContainer = memo(
	({
		isActive,
		children,
	}: {
		tableId: string
		isActive: boolean
		children: React.ReactNode
	}) => {
		console.log("TableContainer 렌더링", performance.now())

		return (
			<Box
				position="relative"
				outline={isActive ? "5px dashed" : undefined}
				outlineColor="blue.300"
			>
				{children}
			</Box>
		)
	}
)

/**
 * ScheduleTable - 시간표 테이블 컴포넌트
 * @param tableId - 테이블 ID
 * @param schedules - 스케줄 목록
 * @param onScheduleTimeClick - 시간 슬롯 클릭 핸들러
 * @param onDeleteButtonClick - 삭제 버튼 클릭 핸들러
 * @returns
 * @description
 * 이 컴포넌트는 시간표를 렌더링하고, 드래그 앤 드롭 기능을 지원합니다.
 * 각 시간 슬롯을 클릭하면 해당 시간 정보를 상위 컴포넌트로 전달합니다.
 * 또한, 각 스케줄 항목은 드래그 가능하며, 삭제 버튼을 클릭하면 해당 스케줄을 삭제할 수 있습니다.
 * 드래그 앤 드롭 기능은 DnD Kit을 사용하여 구현되었습니다.
 * 각 스케줄 항목은 고유한 색상을 가지며, 이를 통해 시각적으로 구분할 수 있습니다.
 * 메모이제이션을 통해 불필요한 리렌더링을 방지하고 성능을 최적화합니다.
 */
const ScheduleTable = memo(
	({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
		const dndContext = useDndContext()

		// 메모이제이션된 색상 생성 함수
		const getColor = useCallback(
			(lectureId: string): string => {
				const lectures = [
					...new Set(schedules.map(({ lecture }) => lecture.id)),
				]
				const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"]
				return colors[lectures.indexOf(lectureId) % colors.length]
			},
			[schedules]
		)

		// 메모이제이션된 현재 활성화된 테이블 ID 추출 함수
		const activeTableId = useMemo(() => {
			const activeId = dndContext.active?.id
			if (activeId) {
				return String(activeId).split(":")[0]
			}
			return null
		}, [dndContext.active?.id])

		// 시간 슬롯 클릭 핸들러
		const handleTimeClick = useCallback(
			(day: string, time: number) => {
				onScheduleTimeClick?.({ day, time })
			},
			[onScheduleTimeClick]
		)

		// 스케줄 목록 메모이제이션
		const scheduleComponents = useMemo(() => {
			return schedules.map((schedule, index) => (
				<DraggableSchedule
					key={`${schedule.lecture.id}-${index}`}
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
			))
		}, [schedules, tableId, getColor, onDeleteButtonClick])

		// 테이블 그리드는 메모이제이션된 컴포넌트 사용
		return (
			<TableContainer tableId={tableId} isActive={activeTableId === tableId}>
				<TableGrid onTimeClick={handleTimeClick} />
				{scheduleComponents}
			</TableContainer>
		)
	}
)
/**
 * DraggableSchedule - 드래그 가능한 스케줄 컴포넌트 메모이제이션 완료
 * @param id - 드래그 ID
 * @param data - 스케줄 데이터
 * @param bg - 배경색
 * @param onDeleteButtonClick - 삭제 버튼 클릭 핸들러
 * @returns
 */
const DraggableSchedule = memo(
	({
		id,
		data,
		bg,
		onDeleteButtonClick,
	}: { id: string; data: Schedule } & ComponentProps<typeof Box> & {
			onDeleteButtonClick: () => void
		}) => {
		const { day, range, room, lecture } = data
		const { attributes, setNodeRef, listeners, transform, isDragging } =
			useDraggable({
				id,
			})
		const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number])
		const topIndex = range[0] - 1
		const size = range.length

		// 위치 스타일 메모이 제이션
		const positionStyle = useMemo(
			() => ({
				position: "absolute" as const,
				left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
				top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
				width: CellSize.WIDTH - 1 + "px",
				height: CellSize.HEIGHT * size - 1 + "px",
				backgroundColor: bg,
				padding: "4px",
				boxSizing: "border-box" as const,
				cursor: "pointer",
				zIndex: isDragging ? 10 : 1,
			}),
			[leftIndex, topIndex, size, bg, isDragging]
		)

		// 변환 스타일을 별도로 관리
		const transformStyle = useMemo(
			() => CSS.Translate.toString(transform),
			[transform]
		)

		// 내용 메모이제이션
		const content = useMemo(
			() => <ScheduleContent title={lecture.title} room={room} />,
			[lecture.title, room]
		)

		return (
			<Popover>
				<PopoverTrigger>
					<Box
						ref={setNodeRef}
						{...positionStyle}
						transform={transformStyle}
						{...listeners}
						{...attributes}
					>
						{content}
					</Box>
				</PopoverTrigger>
				<PopoverContent onClick={(event) => event.stopPropagation()}>
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
		)
	}
)

export default ScheduleTable
