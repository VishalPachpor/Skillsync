import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle, StopCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Task, TimeEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function TimeTracker() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up timer to update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(new Date().getTime() - startTime.getTime());
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: timeEntries } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const startTracking = useMutation({
    mutationFn: async () => {
      if (!selectedTaskId) {
        throw new Error("No task selected");
      }

      const currentTime = new Date();
      const entry = {
        taskId: selectedTaskId,
        startTime: currentTime.toISOString(),
      };

      console.log("Starting time tracking with data:", entry);
      return apiRequest("POST", "/api/time-entries", entry);
    },
    onSuccess: () => {
      setIsTracking(true);
      setStartTime(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time tracking started",
        description: "The timer has been started for the selected task.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start time tracking. Please try again.",
        variant: "destructive",
      });
      console.error("Error starting time tracking:", error);
    },
  });

  const stopTracking = useMutation({
    mutationFn: async () => {
      if (!timeEntries?.length) {
        throw new Error("No active time entry found");
      }

      const endTime = new Date();
      const duration = startTime
        ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        : 0;

      const entry = {
        endTime: endTime.toISOString(),
        duration,
      };

      console.log("Stopping time tracking with data:", entry);
      return apiRequest(
        "PATCH",
        `/api/time-entries/${timeEntries[timeEntries.length - 1].id}`,
        entry
      );
    },
    onSuccess: () => {
      setIsTracking(false);
      setStartTime(null);
      setSelectedTaskId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time tracking stopped",
        description: "The timer has been stopped and the entry has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to stop time tracking. Please try again.",
        variant: "destructive",
      });
      console.error("Error stopping time tracking:", error);
    },
  });

  // Get the active time entry, if any
  const activeTimeEntry = timeEntries?.find((entry) => !entry.endTime);

  // Check if there's an active time entry when component loads
  useEffect(() => {
    if (activeTimeEntry && !isTracking) {
      const task = tasks?.find((t) => t.id === activeTimeEntry.taskId);
      if (task) {
        setSelectedTaskId(task.id);
        setIsTracking(true);
        setStartTime(new Date(activeTimeEntry.startTime));
      }
    }
  }, [activeTimeEntry, tasks, isTracking]);

  if (tasksLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const incompleteTasks = tasks?.filter((t) => !t.completed) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedTaskId?.toString() || ""}
            onValueChange={(value) => setSelectedTaskId(Number(value))}
            disabled={isTracking || startTracking.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {incompleteTasks.map((task) => (
                <SelectItem key={task.id} value={task.id.toString()}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            size="lg"
            disabled={
              (!selectedTaskId && !isTracking) ||
              startTracking.isPending ||
              stopTracking.isPending
            }
            onClick={() =>
              isTracking ? stopTracking.mutate() : startTracking.mutate()
            }
          >
            {isTracking ? (
              <>
                <StopCircle className="mr-2 h-5 w-5" />
                {stopTracking.isPending ? "Stopping..." : "Stop Tracking"}
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-5 w-5" />
                {startTracking.isPending ? "Starting..." : "Start Tracking"}
              </>
            )}
          </Button>

          {isTracking && (
            <p className="text-center text-sm text-muted-foreground">
              Tracking time for: {formatDuration(elapsedTime)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 60 / 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
