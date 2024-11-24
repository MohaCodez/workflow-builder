import { Handle, Position } from 'reactflow';
import { FormInput } from 'lucide-react';

export function FormNode({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <FormInput className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Form Input</h3>
      </div>
      <div className="space-y-2">
        {data.fields?.map((field: any, index: number) => (
          <div key={index} className="text-sm text-gray-600">
            {field.label}: {field.type}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}