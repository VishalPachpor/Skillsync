import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
      return;
    }

    // For iOS devices - check if added to home screen
    if (
      navigator.standalone ||
      (window.navigator.userAgent.match(/iPhone|iPad|iPod/) &&
        !window.navigator.userAgent.match(/Safari/))
    ) {
      setIsAppInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt after a delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      // For iOS devices, show custom instructions
      if (window.navigator.userAgent.match(/iPhone|iPad|iPod/)) {
        setShowPrompt(true);
      }
      return;
    }

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    // We've used the prompt, and can't use it again, discard it
    setInstallPrompt(null);

    if (outcome === "accepted") {
      setIsAppInstalled(true);
    }

    setShowPrompt(false);
  };

  if (isAppInstalled || !showPrompt) return null;

  // Custom prompt for iOS
  if (window.navigator.userAgent.match(/iPhone|iPad|iPod/) && !installPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 md:left-auto md:right-6 md:bottom-6 md:w-80">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">
              Install SkillSync on your iOS device
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Tap the share button{" "}
              <span className="inline-block w-5 h-5 bg-primary/10 rounded text-center">
                ↑
              </span>{" "}
              and then "Add to Home Screen" to install SkillSync
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => setShowPrompt(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard prompt for other devices
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 md:left-auto md:right-6 md:bottom-6 md:w-80">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">Install SkillSync App</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Install our app for a better experience with offline access
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="text-xs" onClick={handleInstallClick}>
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowPrompt(false)}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
