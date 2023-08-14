import { firestore, auth, serverTimestamp } from "../../lib/firebase";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import { useCollection } from "react-firebase-hooks/firestore";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import {
  Textarea,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  HStack,
  Stack,
  Box,
  Image,
  useMediaQuery,
} from "@chakra-ui/react";

import ImageUpload from "../../components/ImageUpload";
import ArchivoUpload from "../../components/ArchivoUpload";

export default function AdminPostsPage() {
  useEffect(() => {
    document.body.classList.toggle("bg-biblioteca");
    return () => {
      document.body.classList.toggle("bg-biblioteca");
    };
  }, []);

  return <CreateNewPost />;
}

function CreateNewPost() {
  const router = useRouter();
  const username = auth.currentUser.displayName;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");

  const inputRef = useRef(null);
  const archivoRef = useRef(null);

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(titulo));

  // Validate length
  const isValid = titulo.length > 3 && titulo.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("posts")
      .doc(slug);

    const data = {
      slug,
      uid,
      username,
      published: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      titulo,
      foto,
      descripcion,
      archivoUrl,
    };

    await ref.set(data);

    toast.success("Artículo creado!");

    router.push(`/biblioteca/${slug}`);
  };

  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  return (
    <VStack
      as="form"
      height={"full"}
      justifyContent="center"
      onSubmit={createPost}
    >
      <Stack
        bgColor={"whiteAlpha.900"}
        borderRadius="lg"
        boxShadow="md"
        paddingBottom={isLargerThan768 ? "0" : "10"}
        spacing={6}
        direction={{
          base: "column",
          md: "row",
          sm: "column",
        }}
      >
        <Box>
          <Image
            boxSize={isLargerThan768 ? "400px" : "100%"}
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/400"
            alt={"foto articulo"}
            src={foto}
          />
        </Box>
        <VStack
          alignItems={"center"}
          paddingRight={{
            base: 0,
            md: 6,
          }}
        >
          <FormControl
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            width={{
              base: "xs",
              md: "sm",
            }}
            mt={{
              base: "0",
              md: "10",
            }}
          >
            <FormLabel>Título</FormLabel>
            <Input
              onChange={(event) => setTitulo(event.target.value)}
              value={titulo}
              width={{
                base: "xs",
                md: "sm",
              }}
            />
          </FormControl>
          <FormControl
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            width={{
              base: "xs",
              md: "sm",
            }}
            mt="20"
          >
            <FormLabel>Descripción</FormLabel>
            <Textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder=""
              width={{
                base: "xs",
                md: "sm",
              }}
              mb="10"
            />
          </FormControl>
          <Box visibility={"hidden"} height={0}>
            <ImageUpload
              inputRef={inputRef}
              path={"articulos"}
              uid={auth.currentUser.uid}
              setFoto={setFoto}
            />
          </Box>

          <Box visibility={"hidden"} height={0}>
            <ArchivoUpload
              inputRef={archivoRef}
              path={"articulos"}
              uid={auth.currentUser.uid}
              setArchivoUrl={setArchivoUrl}
            />
          </Box>

          <HStack spacing={6}>
            <Button
              size={{
                base: "sm",
                md: "md",
              }}
              colorScheme="teal"
              variant="outline"
              onClick={() => archivoRef.current.click()}
            >
              {archivoUrl === "" ? "Subir PDF" : "PDF guardado"}
            </Button>

            <Button
              size={{
                base: "sm",
                md: "md",
              }}
              colorScheme="teal"
              variant="outline"
              onClick={() => inputRef.current.click()}
            >
              Imagen
            </Button>

            <Button
              size={{
                base: "sm",
                md: "md",
              }}
              colorScheme="teal"
              variant="outline"
              type="submit"
              isDisabled={!isValid}
            >
              Guardar
            </Button>
          </HStack>
        </VStack>
      </Stack>
    </VStack>
  );
}
