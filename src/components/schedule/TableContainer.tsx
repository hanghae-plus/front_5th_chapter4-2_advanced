import React from "react";
import { Box } from "@chakra-ui/react";

interface TableContainerProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const TableContainer = React.memo(
  ({ isActive, children }: TableContainerProps) => {
    return (
      <Box
        position="relative"
        outline={isActive ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        {children}
      </Box>
    );
  }
);
