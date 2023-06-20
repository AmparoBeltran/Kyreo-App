import { useEffect, useRef, useState } from "react";
import {
  ModalFooter,
  Button,
  useDisclosure,
  Stack,
  Avatar,
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  HStack,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ChatIcon } from "@chakra-ui/icons";
import { collectionGroup, onSnapshot, query, where } from "firebase/firestore";
import { auth, firestore, postToJSON, serverTimestamp } from "../lib/firebase";
import { useRouter } from "next/router";

export default function DiagnosticComments({ diagAuthorUid }) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const commentsQuery = query(
      collectionGroup(firestore, "comments"),
      where("slug", "==", router.query.slug)
    );
    const unsub = onSnapshot(commentsQuery, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => {
          const comment = postToJSON(doc);
          return comment;
        }).sort((a,b) => a.createdAt - b.createdAt)
      );
    });

    return () => {
      unsub();
    };
  }, [router.query.slug]);

  const createComment = () => {
    const ref = firestore
      .collection("users")
      .doc(diagAuthorUid)
      .collection("diagnosticos")
      .doc(router.query.slug)
      .collection("comments");

    ref.add({
      username: auth.currentUser.displayName,
      slug: router.query.slug,
      comment,
      createdAt: serverTimestamp(),
    });
    setComment("");
  };

  return (
    <>
      <Button colorScheme="linkedin" variant="solid" onClick={onOpen}>
        Comentarios
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{
          base: "20rem",
          sm: "3xl",
        }}
        scrollBehavior={"inside"}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader fontSize="lg" fontWeight="bold">
              Comentarios
            </ModalHeader>

            <ModalBody as={VStack} alignItems={'flex-start'} spacing={2}>
              {comments.map((comment) => (
                <Stack
                  key={comment.createdAt}
                  direction={{
                    base: "column",
                    sm: "row",
                  }}
                  bgColor={"whiteAlpha.900"}
                  borderRadius="lg"
                  boxShadow="md"
                  overflow="hidden"
                  width={'full'}
                  px="6"
                  alignItems={"center"}
                >
                  <Avatar
                    name={comment.username}
                    size={{
                      base: "sm",
                      sm: "md",
                    }}
                  />
                  <VStack px="6" py="6" alignItems={"flex-start"}>
                    <Box display="flex" alignItems="baseline">
                      <Box
                        color="gray.500"
                        fontWeight="semibold"
                        letterSpacing="wide"
                        fontSize="xs"
                        textTransform="uppercase"
                        display="flex"
                        alignItems="center"
                      >
                        {comment.username} &bull;{" "}
                        {new Date(comment.createdAt).toLocaleDateString()} @ {new Date(comment.createdAt).toLocaleTimeString()}
                      </Box>
                    </Box>

                    <Box>
                      <Box as="span" color="gray.600" fontSize="sm">
                        <Heading as="h4" size="sm">
                          {comment.comment}
                        </Heading>
                      </Box>
                    </Box>
                  </VStack>
                </Stack>
              ))}
            </ModalBody>

            <ModalFooter>
              <VStack width={"full"} alignItems={"flex-end"} spacing={8}>
                <HStack width={"full"}>
                  <InputGroup>
                    <InputLeftElement h={10} pointerEvents="none">
                      <ChatIcon color="twitter.800" />
                    </InputLeftElement>
                    <Textarea
                      bgColor="whiteAlpha.900"
                      boxShadow="md"
                      // borderRadius="2xl"
                      placeholder="Comentar"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      variant={"outline"}
                      pl={9}
                      border="none"
                    />
                  </InputGroup>
                  <IconButton
                    onClick={createComment}
                    // variant={"ghost"}
                    height={20}
                    colorScheme={"twitter"}
                    rounded={"lg"}
                    icon={<ArrowForwardIcon />}
                  />
                </HStack>
                <Button ref={cancelRef} onClick={onClose}>
                  Cerrar
                </Button>
              </VStack>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
}
