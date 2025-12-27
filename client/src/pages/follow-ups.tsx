import { useState } from "react";
import { Plus } from "lucide-react";
import TopBar from "@/components/layout/topbar";
import FollowUpList from "@/components/follow-ups/follow-up-list";
import FollowUpForm from "@/components/follow-ups/follow-up-form";
import { Button } from "@/components/ui/button";

export default function FollowUps() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <>
      <TopBar title="Follow-ups" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Follow-up Management
            </h2>
            <p className="text-gray-600">
              Schedule and track follow-ups with your clients
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            data-testid="add-followup-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>

        <FollowUpList />
      </main>

      {/* Add Follow-up Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <FollowUpForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}
    </>
  );
}
