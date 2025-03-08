import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FullPageLoading,
  LoadingSpinner,
} from "@/components/ui/loading-spinner";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Milestones from "@/pages/milestones";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/main-layout";

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  console.log("ProtectedRoute:", {
    user: user?.uid || null,
    loading,
    path: window.location.pathname,
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!user) {
    return null;
  }

  console.log("Rendering protected component");
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Component />
      </motion.div>
    </MainLayout>
  );
}

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  console.log("Router rendered:", {
    user: user?.uid || null,
    loading,
    location,
  });

  useEffect(() => {
    if (!loading) {
      if (user && location === "/login") {
        console.log(
          "User logged in but on login page, redirecting to dashboard"
        );
        setLocation("/dashboard");
      } else if (!user && location !== "/login" && location !== "/") {
        console.log("No user but not on login page, redirecting to login");
        setLocation("/login");
      } else if (location === "/") {
        console.log("Root path, redirecting based on auth");
        setLocation(user ? "/dashboard" : "/login");
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return <FullPageLoading />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/login" component={Login} />
          <Route
            path="/dashboard"
            component={() => <ProtectedRoute component={Dashboard} />}
          />
          <Route
            path="/tasks"
            component={() => <ProtectedRoute component={Tasks} />}
          />
          <Route
            path="/milestones"
            component={() => <ProtectedRoute component={Milestones} />}
          />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <PwaInstallPrompt />
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
