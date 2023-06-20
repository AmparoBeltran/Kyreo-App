import { HStack, Button } from "@chakra-ui/react";
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
import BibliotecaList from "../../components/BibliotecaList";

const LIMIT = 5;

export default function Biblioteca () {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    document.body.classList.toggle("bg-biblioteca");

    const posts = query(
      collectionGroup(firestore, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    getDocs(posts).then((posts) => {
      setPosts(posts.docs.map(postToJSON));
    });

    return () => {
      document.body.classList.toggle("bg-biblioteca");
    };
  }, []);

  return (
    <HStack px={10} alignSelf="center">
      <BibliotecaList posts={posts} />
    </HStack>
  );
}
