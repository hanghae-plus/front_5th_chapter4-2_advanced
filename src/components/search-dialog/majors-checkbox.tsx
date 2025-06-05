import { DialogChildProps } from "@/types";
import { CheckboxGroup, FormControl, FormLabel, Tag, TagCloseButton, TagLabel, Wrap } from "@chakra-ui/react";
import { memo } from "react";
import { AllMajorsCheckbox } from "./all-majors-checkbox";

export const MajorsCheckbox = memo(
  ({ searchOptions, changeSearchOption, allMajors }: DialogChildProps & { allMajors: string[] }) => {
    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={searchOptions.majors}
          onChange={(values) => changeSearchOption("majors", values as string[])}
        >
          <Wrap spacing={1} mb={2}>
            {searchOptions.majors.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split("<p>").pop()}</TagLabel>
                <TagCloseButton
                  onClick={() =>
                    changeSearchOption(
                      "majors",
                      searchOptions.majors.filter((v) => v !== major)
                    )
                  }
                />
              </Tag>
            ))}
          </Wrap>
          <AllMajorsCheckbox allMajors={allMajors} />
        </CheckboxGroup>
      </FormControl>
    );
  }
);
