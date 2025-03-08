import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { Milestone } from "@shared/schema";

export function MilestoneView() {
  const { data: milestones, isLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-muted animate-pulse rounded-md w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingMilestones = milestones
    ?.filter(m => !m.completed)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Milestones</CardTitle>
        <Target className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {upcomingMilestones?.map((milestone) => {
            const daysLeft = Math.ceil(
              (new Date(milestone.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div key={milestone.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{milestone.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {daysLeft} days left
                  </span>
                </div>
                {milestone.description && (
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                )}
                <Progress value={Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))} />
              </div>
            );
          })}

          {(!upcomingMilestones || upcomingMilestones.length === 0) && (
            <p className="text-center text-muted-foreground">No upcoming milestones</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
