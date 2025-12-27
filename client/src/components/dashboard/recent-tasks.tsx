import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecentTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => {
      if (completed) {
        return apiRequest("POST", `/api/tasks/${id}/complete`);
      } else {
        return apiRequest("PUT", `/api/tasks/${id}`, { completed: false, completedAt: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTasks = tasks?.slice(0, 6) || [];

  const handleTaskToggle = (task: Task) => {
    toggleTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
      </CardHeader>
      <CardContent className="p-6">
        {recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tasks created yet.</p>
            <Link href="/tasks">
              <Button size="sm" data-testid="create-first-task">
                Create First Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center space-x-3"
                data-testid={`task-${task.id}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleTaskToggle(task)}
                  disabled={toggleTaskMutation.isPending}
                  data-testid={`task-checkbox-${task.id}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    task.completed 
                      ? "text-gray-500 line-through" 
                      : "text-gray-900"
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.completed 
                      ? "Completed" 
                      : task.dueDate 
                        ? `Due: ${format(new Date(task.dueDate), "MMM d")}`
                        : "No due date"
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200 mt-6">
          <Link href="/tasks">
            <button 
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              data-testid="add-new-task"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add new task
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
