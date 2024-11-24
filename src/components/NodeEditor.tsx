import { Node } from 'reactflow';

interface NodeData {
  label?: string;
  formTitle?: string;
  description?: string;
  fields?: Array<{
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  to?: string;
  subject?: string;
  body?: string;
  approver?: string;
  message?: string;
  field?: string;
  operator?: string;
  value?: string;
  channel?: string;
  recipient?: string;
}

interface NodeEditorProps {
  node: Node<NodeData>;
  onChange: (nodeId: string, data: NodeData) => void;
}

export function NodeEditor({ node, onChange }: NodeEditorProps) {
  const handleChange = (data: any) => {
    onChange(node.id, data);
  };

  switch (node.type) {
    case 'form':
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-4">Edit Form</h3>
          <div className="mb-4">
            <input
              value={node.data.formTitle || ''}
              onChange={(e) => handleChange({ 
                ...node.data, 
                formTitle: e.target.value 
              })}
              placeholder="Form Title"
              className="block w-full p-2 border rounded mb-2"
            />
            <textarea
              value={node.data.description || ''}
              onChange={(e) => handleChange({ 
                ...node.data, 
                description: e.target.value 
              })}
              placeholder="Form Description"
              className="block w-full p-2 border rounded"
              rows={2}
            />
          </div>
          <div className="space-y-4">
            {(node.data.fields || []).map((field: any, index: number) => (
              <div key={index} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Field #{index + 1}</h4>
                  <button
                    onClick={() => {
                      const newFields = [...(node.data.fields || [])];
                      newFields.splice(index, 1);
                      handleChange({ ...node.data, fields: newFields });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    value={field.label || ''}
                    onChange={(e) => {
                      const newFields = [...(node.data.fields || [])];
                      newFields[index] = { ...field, label: e.target.value };
                      handleChange({ ...node.data, fields: newFields });
                    }}
                    placeholder="Field Label"
                    className="block w-full p-2 border rounded"
                  />
                  <select
                    value={field.type || 'text'}
                    onChange={(e) => {
                      const newFields = [...(node.data.fields || [])];
                      newFields[index] = { ...field, type: e.target.value };
                      handleChange({ ...node.data, fields: newFields });
                    }}
                    className="block w-full p-2 border rounded"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone Number</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Multiple Choice</option>
                    <option value="checkbox">Checkboxes</option>
                  </select>
                  
                  {/* Show options editor for select, radio, and checkbox types */}
                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Options</label>
                      {(field.options || []).map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            value={option}
                            onChange={(e) => {
                              const newFields = [...(node.data.fields || [])];
                              const newOptions = [...(field.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              newFields[index] = { ...field, options: newOptions };
                              handleChange({ ...node.data, fields: newFields });
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="block flex-1 p-2 border rounded"
                          />
                          <button
                            onClick={() => {
                              const newFields = [...(node.data.fields || [])];
                              const newOptions = [...(field.options || [])];
                              newOptions.splice(optionIndex, 1);
                              newFields[index] = { ...field, options: newOptions };
                              handleChange({ ...node.data, fields: newFields });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newFields = [...(node.data.fields || [])];
                          const newOptions = [...(field.options || []), ''];
                          newFields[index] = { ...field, options: newOptions };
                          handleChange({ ...node.data, fields: newFields });
                        }}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => {
                          const newFields = [...(node.data.fields || [])];
                          newFields[index] = { ...field, required: e.target.checked };
                          handleChange({ ...node.data, fields: newFields });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newFields = [
                  ...(node.data.fields || []),
                  { label: '', type: 'text', required: false }
                ];
                handleChange({ ...node.data, fields: newFields });
              }}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Field
            </button>
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-4">Edit Email</h3>
          <input
            value={node.data.to || ''}
            onChange={(e) => handleChange({ ...node.data, to: e.target.value })}
            placeholder="To"
            className="block w-full mb-2 p-2 border rounded"
          />
          <input
            value={node.data.subject || ''}
            onChange={(e) => handleChange({ ...node.data, subject: e.target.value })}
            placeholder="Subject"
            className="block w-full mb-2 p-2 border rounded"
          />
          <textarea
            value={node.data.body || ''}
            onChange={(e) => handleChange({ ...node.data, body: e.target.value })}
            placeholder="Email Body"
            className="block w-full p-2 border rounded"
            rows={4}
          />
        </div>
      );

    case 'approval':
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-4">Edit Approval</h3>
          <input
            value={node.data.approver || ''}
            onChange={(e) => handleChange({ ...node.data, approver: e.target.value })}
            placeholder="Approver Email"
            className="block w-full mb-2 p-2 border rounded"
          />
          <textarea
            value={node.data.message || ''}
            onChange={(e) => handleChange({ ...node.data, message: e.target.value })}
            placeholder="Approval Message"
            className="block w-full p-2 border rounded"
            rows={4}
          />
        </div>
      );

    case 'condition':
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-4">Edit Condition</h3>
          <input
            value={node.data.field || ''}
            onChange={(e) => handleChange({ ...node.data, field: e.target.value })}
            placeholder="Field"
            className="block w-full mb-2 p-2 border rounded"
          />
          <select
            value={node.data.operator || '=='}
            onChange={(e) => handleChange({ ...node.data, operator: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
          >
            <option value="==">=</option>
            <option value="!=">≠</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
          </select>
          <input
            value={node.data.value || ''}
            onChange={(e) => handleChange({ ...node.data, value: e.target.value })}
            placeholder="Value"
            className="block w-full p-2 border rounded"
          />
        </div>
      );

    case 'notification':
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-4">Edit Notification</h3>
          <select
            value={node.data.channel || 'email'}
            onChange={(e) => handleChange({ ...node.data, channel: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
          >
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="teams">Teams</option>
            <option value="sms">SMS</option>
          </select>
          <input
            value={node.data.recipient || ''}
            onChange={(e) => handleChange({ ...node.data, recipient: e.target.value })}
            placeholder="Recipient"
            className="block w-full mb-2 p-2 border rounded"
          />
          <textarea
            value={node.data.message || ''}
            onChange={(e) => handleChange({ ...node.data, message: e.target.value })}
            placeholder="Message"
            className="block w-full p-2 border rounded"
            rows={4}
          />
        </div>
      );

    default:
      return <div className="p-4">Select a node to edit its properties</div>;
  }
} 