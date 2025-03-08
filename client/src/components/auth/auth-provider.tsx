import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  auth,
  createUserDocument,
  createUserDocumentWithRetry,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isOffline: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      console.log("Network status changed. Online:", navigator.onLine);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Auth state changed:", user?.uid || "null");

        if (user) {
          try {
            console.log("User is authenticated, creating/updating document");
            // Use the retry version to handle offline scenarios
            await createUserDocumentWithRetry(user);
          } catch (error) {
            console.error("Error creating/updating user document:", error);
            // Don't block the authentication flow for offline errors
            if (
              error instanceof Error &&
              error.message &&
              error.message.includes("offline")
            ) {
              setIsOffline(true);
            }
          }
        }

        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setError(error);
        setLoading(false);
        // Check if it's an offline error
        if (error.message && error.message.includes("offline")) {
          setIsOffline(true);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  console.log("AuthProvider state:", {
    user: user?.uid || null,
    loading,
    error: error?.message || null,
    isOffline,
  });

  const value = {
    user,
    loading,
    error,
    isOffline,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
