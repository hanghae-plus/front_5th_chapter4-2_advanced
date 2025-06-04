import {
  createContext,
  useCallback,
  useContext,
  useState,
  PropsWithChildren,
} from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useScheduleDispatch } from "./ScheduleContext.tsx";

interface DialogContextType {
  showDeleteDialog: (info: {
    tableId: string;
    day: string;
    time: number;
  }) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const [deleteInfo, setDeleteInfo] = useState<{
    tableId: string;
    day: string;
    time: number;
  } | null>(null);

  const { deleteSchedule } = useScheduleDispatch();

  const showDeleteDialog = useCallback(
    (info: { tableId: string; day: string; time: number }) => {
      setDeleteInfo(info);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (deleteInfo) {
      deleteSchedule(deleteInfo.tableId, deleteInfo.day, deleteInfo.time);
      setDeleteInfo(null);
    }
  }, [deleteInfo, deleteSchedule]);

  const handleClose = useCallback(() => {
    setDeleteInfo(null);
  }, []);

  return (
    <DialogContext.Provider value={{ showDeleteDialog }}>
      {children}

      <Modal
        isOpen={!!deleteInfo}
        onClose={handleClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>강의 삭제</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>강의를 삭제하시겠습니까?</Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              colorScheme="red"
              onClick={handleConfirm}
            >
              삭제
            </Button>
            <Button onClick={handleClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DialogContext.Provider>
  );
};
