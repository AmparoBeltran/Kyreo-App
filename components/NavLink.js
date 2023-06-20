import { Flex, Link } from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useMemo } from "react";

export default function NavLink(props) {
  const router = useRouter();

  const isActiveRoute = useMemo(() => {
    if (props.label === "Formulario") {
      return router.asPath.includes(props.path);
    } else {
      if (router.asPath.endsWith("diagnosticos/create")) return false;
      return router.asPath.split("/")[1] === props.path.split("/")[1];
    }
  });

  // const isActiveRoute =
  //   router.asPath.split("/")[1] === props.path.split("/")[1];

  return (
    <Flex
      className={`navLink ${isActiveRoute && "activeRoute"}`}
      border={props.label === "Logout" ? "1px solid black" : undefined}
      onClick={props.label === "Logout" ? () => signOut(auth) : undefined}
      alignItems="center"
      justifyContent="space-around"
      px={6}
    >
      <NextLink href={props.path} passHref>
        <Link
          _hover={{
            textDecoration: "none",
          }}
          onClick={props.onClick}
        >
          {props.label}
        </Link>
      </NextLink>
    </Flex>
  );
}
