import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Users,
  CheckSquare,
  BarChart3,
  UserPlus,
  CalendarPlus,
  FileText,
  Menu,
  ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(true);
  const navigation = [
    { name: "Analytics", href: "/", icon: BarChart3 },
    // { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Clients", href: "/clients", icon: Users },
    // { name: "Follow-ups", href: "/follow-ups", icon: Calendar },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    // { name: "Reports", href: "/reports", icon: FileText },
    // { name: "Export", href: "/export", icon: Download },
  ];

  return (
    <div className={cn("h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300", open ? "w-64" : "w-16")}>


      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">Supermarket Analytics</span>
          </div>
          <button onClick={() => setOpen(!open)} className="p-1 rounded hover:bg-gray-100"> 
            Menu {open ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary-600" : "text-gray-400"
                      )} 
                    />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 px-3">
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-primary-800">Quick Actions</h3>
              <div className="mt-3 space-y-2">
                <Link href="/clients">
                  <a 
                    data-testid="quick-add-client"
                    className="w-full text-left text-xs text-primary-700 hover:text-primary-800 flex items-center"
                  >
                    <UserPlus className="h-3 w-3 mr-2" />
                    Add New Client
                  </a>
                </Link>
                <Link href="/follow-ups">
                  <a 
                    data-testid="quick-schedule-followup"
                    className="w-full text-left text-xs text-primary-700 hover:text-primary-800 flex items-center"
                  >
                    <CalendarPlus className="h-3 w-3 mr-2" />
                    Schedule Follow-up
                  </a>
                </Link>
                <Link href="/export">
                  <a 
                    data-testid="quick-export-data"
                    className="w-full text-left text-xs text-primary-700 hover:text-primary-800 flex items-center"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Export Data
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
