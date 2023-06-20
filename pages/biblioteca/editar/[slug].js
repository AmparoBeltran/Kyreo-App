import {
  firestore,
  auth,
  serverTimestamp,
  postToJSON,
} from "../../../lib/firebase";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import {
  collectionGroup,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
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
  Box,
  Image,
} from "@chakra-ui/react";

export default function AdminPostsPage() {
  useEffect(() => {
    document.body.classList.toggle("bg-biblioteca");
    return () => {
      document.body.classList.toggle("bg-biblioteca");
    };
  }, []);

  return (
    <main>
      <CreateNewPost />
    </main>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const username = auth.currentUser.displayName;
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [isAuthor, setIsAuthor] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [foto, setFoto] = useState("");

  useEffect(() => {
    const posts = query(
      collectionGroup(firestore, "posts"),
      where("slug", "==", router.query.slug)
    );

    getDocs(posts).then((posts) => {
      posts.docs.forEach((_post) => {
        const post = postToJSON(_post);
        console.log(post);
        setTitulo(post.titulo);
        setDescripcion(post.descripcion);
        setCreatedAt(post._createdAt);
        setUpdatedAt(post.updatedAt);
        setFoto(post.foto);

        if (post.username === auth.currentUser.displayName) {
          setIsAuthor(true);
        }
      });
    });
  }, [router.query.slug]);

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

    // Tip: give all fields a default value here
    const data = {
      slug,
      uid,
      username,
      published: true,
      createdAt,
      updatedAt: serverTimestamp(),
      titulo,
      descripcion,
    };

    await ref.set(data);

    toast.success("Artículo editado!");

    // Imperative navigation after doc is set
    router.push(`/biblioteca/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <HStack
        bgColor={"whiteAlpha.900"}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        width={"4xl"}
        alignItems="flex-start"
        mx="auto"
      >
        <Box>
          <Image
            boxSize="400px"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/400"
            alt={"foto articulo"}
            src={foto}
          />
        </Box>
        <VStack>
          <FormControl>
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              ml="2"
              width="md"
              mt="20"
            >
              <FormLabel>Título</FormLabel>
              <Input
                onChange={(event) => setTitulo(event.target.value)}
                value={titulo}
              />
            </Box>
          </FormControl>
          <FormControl>
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              ml="2"
            >
              <FormLabel>Descripción</FormLabel>
              <Textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder=""
                size="sm"
                mb="10"
              />
            </Box>
          </FormControl>
          <Button
            size="md"
            colorScheme="teal"
            variant="outline"
            type="submit"
            isDisabled={!isValid}
          >
            Guardar
          </Button>
        </VStack>{" "}
      </HStack>
    </form>
  );
}
