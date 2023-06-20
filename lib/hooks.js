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

  const results = useMemo(() => {

    const filteredResults = diagnostics.filter(
      (diagnostic) =>
        diagnostic.patron?.toLowerCase().includes(searchString.toLowerCase()) ||
        diagnostic.username
          ?.toLowerCase()
          .startsWith(searchString.toLowerCase())
    );
    return filteredResults;
  }, [diagnostics, searchString]);

  function handleSetSearchString(event) {
    setSearchString(event.target.value);
  }

  function fetchResults() {
    const diags = query(
      collectionGroup(firestore, "diagnosticos"),
      orderBy("createdAt", "desc")
    );

    getDocs(diags).then((diags) => {
      setDiagnostics(diags.docs.map(postToJSON));
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
