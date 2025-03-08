import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Target, label: "Milestones", href: "/milestones" },
];

export function NavSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Check if the viewport is in compact mode (less than 1024px)
  const isCompact = window.matchMedia("(max-width: 1024px)").matches;

  // Animation variants
  const sidebarVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      x: -10,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <motion.div
        initial="initial"
        animate="animate"
        variants={sidebarVariants}
        className="flex flex-col h-full py-4"
      >
        {/* User Profile */}
        <motion.div
          variants={itemVariants}
          className="px-4 mb-6 flex items-center gap-3"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="truncate">
            <p className="font-medium truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </motion.div>

        {/* Navigation Links - Responsive approach */}
        <nav className="px-2 flex-1 space-y-1">
          <TooltipProvider delayDuration={300}>
            {navItems.map((item) => (
              <motion.div key={item.href} variants={itemVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                          "hover:bg-accent/70 active:bg-accent/90",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:ring-offset-2",
                          location === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </a>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </TooltipProvider>
        </nav>

        {/* Sign Out Button */}
        <motion.div variants={itemVariants} className="px-4 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-dashed hover:border-solid"
            onClick={() => auth.signOut()}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </motion.div>

        {/* App version */}
        <motion.div variants={itemVariants} className="px-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            SkillSync v1.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
