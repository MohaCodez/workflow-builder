import { FormInput, Mail, GitBranch, CheckCircle, Bell } from 'lucide-react';

const nodeTypes = [
  {
    type: 'form',
    label: 'Form Input',
    icon: FormInput,
    color: 'text-blue-500',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    color: 'text-green-500',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    color: 'text-yellow-500',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: CheckCircle,
    color: 'text-purple-500',
  },
  {
    type: 'notification',
    label: 'Notification',
    icon: Bell,
    color: 'text-red-500',
  },
];

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Workflow Nodes</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <node.icon className={`w-5 h-5 ${node.color}`} />
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}