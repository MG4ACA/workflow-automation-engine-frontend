/**
 * WorkflowForm Component
 * Dynamic form for creating and editing workflows
 * Adjusts form fields based on selected action type
 */

'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { SaveIcon, XIcon } from 'lucide-react';

// Available triggers and actions as defined in the backend
const TRIGGERS = [
  {
    value: 'onUserSignup',
    label: 'User Signup',
    description: 'Triggered when a new user signs up'
  }
];

const ACTIONS = [
  {
    value: 'sendEmail',
    label: 'Send Email',
    description: 'Send an email notification',
    configFields: [
      { name: 'to', label: 'To Email', type: 'email', placeholder: 'user@example.com' },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome!' },
      { name: 'body', label: 'Message Body', type: 'textarea', placeholder: 'Email content...' }
    ]
  },
  {
    value: 'insertRow',
    label: 'Insert Row',
    description: 'Insert data into a table',
    configFields: [
      { name: 'table', label: 'Table Name', type: 'text', placeholder: 'logs' },
      { name: 'data', label: 'Data (JSON)', type: 'textarea', placeholder: '{"key": "value"}' }
    ]
  },
  {
    value: 'writeLog',
    label: 'Write Log',
    description: 'Write a custom log entry',
    configFields: [
      { name: 'message', label: 'Log Message', type: 'text', placeholder: 'Custom log message' },
      { name: 'status', label: 'Status', type: 'select', options: ['success', 'pending', 'failed'] }
    ]
  },
  {
    value: 'saveFile',
    label: 'Save File',
    description: 'Save data to a file (Mock S3)',
    configFields: [
      { name: 'fileName', label: 'File Name', type: 'text', placeholder: 'data.json' },
      { name: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'default-bucket' },
      { name: 'content', label: 'File Content', type: 'textarea', placeholder: 'File content...' }
    ]
  },
  {
    value: 'chainWorkflow',
    label: 'Chain Workflow',
    description: 'Trigger another workflow',
    configFields: [
      { name: 'workflowId', label: 'Target Workflow ID', type: 'text', placeholder: 'workflow-id' },
      { name: 'delay', label: 'Delay (ms)', type: 'number', placeholder: '0' }
    ]
  }
];

interface WorkflowFormProps {
  onSubmit: (workflowData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  loading?: boolean;
}

export default function WorkflowForm({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  isEditing = false,
  loading = false 
}: WorkflowFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    trigger: initialData?.trigger || 'onUserSignup',
    action: initialData?.action || '',
    config: initialData?.config || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAction = ACTIONS.find(action => action.value === formData.action);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    }
    
    if (!formData.action) {
      newErrors.action = 'Please select an action';
    }

    // Validate config fields
    if (selectedAction?.configFields) {
      selectedAction.configFields.forEach(field => {
        if (field.name === 'data') {
          // Validate JSON for data field
          if (formData.config[field.name]) {
            try {
              JSON.parse(formData.config[field.name]);
            } catch {
              newErrors[`config.${field.name}`] = 'Invalid JSON format';
            }
          }
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the form errors');
      return;
    }

    try {
      // Process config data
      const processedConfig = { ...formData.config };
      
      // Parse JSON fields
      if (selectedAction?.configFields) {
        selectedAction.configFields.forEach(field => {
          if (field.name === 'data' && processedConfig[field.name]) {
            try {
              processedConfig[field.name] = JSON.parse(processedConfig[field.name]);
            } catch {
              // Keep as string if parsing fails
            }
          }
          
          // Convert number fields
          if (field.type === 'number' && processedConfig[field.name]) {
            processedConfig[field.name] = parseInt(processedConfig[field.name]);
          }
        });
      }

      await onSubmit({
        ...formData,
        config: processedConfig
      });
      
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleConfigChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [fieldName]: value
      }
    }));
    
    // Clear related errors
    if (errors[`config.${fieldName}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`config.${fieldName}`];
        return newErrors;
      });
    }
  };

  const renderConfigField = (field: any) => {
    const value = formData.config[field.name] || '';
    const error = errors[`config.${field.name}`];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
        
      default:
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure your workflow trigger, action, and settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Workflow Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            placeholder="Enter workflow name..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Trigger Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Trigger
          </label>
          <select
            value={formData.trigger}
            onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {TRIGGERS.map(trigger => (
              <option key={trigger.value} value={trigger.value}>
                {trigger.label} - {trigger.description}
              </option>
            ))}
          </select>
        </div>

        {/* Action Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Action
          </label>
          <select
            value={formData.action}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                action: e.target.value,
                config: {} // Reset config when action changes
              }));
              if (errors.action) {
                setErrors(prev => ({ ...prev, action: '' }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.action ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select an action...</option>
            {ACTIONS.map(action => (
              <option key={action.value} value={action.value}>
                {action.label} - {action.description}
              </option>
            ))}
          </select>
          {errors.action && <p className="text-sm text-red-600">{errors.action}</p>}
        </div>

        {/* Dynamic Configuration Fields */}
        {selectedAction && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {selectedAction.label} Configuration
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {selectedAction.configFields.map(renderConfigField)}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <XIcon className="h-4 w-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              <div className="flex items-center">
                <SaveIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Workflow' : 'Create Workflow'}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
