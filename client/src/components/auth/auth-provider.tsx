import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          toast({
            title: "Success",
            description: "Successfully signed in with Google",
          });
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error);
        setLoading(false);
        toast({
          title: "Authentication Error",
          description: "There was a problem with authentication. Please try again.",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}