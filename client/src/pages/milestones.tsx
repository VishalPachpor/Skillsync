import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { Milestone, insertMilestoneSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function Milestones() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertMilestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDate: "",
      completed: false,
    },
  });

  const { data: milestones, isLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const createMilestone = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/milestones", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Milestone created",
        description: "Your new milestone has been created successfully.",
      });
    },
  });

  const toggleMilestoneStatus = useMutation({
    mutationFn: (milestone: Milestone) =>
      apiRequest("PATCH", `/api/milestones/${milestone.id}`, {
        completed: !milestone.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: (milestoneId: number) =>
      apiRequest("DELETE", `/api/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({
        title: "Milestone deleted",
        description: "The milestone has been deleted successfully.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
          <p className="text-muted-foreground">Track your progress towards goals</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMilestone.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Create Milestone
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {milestones?.map((milestone) => {
          const daysLeft = Math.ceil(
            (new Date(milestone.targetDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const progress = Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100));

          return (
            <div
              key={milestone.id}
              className="p-6 rounded-lg border bg-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-muted-foreground">{milestone.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    {daysLeft > 0 && ` (${daysLeft} days left)`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleMilestoneStatus.mutate(milestone)}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${
                        milestone.completed ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMilestone.mutate(milestone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={milestone.completed ? 100 : progress} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
