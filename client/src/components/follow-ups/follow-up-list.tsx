import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Check, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { FollowUp, Client } from "@shared/schema";
import { format, isAfter, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FollowUpForm from "./follow-up-form";

export default function FollowUpList() {
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [deletingFollowUp, setDeletingFollowUp] = useState<FollowUp | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: followUps, isLoading: followUpsLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/follow-ups/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Follow-up marked as completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete follow-up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/follow-ups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Follow-up deleted successfully.",
      });
      setDeletingFollowUp(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete follow-up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getClientName = (clientId: string) => {
    return clients?.find(c => c.id === clientId)?.name || "Unknown Client";
  };

  const getStatusBadge = (followUp: FollowUp) => {
    if (followUp.completed) {
      return <Badge className="bg-success-100 text-success-800">Completed</Badge>;
    }
    
    const now = new Date();
    const scheduledDate = parseISO(followUp.scheduledDate);
    
    if (isAfter(now, scheduledDate)) {
      return <Badge className="bg-danger-100 text-danger-800">Overdue</Badge>;
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (scheduledDate <= today) {
      return <Badge className="bg-warning-100 text-warning-800">Due Today</Badge>;
    }
    
    return <Badge className="bg-primary-100 text-primary-800">Scheduled</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      call: "bg-blue-100 text-blue-800",
      email: "bg-green-100 text-green-800",
      meeting: "bg-purple-100 text-purple-800",
      proposal: "bg-orange-100 text-orange-800",
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (followUpsLoading) {
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

  const sortedFollowUps = followUps?.sort((a, b) => {
    // Completed follow-ups go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Sort by scheduled date
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  }) || [];

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {sortedFollowUps.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No follow-ups scheduled. Schedule your first follow-up to get started.
              </div>
            ) : (
              sortedFollowUps.map((followUp) => (
                <div 
                  key={followUp.id} 
                  className="p-6 hover:bg-gray-50"
                  data-testid={`followup-${followUp.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {followUp.title}
                        </h3>
                        {getStatusBadge(followUp)}
                        {getTypeBadge(followUp.type)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Client: {getClientName(followUp.clientId)}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(parseISO(followUp.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      
                      {followUp.description && (
                        <p className="text-sm text-gray-600">
                          {followUp.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!followUp.completed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => completeMutation.mutate(followUp.id)}
                          disabled={completeMutation.isPending}
                          data-testid={`complete-followup-${followUp.id}`}
                          className="text-success-600 hover:text-success-800"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFollowUp(followUp)}
                        data-testid={`edit-followup-${followUp.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-600 hover:text-danger-800"
                        onClick={() => setDeletingFollowUp(followUp)}
                        data-testid={`delete-followup-${followUp.id}`}
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

      {/* Edit Follow-up Modal */}
      {editingFollowUp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <FollowUpForm
            followUp={editingFollowUp}
            onClose={() => setEditingFollowUp(null)}
            onSuccess={() => setEditingFollowUp(null)}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFollowUp} onOpenChange={() => setDeletingFollowUp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Follow-up</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this follow-up? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-followup">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFollowUp && deleteMutation.mutate(deletingFollowUp.id)}
              disabled={deleteMutation.isPending}
              data-testid="confirm-delete-followup"
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
