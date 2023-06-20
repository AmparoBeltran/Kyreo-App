import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useSearch } from "../lib/hooks";

export default function SearchBar() {
  const { searchString, handleSetSearchString, displayResults } = useSearch();

  return (
    <>
      <InputGroup>
        <InputLeftElement h={8} pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          bgColor="whiteAlpha.900"
          boxShadow="md"
          borderRadius="2xl"
          type="search"
          placeholder="Buscar"
          value={searchString}
          onChange={handleSetSearchString}
          variant={"outline"}
          size="sm"
          maxWidth="sm"
          border="none"
        />
      </InputGroup>
      {displayResults()}
    </>
  );
}
