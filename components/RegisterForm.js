import { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Box,
  FormErrorMessage,
} from "@chakra-ui/react";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";

import { firestore } from '../lib/firebase';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export default function RegisterForm() {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userNameTaken, setUserNameTaken] = useState(false);
  const [emailIsInvalid, setEmailIsInvalid] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);

  async function registerUser() {
    const auth = getAuth();

    if (userNameTaken && usuario.length < 3) {
      return;
    }

    if (emailIsInvalid) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsDontMatch(true);
      return;
    } else {
      setPasswordsDontMatch(false);
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        updateProfile(auth.currentUser, {
          displayName: usuario,
        })
          .then(async () => {
            const usernameDoc = firestore.doc(`usernames/${usuario}`);
            // Commit both docs together as a batch write.
            const batch = firestore.batch();
            batch.set(usernameDoc, { uid: user.uid });

            await batch.commit();
          })
          .catch((error) => {
            const errorMessage = error.message;
            toast.error(errorMessage);
          });
      })
      .catch((error) => {
        const errorMessage = error.message;
        toast.error(errorMessage);

      });
  }

  const checkEmail = () => {
    if (!validateEmail(email)) {
      setEmailIsInvalid(true);
    } else {
      setEmailIsInvalid(false);
    }
  };

  useEffect(() => {
    debounce(async (usuario) => {
      if (usuario.length >= 3) {
        const ref = firestore.doc(`usernames/${usuario}`);
        const { exists } = await ref.get();
        console.log("Firestore read executed!");
        setUserNameTaken(exists);
      }
    }, 500);
  }, [usuario]);

  return (
    <VStack>
      <FormControl color="white" isInvalid={userNameTaken}>
        <FormLabel>Nombre de Usuario</FormLabel>
        <Input
          onChange={(event) => setUsuario(event.target.value)}
          value={usuario}
        />
        {userNameTaken && (
          <FormErrorMessage>El nombre de usuario ya existe.</FormErrorMessage>
        )}
      </FormControl>
      <FormControl color="white" isInvalid={emailIsInvalid}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          onBlur={checkEmail}
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
        {emailIsInvalid && (
          <FormErrorMessage>
            Introduce una dirección de email valida.
          </FormErrorMessage>
        )}
      </FormControl>
      <FormControl color="white">
        <FormLabel>Contraseña</FormLabel>
        <Input
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          value={password}
        />
      </FormControl>
      <FormControl color="white" isInvalid={passwordsDontMatch}>
        <FormLabel>Confirmar contraseña</FormLabel>
        <Input
          type="password"
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (password !== event.target.value) {
              setPasswordsDontMatch(true);
              return;
            } else {
              setPasswordsDontMatch(false);
            }
          }}
          value={confirmPassword}
        />
        {passwordsDontMatch && (
          <FormErrorMessage>La contraseña no coincide.</FormErrorMessage>
        )}
      </FormControl>
      <Box>
        <Button
          onClick={registerUser}
          width={20}
          height={20}
          rounded={"full"}
          color="white"
          colorScheme={"pink"}
          marginTop={4}
          bgColor={"var(--color-background-logo)"}
        >
          Registro
        </Button>
      </Box>
    </VStack>
  );
}
