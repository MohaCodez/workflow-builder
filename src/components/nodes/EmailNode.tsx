import { Handle, Position } from 'reactflow';
import { Mail } from 'lucide-react';

export function EmailNode({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold">Email</h3>
      </div>
      <div className="text-sm text-gray-600">
        To: {data.to}
        <br />
        Subject: {data.subject}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}