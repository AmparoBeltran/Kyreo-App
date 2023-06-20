import { accordionAnatomy } from "@chakra-ui/anatomy";

const accordionContainer = {
  marginY: 4,
  borderRadius: "lg",
  bgColor: "whiteAlpha.700",
  border: "none",
};

const accordionButton = {
  paddingY: 4,
};

const accordionVariant = {
  container: accordionContainer,
  button: accordionButton,
};

const accordion = {
  parts: accordionAnatomy.keys,
  variants: {
    custom: accordionVariant,
  },
};

export default accordion;
