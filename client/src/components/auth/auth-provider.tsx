import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    displayName: "Test User",
    email: "test@example.com",
    uid: "test-uid",
  } as User,
  loading: false,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Temporarily provide a dummy user
  const value = {
    user: {
      displayName: "Test User",
      email: "test@example.com",
      uid: "test-uid",
    } as User,
    loading: false,
    error: null,
  };

  return (
    <AuthContext.Provider value={value}>
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