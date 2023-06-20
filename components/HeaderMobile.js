import { Box, HStack } from "@chakra-ui/react";

import Logo from "../icons/Logo";
import SearchBar from "../components/SearchBar";
import NavLinksMobile from "./NavLinksMobile";
import NextLink from "next/link";

export default function HeaderMobile() {
  return (
    <HStack width={"full"} px={8} mt={8} justifyContent="space-between">
      <Box cursor={"pointer"}>
        <NextLink href={"/"}>
          <Logo width={50} height={50} />
        </NextLink>
      </Box>
      <SearchBar />
      <NavLinksMobile />
    </HStack>
  );
}
