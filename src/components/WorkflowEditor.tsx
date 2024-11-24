import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  Connection,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerEditor } from './TriggerEditor';
import { Sidebar } from './Sidebar';
import { useWorkflowStore } from '../store/workflowStore';
import { FormNode } from './nodes/FormNode';
import { EmailNode } from './nodes/EmailNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { ConditionNode } from './nodes/ConditionNode';
import { NotificationNode } from './nodes/NotificationNode';
import { ArrowLeft, Save } from 'lucide-react';
import { type Trigger } from '../types/workflow';
import { NodeEditor } from './NodeEditor';
import { nanoid } from 'nanoid';

const nodeTypes = {
  form: FormNode,
  email: EmailNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  notification: NotificationNode,
};

export function WorkflowEditor() {
  const { currentWorkflow, updateWorkflow, setCurrentWorkflow } = useWorkflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(currentWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentWorkflow?.edges || []);
  const [isSaving, setIsSaving] = useState(false);
  const [trigger, setTrigger] = useState<Trigger>(
    currentWorkflow?.trigger || {
      id: nanoid(),
      name: 'Default Trigger',
      type: 'time',
      enabled: false,
      config: {},
    }
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = async () => {
    if (!currentWorkflow) return;
    setIsSaving(true);
    try {
      await updateWorkflow(currentWorkflow.id, {
        ...currentWorkflow,
        nodes,
        edges,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerChange = (newTrigger: Trigger) => {
    if (!currentWorkflow) return;
    
    setTrigger(newTrigger);
    updateWorkflow(currentWorkflow.id, {
      ...currentWorkflow,
      trigger: newTrigger,
    });
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeChange = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentWorkflow(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            snapToGrid={true}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <div className="w-80 border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">
              {selectedNode ? 'Node Editor' : 'Trigger Editor'}
            </h3>
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="text-sm px-3 py-1 text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Trigger
              </button>
            )}
          </div>
          
          {selectedNode ? (
            <NodeEditor 
              node={selectedNode}
              onChange={handleNodeChange}
            />
          ) : (
            currentWorkflow && (
              <TriggerEditor
                trigger={trigger}
                onChange={setTrigger}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}