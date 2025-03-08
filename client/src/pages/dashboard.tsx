import { useAuth } from "@/components/auth/auth-provider";
import { TaskList } from "@/components/dashboard/task-list";
import { TimeTracker } from "@/components/dashboard/time-tracker";
import { MilestoneView } from "@/components/dashboard/milestone-view";
import { CalendarView } from "@/components/dashboard/calendar-view";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your productivity today
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div>
          <TimeTracker />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MilestoneView />
        <CalendarView />
      </div>
    </div>
  );
}
