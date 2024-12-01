import { useEffect, useState } from 'react';
import { Plus, Search, Copy, Trash2, Edit3 } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';

export function WorkflowDashboard() {
  const { workflows, loadWorkflows, addWorkflow, deleteWorkflow, duplicateWorkflow, setCurrentWorkflow } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkflow = () => {
    addWorkflow({
      name: newWorkflowName,
      description: newWorkflowDescription,
    });
    setIsCreateModalOpen(false);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
  };

  const handleEditWorkflow = (workflow: typeof workflows[0]) => {
    setCurrentWorkflow(workflow);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    // Handle Firestore Timestamp
    if (timestamp?.toDate) {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    }
    
    // Handle regular timestamp (number)
    if (typeof timestamp === 'number') {
      return format(new Date(timestamp), 'MMM d, yyyy');
    }
    
    // Handle string or Date object
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{workflow.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{workflow.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>Version {workflow.version}</span>
                  <span>Updated {formatDate(workflow.updatedAt)}</span>
                  <span className={`${
                    !workflow.status ? 'text-gray-500' :
                    workflow.status === 'active' ? 'text-green-500' :
                    workflow.status === 'draft' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {workflow.status ? workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1) : 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateWorkflow(workflow.id)}
                  className="p-2 text-gray-600 hover:text-blue-500 rounded-lg hover:bg-gray-100"
                  title="Duplicate workflow"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="p-2 text-gray-600 hover:text-red-500 rounded-lg hover:bg-gray-100"
                  title="Delete workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditWorkflow(workflow)}
                  className="p-2 text-gray-600 hover:text-green-500 rounded-lg hover:bg-gray-100"
                  title="Edit workflow"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-bold mb-4">Create New Workflow</Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter workflow description"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!newWorkflowName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}