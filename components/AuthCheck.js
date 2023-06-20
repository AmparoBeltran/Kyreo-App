import Login from "./Login";
import { auth } from "../lib/firebase";

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  return auth.currentUser ? props.children : props.fallback || <Login />;
}
