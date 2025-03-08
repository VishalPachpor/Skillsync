import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const tasksByDate = tasks?.reduce((acc, task) => {
    if (task.dueDate) {
      const dateStr = new Date(task.dueDate).toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            hasTasks: (date) => {
              return !!tasksByDate?.[date.toDateString()];
            },
          }}
          modifiersStyles={{
            hasTasks: {
              backgroundColor: "hsl(var(--primary) / 0.1)",
              borderRadius: "4px",
            },
          }}
        />

        {date && tasksByDate?.[date.toDateString()] && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Tasks for {date.toLocaleDateString()}</h4>
            <div className="space-y-2">
              {tasksByDate[date.toDateString()].map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent"
                >
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                  <Badge variant={task.completed ? "secondary" : "default"}>
                    {task.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
