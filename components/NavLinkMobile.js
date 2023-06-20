import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import React from "react";

import {
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

export default function NavLink(props) {
  const router = useRouter();
  const isActiveRoute =
    router.asPath.split("/")[1] === props.path.split("/")[1];

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <>
      <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
        Open
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent
          className={`navLink ${isActiveRoute && "activeRoute"}`}
          border={props.label === "Logout" ? "1px solid black" : undefined}
          onClick={props.label === "Logout" ? () => signOut(auth) : undefined}
          w="full"
          alignItems="center"
          justifyContent="space-around"
          px={6}
        >
          <DrawerCloseButton />

          <DrawerBody>
            <a href={props.path}>{props.label}</a>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
