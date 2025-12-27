import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Handshake, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface Stats {
  totalClients: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  activeTasks: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
      change: "12% from last month",
      changeIcon: TrendingUp,
      changeColor: "text-success-600",
      testId: "stat-total-clients"
    },
    {
      title: "Pending Follow-ups",
      value: stats?.pendingFollowUps || 0,
      icon: Clock,
      bgColor: "bg-warning-100",
      iconColor: "text-warning-600",
      change: `${stats?.overdueFollowUps || 0} overdue`,
      changeIcon: AlertTriangle,
      changeColor: "text-warning-600",
      testId: "stat-pending-followups"
    },
    {
      title: "Active Tasks",
      value: stats?.activeTasks || 0,
      icon: Handshake,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
      change: "5% from last month",
      changeIcon: TrendingUp,
      changeColor: "text-success-600",
      testId: "stat-active-tasks"
    },
    {
      title: "Monthly Revenue",
      value: "$45,280",
      icon: DollarSign,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
      change: "8% from last month",
      changeIcon: TrendingUp,
      changeColor: "text-success-600",
      testId: "stat-monthly-revenue"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p 
                  data-testid={stat.testId}
                  className="text-2xl font-semibold text-gray-900"
                >
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`flex items-center text-sm ${stat.changeColor}`}>
                <stat.changeIcon className="h-4 w-4 mr-1" />
                <span>{stat.change}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
