import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Users, 
  Calendar, 
  CheckSquare,
  Shield,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, FollowUp, Task } from "@shared/schema";

export default function Export() {
  const [exportingType, setExportingType] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const handleExport = async (type: string, endpoint: string, filename: string) => {
    setExportingType(type);
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingType(null);
    }
  };

  const exportOptions = [
    {
      id: "clients-csv",
      title: "Export Clients (CSV)",
      description: "Download all client information in CSV format",
      icon: Users,
      iconColor: "text-primary-600",
      bgColor: "bg-primary-100",
      count: clients?.length || 0,
      endpoint: "/api/export/clients/csv",
      filename: `clients_${new Date().toISOString().split('T')[0]}.csv`,
      testId: "export-clients-csv",
    },
    {
      id: "followups-csv",
      title: "Export Follow-ups (CSV)",
      description: "Download all follow-up data in CSV format",
      icon: Calendar,
      iconColor: "text-warning-600",
      bgColor: "bg-warning-100",
      count: followUps?.length || 0,
      endpoint: "/api/export/follow-ups/csv",
      filename: `followups_${new Date().toISOString().split('T')[0]}.csv`,
      testId: "export-followups-csv",
    },
    {
      id: "tasks-csv",
      title: "Export Tasks (CSV)",
      description: "Download all task information in CSV format",
      icon: CheckSquare,
      iconColor: "text-success-600",
      bgColor: "bg-success-100",
      count: tasks?.length || 0,
      endpoint: "/api/export/tasks/csv",
      filename: `tasks_${new Date().toISOString().split('T')[0]}.csv`,
      testId: "export-tasks-csv",
    },
  ];

  const handleBackupData = async () => {
    setExportingType("backup");
    
    try {
      // Create a comprehensive backup by combining all data
      const backupData = {
        exportDate: new Date().toISOString(),
        clients: clients || [],
        followUps: followUps || [],
        tasks: tasks || [],
        metadata: {
          totalClients: clients?.length || 0,
          totalFollowUps: followUps?.length || 0,
          totalTasks: tasks?.length || 0,
          version: "1.0.0",
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Backup Successful",
        description: "Complete data backup has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingType(null);
    }
  };

  return (
    <>
      <TopBar title="Data Export" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Data Export & Backup
          </h2>
          <p className="text-gray-600">
            Export your data for backup, analysis, or integration with other systems
          </p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {exportOptions.map((option) => (
            <Card key={option.id} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                    <option.icon className={`h-6 w-6 ${option.iconColor}`} />
                  </div>
                  <Badge variant="secondary" data-testid={`${option.id}-count`}>
                    {option.count} items
                  </Badge>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>
                
                <Button
                  onClick={() => handleExport(option.id, option.endpoint, option.filename)}
                  disabled={exportingType === option.id || option.count === 0}
                  className="w-full"
                  data-testid={option.testId}
                >
                  {exportingType === option.id ? (
                    "Exporting..."
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
                
                {option.count === 0 && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    No data available to export
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Backup Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Complete Data Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Backup All Data
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Download a complete backup of all your data including clients, follow-ups, and tasks in JSON format.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{clients?.length || 0} clients</span>
                  <span>{followUps?.length || 0} follow-ups</span>
                  <span>{tasks?.length || 0} tasks</span>
                </div>
              </div>
              
              <Button
                onClick={handleBackupData}
                disabled={exportingType === "backup"}
                size="lg"
                data-testid="backup-all-data"
                className="md:ml-4"
              >
                {exportingType === "backup" ? (
                  "Creating Backup..."
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Backup All Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Guidelines */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <FileText className="h-5 w-5 mr-2" />
              Export Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>CSV Exports:</strong> Ideal for spreadsheet analysis and reporting. Compatible with Excel, Google Sheets, and other tools.</p>
              <p><strong>JSON Backup:</strong> Complete data backup suitable for system migration or comprehensive data restoration.</p>
              <p><strong>Data Security:</strong> Exported files contain sensitive information. Store them securely and delete when no longer needed.</p>
              <p><strong>File Names:</strong> All exports include the current date for easy identification and organization.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
