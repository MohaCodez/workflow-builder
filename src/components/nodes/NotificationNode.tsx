import { Handle, Position } from 'reactflow';
import { Bell } from 'lucide-react';

export function NotificationNode({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold">Notification</h3>
      </div>
      <div className="text-sm text-gray-600">
        Channel: {data.channel}
        <br />
        Message: {data.message}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}