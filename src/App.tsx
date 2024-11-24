import React from 'react';
import { WorkflowDashboard } from './components/WorkflowDashboard';
import { WorkflowEditor } from './components/WorkflowEditor';
import { useWorkflowStore } from './store/workflowStore';

function App() {
  const { currentWorkflow } = useWorkflowStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <h1 className="text-xl font-bold text-gray-800">Workflow Automation</h1>
      </nav>

      {currentWorkflow ? <WorkflowEditor /> : <WorkflowDashboard />}
    </div>
  );
}

export default App;