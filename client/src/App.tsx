import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import FollowUps from "@/pages/follow-ups";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Export from "@/pages/export";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Analytics} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/follow-ups" component={FollowUps} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/reports" component={Reports} />
          <Route path="/export" component={Export} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
