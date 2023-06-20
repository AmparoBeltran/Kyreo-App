import { Box, HStack, LinkBox, LinkOverlay } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";

export default function FooterDesktop() {
  return (
    <LinkBox
      bgColor={"whiteAlpha.900"}
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"

      mx="auto"
      px="8"
      border={"none"}
      py={4}
      display="flex"
      justifyContent={"center"}
    >
      <LinkOverlay href="https://neacreatives.com" isExternal>
        <HStack spacing={4}>
          <Image
            boxSize="40px"
            objectFit="cover"
            src="/logo-nea.svg"
            alt="Logo NeaCreatives"
          />
          <Box> Proudly made by © nea creatives LLP 2020 </Box>
          <Box color="red">|</Box>
          <Box>london square LO1 4TR </Box>
          <Box color="red">|</Box>
          <Box>LONDON</Box>
        </HStack>
      </LinkOverlay>
    </LinkBox>
  );
}
