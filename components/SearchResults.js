import { useRef } from "react";
import {
  AlertDialogFooter,
  Button,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import DiagnosticList from "./DiagnosticList";

export default function SearchResults({
  searchString = "",
  handleSetSearchString,
  results = [],
}) {
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: searchString.length > 0,
  });
  const cancelRef = useRef();

  const handleClose = () => {
    handleSetSearchString({ target: { value: "" } });
    onClose();
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={handleClose}
      size={{
        base: "20rem",
        sm: "3xl",
      }}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Resultado Búsqueda
          </AlertDialogHeader>

          <AlertDialogBody as={VStack} spacing={6}>
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

            <DiagnosticList diagnostics={results} onClick={handleClose} />
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleClose}>
              Cerrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
