import { useState } from "react";
import { Plus } from "lucide-react";
import TopBar from "@/components/layout/topbar";
import ClientTable from "@/components/clients/client-table";
import ClientForm from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <TopBar title="Clients" onSearch={setSearchQuery} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Client Management
            </h2>
            <p className="text-gray-600">
              Manage your client relationships and contact information
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            data-testid="add-client-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <ClientTable searchQuery={searchQuery} />
      </main>

      {/* Add Client Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ClientForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}
    </>
  );
}
