import { createContext, PropsWithChildren, useContext, useState } from "react";

interface DndActiveContextType {
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
}

const DndActiveIdContext = createContext<DndActiveContextType | undefined>(
  undefined
);

export const useDndActiveIdContext = () => {
  const context = useContext(DndActiveIdContext);
  if (context === undefined) {
    throw new Error(
      "useDndActiveIdContext must be used withn a DndActiveIdContext Provider"
    );
  }
  return context;
};

export const DndActiveIdProvider = ({ children }: PropsWithChildren) => {
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  return (
    <DndActiveIdContext.Provider value={{ activeTableId, setActiveTableId }}>
      {children}
    </DndActiveIdContext.Provider>
  );
};
