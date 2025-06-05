import { GridItem, Flex, Text } from '@chakra-ui/react';
import { DAY_LABELS } from '../constants';
import { Fragment, memo } from 'react';
import { fill2 } from '../utils';

interface Props {
  time: string;
  timeIndex: number;
  onTimeClick: (day: string, time: number) => void;
}

const TableRow = memo(({ time, timeIndex, onTimeClick }: Props) => {
  return (
    <Fragment key={`시간-${timeIndex + 1}`}>
      <GridItem
        borderTop="1px solid"
        borderColor="gray.300"
        bg={timeIndex > 17 ? 'gray.200' : 'gray.100'}
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
          bg={timeIndex > 17 ? 'gray.100' : 'white'}
          cursor="pointer"
          _hover={{ bg: 'yellow.100' }}
          onClick={() => onTimeClick(day, timeIndex + 1)}
        />
      ))}
    </Fragment>
  );
});

export default TableRow;
