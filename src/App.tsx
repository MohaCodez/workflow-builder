import React, { Suspense } from 'react';
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

      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary>
          {currentWorkflow ? <WorkflowEditor /> : <WorkflowDashboard />}
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2>Something went wrong.</h2>
          <pre className="mt-2 text-red-500">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;