import { useEffect, useMemo, useState } from "react";
import { auth, firestore, postToJSON } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collectionGroup, getDocs, orderBy, query } from "firebase/firestore";
import SearchResults from "../components/SearchResults";

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (user) {
      user.displayName;
    } else {
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
}

export function useSearch() {
  const [searchString, setSearchString] = useState("");
  const [diagnostics, setDiagnostics] = useState([]);
  const [posts, setPosts] = useState([]);

  const results = useMemo(() => {
    const filteredDiags = diagnostics.filter(
      (diagnostic) =>
        diagnostic.patron?.toLowerCase().includes(searchString.toLowerCase()) ||
        diagnostic.username
          ?.toLowerCase()
          .startsWith(searchString.toLowerCase())
    );
    const filteredPosts = posts.filter(
      (post) =>
        post.titulo?.toLowerCase().includes(searchString.toLowerCase()) ||
        post.username?.toLowerCase().startsWith(searchString.toLowerCase())
    );
    return [...filteredDiags, ...filteredPosts].sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }, [diagnostics, posts, searchString]);

  function handleSetSearchString(event) {
    setSearchString(event.target.value);
  }

  function fetchResults() {
    const diags = query(
      collectionGroup(firestore, "diagnosticos"),
      orderBy("createdAt", "desc")
    );
    const posts = query(
      collectionGroup(firestore, "posts"),
      orderBy("createdAt", "desc")
    );

    getDocs(diags).then((diags) => {
      setDiagnostics(diags.docs.map(postToJSON));
    });

    getDocs(posts).then((posts) => {
      setPosts(posts.docs.map(postToJSON));
    });
  }

  function displayResults() {
    if (searchString.length === 0) {
      return;
    }

    return (
      <SearchResults
        searchString={searchString}
        handleSetSearchString={handleSetSearchString}
        results={results}
      />
    );
  }

  useEffect(() => {
    fetchResults();
  }, []);

  return {
    searchString,
    handleSetSearchString,
    displayResults,
  };
}
