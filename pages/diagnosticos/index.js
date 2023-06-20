import { HStack } from "@chakra-ui/react";

import { firestore, postToJSON } from "../../lib/firebase";
import { useState, useEffect } from "react";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import DiagnosticList from "../../components/DiagnosticList";

const LIMIT = 5;

export default function Diagnosticos() {
  const [diagnosticos, setDiagnosticos] = useState([]);

  useEffect(() => {
    document.body.classList.toggle("bg-diagnosticos");

    const diags = query(
      collectionGroup(firestore, "diagnosticos"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    getDocs(diags).then((diags) => {
      setDiagnosticos(diags.docs.map(postToJSON));
    });

    return () => {
      document.body.classList.toggle("bg-diagnosticos");
    };
  }, []);

  return (
    <HStack alignSelf={"center"} px={10}>
      <DiagnosticList diagnostics={diagnosticos} />
    </HStack>
  );
}
