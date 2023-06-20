import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import React from "react";
import NavLink from './NavLink';

import {
  VStack,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

export default function NavLinksMobile(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <>
        <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
          Menú
        </Button>
        <Drawer
          isOpen={isOpen}
          placement="right"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />

            <DrawerBody>
              <VStack spacing={8} mt={6}>
                <NavLink onClick={onClose} label="Inicio" path="/" />
                <NavLink onClick={onClose} label="Formulario" path="/diagnosticos/create" />
                <NavLink onClick={onClose} label="Diagnósticos" path="/diagnosticos" />
                <NavLink onClick={onClose} label="Biblioteca" path="/biblioteca" />
                <NavLink onClick={onClose} label="Logout" path="#" />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
    </>
  );
}
