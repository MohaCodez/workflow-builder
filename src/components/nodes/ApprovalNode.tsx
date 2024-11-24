import { Handle, Position } from 'reactflow';
import { CheckCircle } from 'lucide-react';

export function ApprovalNode({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold">Approval</h3>
      </div>
      <div className="text-sm text-gray-600">
        Approver: {data.approver}
        <br />
        Level: {data.level}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}