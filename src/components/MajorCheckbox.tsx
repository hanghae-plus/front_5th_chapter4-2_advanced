import { Box, Checkbox } from "@chakra-ui/react"
import { memo, useCallback } from "react"

// 전공 체크박스 컴포넌트 - 개별 체크박스의 불필요한 리렌더링 방지
const MajorCheckbox = memo(
	({
		major,
		isChecked,
		onToggle,
	}: {
		major: string
		isChecked: boolean
		onToggle: (major: string, checked: boolean) => void
	}) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onToggle(major, e.target.checked)
			},
			[major, onToggle]
		)

		return (
			<Box key={major}>
				<Checkbox size="sm" isChecked={isChecked} onChange={handleChange}>
					{major.replace(/<p>/gi, " ")}
				</Checkbox>
			</Box>
		)
	}
)

export default MajorCheckbox
