import { Box } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box
      zIndex={-10}
      height={"45vh"}
      width={"100vw"}
      bgSize="contain"
      bgRepeat="no-repeat"
      bgPosition={"center"}
      bgImage={"/inicio-background.svg"}
      mb={{
        base: -32,
        lg: 0,
      }}
    ></Box>
  );
}
