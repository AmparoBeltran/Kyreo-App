import {
  LinkBox,
  LinkOverlay,
  Box,
  Avatar,
  Stack,
  VStack,
  Heading,
} from "@chakra-ui/react";
//import { signOut } from "firebase/auth";
//import { auth } from "../lib/firebase";
import NewBadge from "./NewBadge";
import NextLink from 'next/link';

export default function DiagnosticItem(props) {
  return (
    <LinkBox width={props.width || {
      base: "18rem",
      md: "xl",
    }}>
      <Stack
        direction={{
          base: "column",
          sm: "row",
        }}
        bgColor={"whiteAlpha.900"}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        mx="auto"
        px="6"
        alignItems={"center"}
      >
        <Avatar  name={props.data.username} size={{
          base: "sm",
          sm: "md",
        }}  />
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
              {props.data.username} &bull;{" "}
              {new Date(props.data.createdAt).toLocaleDateString()}
              <NewBadge
                createdAt={props.data.createdAt}
                updatedAt={props.data.updatedAt}
              />
            </Box>
          </Box>

          <Box>
            <Box as="span" color="gray.600" fontSize="sm">
              <Heading as="h4" size="sm">
                <NextLink
                  href={
                    props.disableLink ? "#" : `/diagnosticos/${props.data.slug}`
                  }
                  passHref
                >
                  <LinkOverlay
                    _before={
                      props.disableLink && {
                        cursor: "default",
                      }
                    }
                    onClick={props.onClick}
                  >
                    {props.data.patron}
                  </LinkOverlay>
                </NextLink>
              </Heading>
            </Box>
          </Box>
        </VStack>
      </Stack>
    </LinkBox>
  );
}
