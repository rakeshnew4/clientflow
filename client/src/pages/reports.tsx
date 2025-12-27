import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckSquare, 
  Clock,
  AlertTriangle,
  Target
} from "lucide-react";
import { Client, FollowUp, Task } from "@shared/schema";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";

interface Stats {
  totalClients: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  activeTasks: number;
}

export default function Reports() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Calculate additional metrics
  const getClientStatusBreakdown = () => {
    if (!clients) return { active: 0, prospect: 0, inactive: 0 };
    
    return clients.reduce((acc, client) => {
      acc[client.status as keyof typeof acc] = (acc[client.status as keyof typeof acc] || 0) + 1;
      return acc;
    }, { active: 0, prospect: 0, inactive: 0 });
  };

  const getRecentActivity = () => {
    const last7Days = subDays(new Date(), 7);
    
    const recentClients = clients?.filter(client => 
      client.createdAt && isAfter(new Date(client.createdAt), last7Days)
    ).length || 0;
    
    const recentFollowUps = followUps?.filter(followUp => 
      followUp.createdAt && isAfter(new Date(followUp.createdAt), last7Days)
    ).length || 0;
    
    const recentTasks = tasks?.filter(task => 
      task.createdAt && isAfter(new Date(task.createdAt), last7Days)
    ).length || 0;
    
    return { recentClients, recentFollowUps, recentTasks };
  };

  const getTaskPriorityBreakdown = () => {
    if (!tasks) return { high: 0, medium: 0, low: 0 };
    
    return tasks.filter(t => !t.completed).reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority as keyof typeof acc] = (acc[priority as keyof typeof acc] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
  };

  const getUpcomingDeadlines = () => {
    if (!followUps && !tasks) return [];
    
    const upcomingItems = [];
    
    // Add upcoming follow-ups
    followUps?.filter(f => !f.completed).forEach(followUp => {
      upcomingItems.push({
        type: 'follow-up',
        title: followUp.title,
        date: followUp.scheduledDate,
        isOverdue: isBefore(parseISO(followUp.scheduledDate), new Date()),
      });
    });
    
    // Add upcoming tasks with due dates
    tasks?.filter(t => !t.completed && t.dueDate).forEach(task => {
      upcomingItems.push({
        type: 'task',
        title: task.title,
        date: task.dueDate!,
        isOverdue: isBefore(new Date(task.dueDate!), new Date()),
      });
    });
    
    return upcomingItems
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const clientStatusBreakdown = getClientStatusBreakdown();
  const recentActivity = getRecentActivity();
  const taskPriorityBreakdown = getTaskPriorityBreakdown();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <>
      <TopBar title="Reports & Analytics" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Business Analytics
          </h2>
          <p className="text-gray-600">
            Insights and metrics about your client relationships and business performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="total-clients-metric">
                    {stats?.totalClients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Follow-ups</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="pending-followups-metric">
                    {stats?.pendingFollowUps || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-success-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="active-tasks-metric">
                    {stats?.activeTasks || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-danger-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Overdue Items</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="overdue-items-metric">
                    {stats?.overdueFollowUps || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Client Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Client Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-success-100 text-success-800 mr-3">Active</Badge>
                    <span className="text-sm text-gray-600">Active Clients</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="active-clients-count">
                    {clientStatusBreakdown.active}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-warning-100 text-warning-800 mr-3">Prospect</Badge>
                    <span className="text-sm text-gray-600">Prospects</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="prospect-clients-count">
                    {clientStatusBreakdown.prospect}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-gray-100 text-gray-800 mr-3">Inactive</Badge>
                    <span className="text-sm text-gray-600">Inactive Clients</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="inactive-clients-count">
                    {clientStatusBreakdown.inactive}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Priority Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Task Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-danger-100 text-danger-800 mr-3">High</Badge>
                    <span className="text-sm text-gray-600">High Priority</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="high-priority-tasks-count">
                    {taskPriorityBreakdown.high}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-warning-100 text-warning-800 mr-3">Medium</Badge>
                    <span className="text-sm text-gray-600">Medium Priority</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="medium-priority-tasks-count">
                    {taskPriorityBreakdown.medium}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge className="bg-success-100 text-success-800 mr-3">Low</Badge>
                    <span className="text-sm text-gray-600">Low Priority</span>
                  </div>
                  <span className="text-lg font-semibold" data-testid="low-priority-tasks-count">
                    {taskPriorityBreakdown.low}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Clients</span>
                  <span className="text-lg font-semibold text-primary-600" data-testid="recent-clients-count">
                    {recentActivity.recentClients}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Follow-ups</span>
                  <span className="text-lg font-semibold text-warning-600" data-testid="recent-followups-count">
                    {recentActivity.recentFollowUps}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Tasks</span>
                  <span className="text-lg font-semibold text-success-600" data-testid="recent-tasks-count">
                    {recentActivity.recentTasks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center"
                      data-testid={`upcoming-deadline-${index}`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${
                          item.isOverdue ? 'text-danger-600' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.type.replace('-', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${
                          item.isOverdue ? 'text-danger-600' : 'text-gray-600'
                        }`}>
                          {format(new Date(item.date), "MMM d")}
                        </p>
                        {item.isOverdue && (
                          <p className="text-xs text-danger-600">Overdue</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
