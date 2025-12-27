import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertFollowUpSchema, type InsertFollowUp, type FollowUp, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { format } from "date-fns";

interface FollowUpFormProps {
  followUp?: FollowUp;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedClientId?: string;
}

export default function FollowUpForm({ followUp, onClose, onSuccess, preselectedClientId }: FollowUpFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });
  
  const form = useForm<InsertFollowUp>({
    resolver: zodResolver(insertFollowUpSchema),
    defaultValues: {
      clientId: followUp?.clientId || preselectedClientId || "",
      title: followUp?.title || "",
      description: followUp?.description || "",
      type: followUp?.type || "call",
      scheduledDate: followUp?.scheduledDate 
        ? new Date(followUp.scheduledDate)
        : new Date(),
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertFollowUp) => apiRequest("POST", "/api/follow-ups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertFollowUp) => apiRequest("PUT", `/api/follow-ups/${followUp!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      toast({
        title: "Success",
        description: "Follow-up updated successfully.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow-up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFollowUp) => {
    if (followUp) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{followUp ? "Edit Follow-up" : "Schedule Follow-up"}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          data-testid="close-followup-form"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Client *</Label>
            <Select 
              value={form.watch("clientId")} 
              onValueChange={(value) => form.setValue("clientId", value)}
            >
              <SelectTrigger className="mt-1" data-testid="followup-client-select">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-sm text-danger-600 mt-1">
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              data-testid="followup-title-input"
              {...form.register("title")}
              className="mt-1"
              placeholder="e.g., Project Update Call"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-danger-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label>Type *</Label>
            <Select 
              value={form.watch("type")} 
              onValueChange={(value) => form.setValue("type", value)}
            >
              <SelectTrigger className="mt-1" data-testid="followup-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="proposal">Proposal Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              data-testid="followup-date-input"
              {...form.register("scheduledDate", {
                setValueAs: (value) => new Date(value),
              })}
              defaultValue={format(form.watch("scheduledDate"), "yyyy-MM-dd'T'HH:mm")}
              className="mt-1"
            />
            {form.formState.errors.scheduledDate && (
              <p className="text-sm text-danger-600 mt-1">
                {form.formState.errors.scheduledDate.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="followup-description-input"
              {...form.register("description")}
              className="mt-1"
              placeholder="Additional notes about this follow-up..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="cancel-followup-form"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="submit-followup-form"
            >
              {isLoading ? "Saving..." : followUp ? "Update Follow-up" : "Schedule Follow-up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
