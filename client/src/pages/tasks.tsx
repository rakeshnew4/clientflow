import { useState } from "react";
import { Plus } from "lucide-react";
import TopBar from "@/components/layout/topbar";
import TaskList from "@/components/tasks/task-list";
import TaskForm from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";

export default function Tasks() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <>
      <TopBar title="Tasks" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Task Management
            </h2>
            <p className="text-gray-600">
              Create and manage tasks for your clients and projects
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            data-testid="add-task-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        <TaskList />
      </main>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TaskForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}
    </>
  );
}
