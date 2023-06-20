import { extendTheme } from "@chakra-ui/react";
import customAccordion from "./accordion";

const breakpoints = {
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
}

const theme = extendTheme({
  breakpoints,
  styles: {
    global: {
      'html, body, a, button': {
        color: '#1D3C58',
      },
    },
  },
  colors: {
    body: {
      text: "#1D3C58",
    },
  },
  components: {
    Accordion: customAccordion,
  },
});

export default theme;
