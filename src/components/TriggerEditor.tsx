// import React from 'react';
import { Clock, Webhook, Zap } from 'lucide-react';
import { Trigger } from '../types/workflow';

interface TriggerEditorProps {
  trigger: Trigger;
  onChange: (trigger: Trigger) => void;
}

export function TriggerEditor({ trigger, onChange }: TriggerEditorProps) {
  const handleTypeChange = (type: Trigger['type']) => {
    onChange({
      ...trigger,
      type,
      config: {},
    });
  };

  const handleConfigChange = (config: Partial<typeof trigger.config>) => {
    onChange({
      ...trigger,
      config: {
        ...trigger.config,
        ...config,
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Trigger Configuration</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleTypeChange('time')}
              className={`p-4 rounded-lg border ${
                trigger.type === 'time'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <Clock className="w-6 h-6 mb-2 mx-auto text-blue-500" />
              <span className="block text-sm">Time-based</span>
            </button>
            <button
              onClick={() => handleTypeChange('event')}
              className={`p-4 rounded-lg border ${
                trigger.type === 'event'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <Zap className="w-6 h-6 mb-2 mx-auto text-yellow-500" />
              <span className="block text-sm">Event-based</span>
            </button>
            <button
              onClick={() => handleTypeChange('webhook')}
              className={`p-4 rounded-lg border ${
                trigger.type === 'webhook'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <Webhook className="w-6 h-6 mb-2 mx-auto text-purple-500" />
              <span className="block text-sm">Webhook</span>
            </button>
          </div>
        </div>

        {trigger.type === 'time' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule (Cron Expression)
              </label>
              <input
                type="text"
                value={trigger.config.schedule || ''}
                onChange={(e) => handleConfigChange({ schedule: e.target.value })}
                placeholder="*/5 * * * *"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Example: */5 * * * * (every 5 minutes)
              </p>
            </div>
          </div>
        )}

        {trigger.type === 'event' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={trigger.config.eventType || ''}
                onChange={(e) => handleConfigChange({ eventType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an event type</option>
                <option value="user.created">User Created</option>
                <option value="order.placed">Order Placed</option>
                <option value="payment.received">Payment Received</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions
              </label>
              {(trigger.config.conditions || []).map((condition, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={condition.field}
                    onChange={(e) => {
                      const newConditions = [...(trigger.config.conditions || [])];
                      newConditions[index].field = e.target.value;
                      handleConfigChange({ conditions: newConditions });
                    }}
                    placeholder="Field"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={condition.operator}
                    onChange={(e) => {
                      const newConditions = [...(trigger.config.conditions || [])];
                      newConditions[index].operator = e.target.value;
                      handleConfigChange({ conditions: newConditions });
                    }}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="equals">equals</option>
                    <option value="contains">contains</option>
                    <option value="greater_than">greater than</option>
                    <option value="less_than">less than</option>
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => {
                      const newConditions = [...(trigger.config.conditions || [])];
                      newConditions[index].value = e.target.value;
                      handleConfigChange({ conditions: newConditions });
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newConditions = [
                    ...(trigger.config.conditions || []),
                    { field: '', operator: 'equals', value: '' },
                  ];
                  handleConfigChange({ conditions: newConditions });
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                + Add Condition
              </button>
            </div>
          </div>
        )}

        {trigger.type === 'webhook' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="text"
              value={trigger.config.webhookUrl || ''}
              onChange={(e) => handleConfigChange({ webhookUrl: e.target.value })}
              placeholder="https://api.example.com/webhook"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm font-medium text-gray-700">Enable Trigger</span>
          <button
            onClick={() => onChange({ ...trigger, enabled: !trigger.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              trigger.enabled ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                trigger.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}