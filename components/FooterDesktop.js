import { Box, HStack, LinkBox, LinkOverlay, useMediaQuery } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";

export default function FooterDesktop() {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  return (
    <Box>
      <LinkBox
        bgColor={"whiteAlpha.900"}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        mx="auto"
        px="8"
        border={"none"}
        py={4}
        mb={{base: 0, lg: -2}}
        display="flex"
        justifyContent={"center"}
      >
        <LinkOverlay href="https://neacreatives.com" isExternal>
          <HStack
            spacing={{ base: "2", md: "4" }}
            fontSize={{ base: "xs", md: "sm" }}
          >
              <Image
                boxSize={{base:"20px", md:"40px"}}
                objectFit="cover"
                src="/logo-nea.svg"
                alt="Logo NeaCreatives"
              />
            <Box>© nea creatives LLP 2020</Box>
            {isLargerThan768 && (
              <>
                <Box color="red">|</Box>
                <Box>london square LO1 4TR</Box>
                <Box color="red">|</Box>
                <Box>LONDON</Box>
              </>
            )}
          </HStack>
        </LinkOverlay>
      </LinkBox>
    </Box>
  );
}
