import { VStack } from "@chakra-ui/react";
import DiagnosticItem from "./DiagnosticItem";

export default function DiagnosticList(props) {
  return (
    <VStack width={"3xl"} alignItems={"center"} spacing={6}  >
      {props.diagnostics.map((diagnostico) => (
        <DiagnosticItem key={diagnostico.slug} data={diagnostico} onClick={props.onClick} />
      ))}
    </VStack>
  );
}
