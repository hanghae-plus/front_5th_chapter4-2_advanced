import { memo, useCallback, useState, useEffect, useRef } from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

interface SearchInputProps {
  query?: string;
  idPrefix: string;
  onQueryChange: (query: string) => void;
}

// 검색 인풋 컴포넌트 - 타이핑 시 이 컴포넌트만 리렌더링됨
const SearchInput = memo(({ query, idPrefix, onQueryChange }: SearchInputProps) => {
  // 디바운스를 위한 로컬 상태
  const [localQuery, setLocalQuery] = useState(query || "");
  const debounceRef = useRef<NodeJS.Timeout>();

  // 외부 query가 변경되면 로컬 상태도 동기화
  useEffect(() => {
    setLocalQuery(query || "");
  }, [query]);

  // 디바운스된 검색 핸들러
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);

      // 이전 타이머 클리어
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 300ms 후에 실제 검색 실행
      debounceRef.current = setTimeout(() => {
        onQueryChange(value);
      }, 300);
    },
    [onQueryChange]
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <FormControl>
      <FormLabel htmlFor={`${idPrefix}-query`}>검색어</FormLabel>
      <Input
        id={`${idPrefix}-query`}
        placeholder="과목명 또는 과목코드"
        value={localQuery}
        onChange={handleQueryChange}
      />
    </FormControl>
  );
});

SearchInput.displayName = "SearchInput";

export default SearchInput;
