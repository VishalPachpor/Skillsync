import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@shared/schema";

export function TaskList() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedTasks = tasks
    ?.sort((a, b) => {
      if (a.completed === b.completed) {
        return a.dueDate && b.dueDate
          ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
          : 0;
      }
      return a.completed ? 1 : -1;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTasks?.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 p-2 hover:bg-accent rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={task.completed || false} />
                <div>
                  <p
                    className={`font-medium ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getCategoryVariant(task.category)}>
                {task.category}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryVariant(
  category?: string
): "default" | "secondary" | "destructive" {
  if (!category) return "default";

  switch (category.toLowerCase()) {
    case "coding":
      return "default";
    case "studying":
      return "secondary";
    case "content":
      return "destructive";
    default:
      return "default";
  }
}
