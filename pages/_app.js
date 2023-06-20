import { ChakraProvider, useMediaQuery, Box, VStack } from "@chakra-ui/react";
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";

import { useUserData } from "../lib/hooks";
import { UserContext } from "../lib/context";
import HeaderDesktop from "../components/HeaderDesktop";
import HeaderMobile from "../components/HeaderMobile";
import FooterDesktop from "../components/FooterDesktop";
import AuthCheck from "../components/AuthCheck";
import theme from "../lib/theme";

import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  const router = useRouter();
  const [isLargerThan900] = useMediaQuery("(min-width: 900px)");

  return (
    <UserContext.Provider value={userData}>
      <ChakraProvider theme={theme}>
        <AuthCheck>
          <VStack
            width="100vw"
            height={{
              base: "90vh",
              lg: "100vh",
            }}
            justifyContent="space-between"
            spacing={{
              base: "3",
              md: "6",
              sm: "4",
            }}
          >
            {isLargerThan900 ? <HeaderDesktop /> : <HeaderMobile />}

            {/* <Box width={["85%", "80%", "50%"]}> */}
            <Box
              flexGrow={1}
              overflowY="scroll"
              width={
                router.pathname === "/"
                  ? {
                      base: "100%",
                    }
                  : {
                      base: "85%",
                      md: "80%",
                      lg: "70%",
                      xl: "50%",
                    }
              }
            >
              <Component {...pageProps} />
            </Box>
            <FooterDesktop />
          </VStack>
        </AuthCheck>
        <Toaster />
      </ChakraProvider>
    </UserContext.Provider>
  );
}
export default MyApp;
