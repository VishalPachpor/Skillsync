import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, StopCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Task, TimeEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function TimeTracker() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: timeEntries } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const startTracking = useMutation({
    mutationFn: async () => {
      const entry = {
        taskId: parseInt(selectedTaskId),
        startTime: new Date().toISOString(),
      };
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
  });

  const stopTracking = useMutation({
    mutationFn: async () => {
      const endTime = new Date();
      const duration = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 0;
      
      const entry = {
        endTime: endTime.toISOString(),
        duration,
      };
      
      return apiRequest("PATCH", `/api/time-entries/${timeEntries?.[timeEntries.length - 1].id}`, entry);
    },
    onSuccess: () => {
      setIsTracking(false);
      setStartTime(null);
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time tracking stopped",
        description: "The timer has been stopped and the entry has been saved.",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedTaskId}
            onValueChange={setSelectedTaskId}
            disabled={isTracking}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {tasks?.filter(t => !t.completed).map((task) => (
                <SelectItem key={task.id} value={task.id.toString()}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedTaskId && !isTracking}
            onClick={() => isTracking ? stopTracking.mutate() : startTracking.mutate()}
          >
            {isTracking ? (
              <>
                <StopCircle className="mr-2 h-5 w-5" />
                Stop Tracking
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Tracking
              </>
            )}
          </Button>

          {isTracking && startTime && (
            <p className="text-center text-sm text-muted-foreground">
              Tracking time for: {formatDuration(new Date().getTime() - startTime.getTime())}
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

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
