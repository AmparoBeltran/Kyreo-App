import { Box, HStack } from "@chakra-ui/react";

import Logo from "../icons/Logo";
import NavLinks from "./NavLinks";
import SearchBar from "../components/SearchBar";
import NextLink from 'next/link';

export default function HeaderDesktop() {
  return (
    <HStack width={"full"} px={8} mt={6} justifyContent="space-between">
      <Box cursor={"pointer"}>
        <NextLink href={"/"}>
          <Logo width={100} height={100} />
        </NextLink>
      </Box>
      <SearchBar />
      <NavLinks />
    </HStack>
  );
}
