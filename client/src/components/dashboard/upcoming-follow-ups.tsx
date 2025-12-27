import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { FollowUp, Client } from "@shared/schema";
import { format, isAfter, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UpcomingFollowUps() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: followUps, isLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/follow-ups/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Follow-up completed",
        description: "The follow-up has been marked as completed.",
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse h-6 bg-gray-200 rounded w-40"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingFollowUps = followUps
    ?.filter(f => !f.completed)
    ?.slice(0, 5) || [];

  const getClientName = (clientId: string) => {
    return clients?.find(c => c.id === clientId)?.name || "Unknown Client";
  };

  const getStatusColor = (scheduledDate: string) => {
    const date = parseISO(scheduledDate);
    const now = new Date();
    
    if (isAfter(now, date)) {
      return "bg-danger-500"; // Overdue
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date <= today) {
      return "bg-warning-500"; // Due today
    }
    
    return "bg-success-500"; // Future
  };

  const getStatusText = (scheduledDate: string) => {
    const date = parseISO(scheduledDate);
    const now = new Date();
    
    if (isAfter(now, date)) {
      const daysOverdue = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue === 0 ? "Overdue - Today" : `Overdue - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago`;
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date <= today) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    
    return format(date, "MMM d 'at' h:mm a");
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Follow-ups</h3>
      </CardHeader>
      <CardContent className="p-6">
        {upcomingFollowUps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming follow-ups scheduled.</p>
            <Link href="/follow-ups">
              <Button size="sm" data-testid="schedule-first-followup">
                Schedule First Follow-up
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingFollowUps.map((followUp) => (
              <div 
                key={followUp.id} 
                className="flex items-start space-x-3"
                data-testid={`followup-${followUp.id}`}
              >
                <div className={`w-2 h-2 ${getStatusColor(followUp.scheduledDate)} rounded-full mt-2`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getClientName(followUp.clientId)}
                  </p>
                  <p className="text-sm text-gray-500">{followUp.title}</p>
                  <p className={`text-xs ${
                    isAfter(new Date(), parseISO(followUp.scheduledDate)) 
                      ? "text-danger-600" 
                      : "text-gray-400"
                  }`}>
                    {getStatusText(followUp.scheduledDate)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => completeFollowUpMutation.mutate(followUp.id)}
                  disabled={completeFollowUpMutation.isPending}
                  data-testid={`complete-followup-${followUp.id}`}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {upcomingFollowUps.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-6">
            <Link href="/follow-ups">
              <button 
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                data-testid="view-all-followups"
              >
                View all follow-ups
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
