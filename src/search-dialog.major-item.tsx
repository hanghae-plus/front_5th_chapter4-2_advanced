import { Box, Checkbox } from "@chakra-ui/react";

interface MajorItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    majors: string[];
    selectedMajors: string[];
  };
}

export const MajorItem = ({ index, style, data }: MajorItemProps) => {
  const { majors, selectedMajors } = data;
  const major = majors[index];
  const isChecked = selectedMajors.includes(major);

  return (
    <Box style={style} px={2} py={2}>
      <Checkbox size="sm" value={major} isChecked={isChecked}>
        {major.replace(/<p>/gi, " ")}
      </Checkbox>
    </Box>
  );
};
