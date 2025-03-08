import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth, createUserDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Auth state changed:", user?.uid || "null");

        if (user) {
          try {
            console.log("User is authenticated, creating/updating document");
            await createUserDocument(user);
          } catch (error) {
            console.error("Error creating/updating user document:", error);
          }
        }

        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setError(error);
        setLoading(false);
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
  });

  const value = {
    user,
    loading,
    error,
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
