import { Button, HStack, VStack, Stack, useMediaQuery } from "@chakra-ui/react";
import LaboratorioAcupuntura from "../images/LaboratorioAcupuntura";
import Logo from "../icons/Logo";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Login() {
  const [action, setAction] = useState(undefined);

  function displayForm() {
    if (action === undefined) {
      return (
        <>
          <Logo width={100} height={100} />
          <HStack spacing={6}>
            <Button
              onClick={() => setAction("register")}
              width={20}
              height={20}
              rounded={"full"}
              color="white"
              colorScheme={"pink"}
              bgColor={"var(--color-background-logo)"}
            >
              Registro
            </Button>
            <Button
              onClick={() => setAction("login")}
              width={20}
              height={20}
              rounded={"full"}
              bgColor={"white"}
              color={"var(--color-background-logo)"}
            >
              Login
            </Button>
          </HStack>
        </>
      );
    } else if (action === "login") {
      return <LoginForm />;
    } else {
      return <RegisterForm />;
    }
  }
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  return (
    <HStack width="100vw" justifyContent={"center"} bgColor={"#4DA6BA"}>
      <Stack
        direction={{
          base: "column",
          md: "row",
          sm: "column",
        }}
        height={"100vh"}
        spacing={isLargerThan768 ? "24" : "4" }
        justifyContent= "center"
        alignItems="center"

      >
        <LaboratorioAcupuntura
          color="white"
          width={isLargerThan768 ? "30vw" : "50vw"}
        />
        <VStack spacing={12}>{displayForm()}</VStack>
      </Stack>
    </HStack>
  );
}
