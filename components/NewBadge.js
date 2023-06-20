import { Badge } from "@chakra-ui/react";

export default function NewBadge(props) {
  const interval = 1000 * 60 * 60 * 24 * 7;
  const now = new Date().getTime();
  const updatedAt = props.updatedAt;
  const createdAt = props.createdAt;
  const isNew = now - createdAt < interval;
  const isUpdated = createdAt < updatedAt;
  
  return isNew ? (
    <Badge ml="1" colorScheme="green">
      {isUpdated ? "Editado" : "Nuevo"}
    </Badge>
  ) : null;
}
