import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  console.log(
    "Login component rendered, user:",
    user?.uid,
    "authLoading:",
    authLoading
  );

  const handleSignIn = async () => {
    try {
      console.log("Sign in button clicked");
      setIsLoading(true);
      const user = await signInWithGoogle();
      console.log("Sign in completed, user:", user?.uid);

      if (user) {
        console.log("Redirecting to dashboard after sign in");
        setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show login form while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    console.log("User already logged in, redirecting to dashboard");
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Welcome to SkillSync
            </CardTitle>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center text-muted-foreground"
            >
              Your personal skills and task manager
            </motion.p>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                className="w-full"
                size="lg"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with Google"
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
