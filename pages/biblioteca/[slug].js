import { UserContext } from "../../lib/context";
import {
  firestore,
  serverTimestamp,
  postToJSON,
  auth,
} from "../../lib/firebase";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useCollection } from "react-firebase-hooks/firestore";

import {
  Stack,
  HStack,
  VStack,
  Avatar,
  Text,
  Image,
  Box,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import NextLink from "next/link";
import NewBadge from "../../components/NewBadge";

export default function BibliotecaPage() {
  return <DisplayPosts />;
}

function DisplayPosts() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [isAuthor, setIsAuthor] = useState(false);

  const [foto, setFoto] = useState("");

  const [archivoUrl, setArchivoUrl] = useState("");

  useEffect(() => {
    document.body.classList.toggle("bg-biblioteca");

    const posts = query(
      collectionGroup(firestore, "posts"),
      where("slug", "==", router.query.slug)
    );

    getDocs(posts).then((posts) => {
      posts.docs.forEach((_post) => {
        const post = postToJSON(_post);

        setUsername(post.username);
        setTitulo(post.titulo);
        setDescripcion(post.descripcion);
        setCreatedAt(post.createdAt);
        setUpdatedAt(post.updatedAt);
        setFoto(post.foto);
        setArchivoUrl(post.archivoUrl);

        if (post.username === auth.currentUser.displayName) {
          setIsAuthor(true);
        }
      });
    });

    return () => {
      document.body.classList.toggle("bg-biblioteca");
    };
  }, [router.query.slug]);

  function handlePdfDownload() {
    const pdfLink = document.createElement("a");
    pdfLink.href = archivoUrl;
    pdfLink.target = "_blank";
    pdfLink.click();
  }

  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  return (
    <VStack alignItems={"flex-end"} spacing="6">
      <NextLink href="/biblioteca/create" passHref>
        <Button size="sm" colorScheme="teal" variant="outline">
          Nuevo Artículo
        </Button>
      </NextLink>
      <Stack
        bgColor={"whiteAlpha.900"}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        width="100%"
        alignItems="flex-start"
        mx="auto"
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

        <VStack px="6" py="10" alignItems={"flex-start"}>
          <Box display="flex" alignItems="baseline" mb={6}>
            <Avatar size="md" name={username} />
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              display={"flex"}
              alignItems="center"
              ml="2"
            >
              {username} &bull; {new Date(createdAt).toLocaleDateString()}
              <NewBadge createdAt={createdAt} updatedAt={updatedAt} />
            </Box>
          </Box>

          <Box
            my="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            noOfLines={1}
          >
            {titulo}
          </Box>

          <Box>
            <Box as="span" color="gray.600" fontSize="sm">
              <Text mb={6} maxWidth="2xl">
                {descripcion}
              </Text>
            </Box>
          </Box>
          <HStack justifyContent={"center"} width="100%" spacing={6}>
            {archivoUrl?.length > 0 && (
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={handlePdfDownload}
              >
                Descargar
              </Button>
            )}
            {isAuthor && (
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={() =>
                  router.push(`/biblioteca/editar/${router.query.slug}`)
                }
              >
                Editar
              </Button>
            )}
          </HStack>
        </VStack>
      </Stack>
    </VStack>
  );
}
