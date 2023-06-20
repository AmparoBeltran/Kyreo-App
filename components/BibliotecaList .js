import { VStack, Button, Box } from "@chakra-ui/react";
import BibliotecaItem from "./BibliotecaItem";
import NextLink from "next/link";

export default function BibliotecaList(props) {
  return (
    <VStack width="3xl" spacing={12} alignItems="left">
      <Box alignSelf={"flex-end"}>
        <NextLink href="/biblioteca/create" passHref>
          <Button
            alignSelf={"baseline"}
            size="sm"
            colorScheme="teal"
            variant="outline"
          >
            Nuevo Artículo
          </Button>
        </NextLink>
      </Box>
      {props.posts.map((post) => (
        <BibliotecaItem key={post.slug} data={post} />
      ))}
    </VStack>
  );
}
