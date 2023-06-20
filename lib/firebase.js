import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyA6X0CZ8A3BtvjsQrqXwwPdykRjlY2fxUk",
//   authDomain: "kyreo-app-4a1a5.firebaseapp.com",
//   projectId: "kyreo-app-4a1a5",
//   storageBucket: "kyreo-app-4a1a5.appspot.com",
//   messagingSenderId: "852758741908",
//   appId: "1:852758741908:web:de09f575af49e361b88581",
//   measurementId: "G-YF3TLZR007",
// };

const firebaseConfig = {
  apiKey: "AIzaSyAjpL1ezefKCNV7d-Wh6NgimTp7RoLLiYY",
  authDomain: "kyreo-app.firebaseapp.com",
  databaseURL: "https://kyreo-app.firebaseio.com",
  projectId: "kyreo-app",
  storageBucket: "kyreo-app.appspot.com",
  messagingSenderId: "837931634191",
  appId: "1:837931634191:web:1da843746500237d5e9d7a",
  measurementId: "G-4Y4682YBYR"
};

let app;

if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
}

// Auth exports
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

// Firestore exports
export const firestore = firebase.firestore();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const increment = firebase.firestore.FieldValue.increment;

// Storage exports
export const storage = getStorage(app);
// export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

/// Helper functions

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = firestore.collection("users");
  const query = usersRef.where("username", "==", username).limit(1);
  const userDoc = (await query.get()).docs[0];
  return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data?.createdAt?.toMillis() || 0,
    _createdAt: data?.createdAt,
    updatedAt: data?.updatedAt?.toMillis() || 0,
  };
}
