import React, { memo, useCallback } from "react"
import { Box, Checkbox } from "@chakra-ui/react"

// 시간 슬롯 체크박스 컴포넌트 - 개별 체크박스의 불필요한 리렌더링 방지
const TimeSlotCheckbox = memo(
	({
		timeSlot,
		isChecked,
		onToggle,
	}: {
		timeSlot: { id: number; label: string }
		isChecked: boolean
		onToggle: (id: number, checked: boolean) => void
	}) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onToggle(timeSlot.id, e.target.checked)
			},
			[timeSlot.id, onToggle]
		)

		return (
			<Box key={timeSlot.id}>
				<Checkbox size="sm" isChecked={isChecked} onChange={handleChange}>
					{timeSlot.id}교시({timeSlot.label})
				</Checkbox>
			</Box>
		)
	}
)

export default TimeSlotCheckbox
