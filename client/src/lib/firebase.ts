import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLV5iGLDGG1sK9OJxacY0MotRh1oFkATI",
  authDomain: "skillsync-13230.firebaseapp.com",
  projectId: "skillsync-13230",
  storageBucket: "skillsync-13230.appspot.com",
  appId: "1:244966940071:web:653daefb88f42177c4aa82",
};

console.log("Initializing Firebase with config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
auth.useDeviceLanguage();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Create or update user in Firestore
export const createUserDocument = async (user: any) => {
  console.log("Creating/updating user document for:", user?.uid);
  if (!user) {
    console.log("No user provided to createUserDocument");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    console.log("User document reference created:", userRef.path);

    const userSnap = await getDoc(userRef);
    console.log("Document exists:", userSnap.exists());

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();
      const userData = {
        displayName,
        email,
        photoURL,
        createdAt,
        tasks: [],
        milestones: [],
        lastLogin: createdAt,
      };

      console.log("Creating new user document with data:", userData);
      await setDoc(userRef, userData);
      console.log("User document created successfully");
    } else {
      // Update last login
      console.log("Updating last login for existing user");
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      console.log("Last login updated successfully");
    }

    return userRef;
  } catch (error) {
    console.error("Error in createUserDocument:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  console.log("Attempting Google sign-in with popup");
  try {
    // Use popup instead of redirect for easier debugging
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Sign-in successful:", result.user?.uid);
    await createUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Handle redirect result
export const handleRedirectResult = async () => {
  console.log("Handling redirect result");
  try {
    const result = await getRedirectResult(auth);
    console.log("Redirect result:", result?.user?.uid || "No result");

    if (result) {
      // Create/update user document in Firestore
      await createUserDocument(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect:", error);
    throw error;
  }
};
