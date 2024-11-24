import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold">Condition</h3>
      </div>
      <div className="text-sm text-gray-600">
        If {data.field} {data.operator} {data.value}
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="bg-green-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="bg-red-500"
        style={{ left: '75%' }}
      />
    </div>
  );
}