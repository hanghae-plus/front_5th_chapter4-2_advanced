import { memo, useCallback } from "react"
import { Button, Td, Tr } from "@chakra-ui/react"
import { Lecture } from "../types.ts"

interface LectureRowProps {
	lecture: Lecture
	index: number
	onAddSchedule: (lecture: Lecture) => void
}

// 강의 행 컴포넌트 - 개별 행의 불필요한 리렌더링 방지
const LectureRow = memo(
	({ lecture, index, onAddSchedule }: LectureRowProps) => {
		const handleAddClick = useCallback(() => {
			onAddSchedule(lecture)
		}, [lecture, onAddSchedule])

		return (
			<Tr key={`${lecture.id}-${index}`}>
				<Td width="100px">{lecture.id}</Td>
				<Td width="50px">{lecture.grade}</Td>
				<Td width="200px">{lecture.title}</Td>
				<Td width="50px">{lecture.credits}</Td>
				<Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
				<Td
					width="150px"
					dangerouslySetInnerHTML={{ __html: lecture.schedule }}
				/>
				<Td width="80px">
					<Button size="sm" colorScheme="green" onClick={handleAddClick}>
						추가
					</Button>
				</Td>
			</Tr>
		)
	}
)

LectureRow.displayName = "LectureRow"

export default LectureRow
