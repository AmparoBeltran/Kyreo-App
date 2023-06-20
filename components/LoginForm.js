import { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Box,
} from "@chakra-ui/react";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(errorMessage);
      });
  }
  return (
    <VStack>
      <FormControl color="white">
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
      </FormControl>
      <FormControl color="white">
        <FormLabel>Contraseña</FormLabel>
        <Input
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          value={password}
        />
      </FormControl>
      <Box>
        <Button
          onClick={login}
          width={20}
          height={20}
          rounded={"full"}
          bgColor={"white"}
          color={"var(--color-background-logo)"}
          marginTop={4}
        >
          Login
        </Button>
      </Box>
    </VStack>
  );
}
