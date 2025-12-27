import TopBar from "@/components/layout/topbar";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentClients from "@/components/dashboard/recent-clients";
import UpcomingFollowUps from "@/components/dashboard/upcoming-follow-ups";
import RecentTasks from "@/components/dashboard/recent-tasks";

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentClients />
          
          <div className="space-y-6">
            <UpcomingFollowUps />
            <RecentTasks />
          </div>
        </div>
      </main>
    </>
  );
}
