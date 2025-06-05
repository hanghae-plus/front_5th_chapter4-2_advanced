/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	DndContext,
	Modifier,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { PropsWithChildren, useCallback } from "react"
import { CellSize, DAY_LABELS } from "./constants.ts"
import { useScheduleContext } from "./ScheduleContext.tsx"

/**
 * createSnapModifier - Creates a modifier to snap the dragged item to a grid.
 * @returns
 */
function createSnapModifier(): Modifier {
	return ({ transform, containerNodeRect, draggingNodeRect }) => {
		const containerTop = containerNodeRect?.top ?? 0
		const containerLeft = containerNodeRect?.left ?? 0
		const containerBottom = containerNodeRect?.bottom ?? 0
		const containerRight = containerNodeRect?.right ?? 0

		const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {}

		const minX = containerLeft - left + 120 + 1
		const minY = containerTop - top + 40 + 1
		const maxX = containerRight - right
		const maxY = containerBottom - bottom

		return {
			...transform,
			x: Math.min(
				Math.max(
					Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
					minX
				),
				maxX
			),
			y: Math.min(
				Math.max(
					Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
					minY
				),
				maxY
			),
		}
	}
}

const modifiers = [createSnapModifier()]

/**
 * useDndContextValue - Hook to provide DnD context value for schedules.
 * @returns
 */
export const useDndContextValue = () => {
	const { setSchedulesMap } = useScheduleContext()
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleDragEnd = useCallback(
		(event: { active: any; delta: any }) => {
			const { active, delta } = event
			const { x, y } = delta
			const [tableId, index] = active.id.split(":")

			// 현재 드래그 중인 스케줄의 인덱스와 테이블 ID를 가져옴
			setSchedulesMap((prevSchedulesMap) => {
				const schedule = prevSchedulesMap[tableId][index]
				const nowDayIndex = DAY_LABELS.indexOf(
					schedule.day as (typeof DAY_LABELS)[number]
				)
				const moveDayIndex = Math.floor(x / 80)
				const moveTimeIndex = Math.floor(y / 30)

				// 현재 요일 인덱스와 이동한 요일 인덱스를 계산하여 새로운 요일을 결정
				const updatedSchedules = [...prevSchedulesMap[tableId]]
				updatedSchedules[index] = {
					...schedule,
					day: DAY_LABELS[nowDayIndex + moveDayIndex],
					range: schedule.range.map((time) => time + moveTimeIndex),
				}

				return {
					...prevSchedulesMap,
					[tableId]: updatedSchedules,
				}
			})
		},
		[setSchedulesMap]
	)

	return { sensors, handleDragEnd, modifiers }
}

/**
 * ScheduleDndProvider - Context provider for drag-and-drop functionality in schedules.
 * @param param0
 * @returns
 */
export default function ScheduleDndProvider({ children }: PropsWithChildren) {
	const { sensors, handleDragEnd, modifiers } = useDndContextValue()

	return (
		<DndContext
			sensors={sensors}
			onDragEnd={handleDragEnd}
			modifiers={modifiers}
		>
			{children}
		</DndContext>
	)
}
