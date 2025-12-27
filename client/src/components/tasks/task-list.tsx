import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Calendar, AlertCircle } from "lucide-react";
import { Task, Client } from "@shared/schema";
import { format, isPast, isToday } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TaskForm from "./task-form";

export default function TaskList() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
      setDeletingTask(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Personal Task";
    return clients?.find(c => c.id === clientId)?.name || "Unknown Client";
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      high: "bg-danger-100 text-danger-800",
      medium: "bg-warning-100 text-warning-800",
      low: "bg-success-100 text-success-800",
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-800"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (task: Task) => {
    if (task.completed) {
      return <Badge className="bg-success-100 text-success-800">Completed</Badge>;
    }
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isPast(dueDate) && !isToday(dueDate)) {
        return <Badge className="bg-danger-100 text-danger-800">Overdue</Badge>;
      }
      if (isToday(dueDate)) {
        return <Badge className="bg-warning-100 text-warning-800">Due Today</Badge>;
      }
    }
    
    return <Badge className="bg-primary-100 text-primary-800">Pending</Badge>;
  };

  const handleTaskToggle = (task: Task) => {
    toggleTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  if (tasksLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedTasks = tasks?.sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Sort by due date, then by priority
    if (a.dueDate && b.dueDate) {
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateComparison !== 0) return dateComparison;
    }
    
    // Priority order: high, medium, low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  }) || [];

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tasks created yet. Create your first task to get started.
              </div>
            ) : (
              sortedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-6 hover:bg-gray-50 ${task.completed ? 'opacity-75' : ''}`}
                  data-testid={`task-${task.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task)}
                        disabled={toggleTaskMutation.isPending}
                        data-testid={`task-checkbox-${task.id}`}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-medium ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {getStatusBadge(task)}
                          {getPriorityBadge(task.priority || 'medium')}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {getClientName(task.clientId)}
                        </p>
                        
                        {task.dueDate && (
                          <div className={`flex items-center text-sm mb-2 ${
                            isPast(new Date(task.dueDate)) && !task.completed ? 'text-danger-600' : 'text-gray-500'
                          }`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy 'at' h:mm a")}
                            {isPast(new Date(task.dueDate)) && !task.completed && (
                              <AlertCircle className="h-4 w-4 ml-2" />
                            )}
                          </div>
                        )}
                        
                        {task.description && (
                          <p className={`text-sm ${
                            task.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                        data-testid={`edit-task-${task.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-600 hover:text-danger-800"
                        onClick={() => setDeletingTask(task)}
                        data-testid={`delete-task-${task.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TaskForm
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSuccess={() => setEditingTask(null)}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-task">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTask && deleteMutation.mutate(deletingTask.id)}
              disabled={deleteMutation.isPending}
              data-testid="confirm-delete-task"
              className="bg-danger-600 hover:bg-danger-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
