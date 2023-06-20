import {
  Image,
  LinkBox,
  LinkOverlay,
  Box,
  Text,
  Avatar,
  Stack,
  useMediaQuery,
} from "@chakra-ui/react";

import NewBadge from "./NewBadge";
import NextLink from "next/link";

export default function BibliotecaItem(props) {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  return (
    <LinkBox>
      <Stack
        bgColor={"whiteAlpha.900"}
        boxShadow="md"
        borderRadius="lg"
        overflow="hidden"
        direction={{
          base: "column",
          md: "row",
          sm: "column",
        }}
      >
        <Image
          boxSize={isLargerThan768 ? "200px" : "100%"}
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/200"
          alt="Articulo foto"
          src={props.data.foto}
        />

        <Box p="6">
          <Box display="flex" alignItems="baseline" mb={3}>
            <Avatar size="xs" name={props.data.username} />
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
            >
              {props.data.username} &bull;{" "}
              {new Date(props.data.createdAt).toLocaleDateString()}
              <NewBadge
                createdAt={props.data.createdAt}
                updatedAt={props.data.updatedAt}
              />
            </Box>
          </Box>
          <NextLink href={`/biblioteca/${props.data.slug}`} passHref>
            <LinkOverlay>
              <Box
                my="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}
              >
                {props.data.titulo}
              </Box>
            </LinkOverlay>
          </NextLink>
          <Box>
            <Box as="span" color="gray.600" fontSize="sm">
              <Text noOfLines={[1, 2, 3]} maxWidth="md">
                {props.data.descripcion}
              </Text>
            </Box>
          </Box>
        </Box>
      </Stack>
    </LinkBox>
  );
}
