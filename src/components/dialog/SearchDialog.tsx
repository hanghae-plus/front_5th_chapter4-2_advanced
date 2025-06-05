import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Props } from "@/components/dialog/types";
import SearchFilters from "./SearchFilters";
import LectureTable from "./LectureTable";
import { useSearchDialog } from "@/hooks/useSearchDialog";

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const {
    // 데이터
    allMajors,
    filteredLectures,
    visibleLectures,

    // 상태
    searchOptions,

    // 핸들러
    handleSearchOptionChange,
    addSchedule,

    // refs
    loaderRef,
    loaderWrapperRef,
  } = useSearchDialog(searchInfo, onClose);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SearchFilters
              searchOptions={searchOptions}
              allMajors={allMajors}
              onSearchOptionChange={handleSearchOptionChange}
            />
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <LectureTable
              visibleLectures={visibleLectures}
              onAddSchedule={addSchedule}
              loaderRef={loaderRef}
              ref={loaderWrapperRef}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
