/**
 * Workflows Page
 * List workflows in table format with create, edit, and delete functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  EyeIcon,
  PlayIcon,
  WorkflowIcon,
  SearchIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import WorkflowForm from '@/components/WorkflowForm';
import { workflowApi, triggerApi, type Workflow, type CreateWorkflowData } from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load workflows
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowApi.getAll();
      setWorkflows(response.data || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (workflowData: CreateWorkflowData) => {
    try {
      setFormLoading(true);
      await workflowApi.create(workflowData);
      toast.success('Workflow created successfully!');
      setShowForm(false);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditWorkflow = async (workflowData: CreateWorkflowData) => {
    if (!editingWorkflow) return;
    
    try {
      setFormLoading(true);
      await workflowApi.update(editingWorkflow.id, workflowData);
      toast.success('Workflow updated successfully!');
      setEditingWorkflow(null);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
      toast.error('Failed to update workflow');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      return;
    }

    try {
      await workflowApi.delete(workflow.id);
      toast.success('Workflow deleted successfully!');
      loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const handleTriggerWorkflow = async (workflow: Workflow) => {
    try {
      if (workflow.trigger === 'onUserSignup') {
        await triggerApi.userSignup({
          email: 'test@example.com',
          name: 'Test User',
          source: `manual_trigger_${workflow.id}`
        });
        toast.success(`Triggered workflow: ${workflow.name}`);
      } else {
        await triggerApi.generic(workflow.trigger, {
          workflowId: workflow.id,
          source: 'manual_trigger'
        });
        toast.success(`Triggered workflow: ${workflow.name}`);
      }
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      toast.error('Failed to trigger workflow');
    }
  };

  // Filter workflows based on search and status
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.trigger.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    // Filter by last execution status if logs exist
    if (workflow.logs && workflow.logs.length > 0) {
      return matchesSearch && workflow.logs[0].status === filterStatus;
    }
    
    return matchesSearch && filterStatus === 'never_run';
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (workflow: Workflow) => {
    if (!workflow.logs || workflow.logs.length === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Never Run
        </span>
      );
    }

    const lastLog = workflow.logs[0];
    const statusColors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[lastLog.status] || 'bg-gray-100 text-gray-800'
      }`}>
        {lastLog.status.charAt(0).toUpperCase() + lastLog.status.slice(1)}
      </span>
    );
  };

  if (showForm || editingWorkflow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorkflowForm
            onSubmit={editingWorkflow ? handleEditWorkflow : handleCreateWorkflow}
            onCancel={() => {
              setShowForm(false);
              setEditingWorkflow(null);
            }}
            initialData={editingWorkflow}
            isEditing={!!editingWorkflow}
            loading={formLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
              <p className="mt-2 text-gray-600">
                Manage your automation workflows and monitor their execution.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="never_run">Never Run</option>
          </select>
        </div>

        {/* Workflows Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <WorkflowIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {workflows.length === 0 ? 'No workflows yet' : 'No workflows match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {workflows.length === 0 
                  ? 'Create your first workflow to get started with automation.'
                  : 'Try adjusting your search terms or filters.'
                }
              </p>
              {workflows.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Workflow
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trigger → Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {workflow.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {workflow.trigger}
                          </span>
                          →
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                            {workflow.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(workflow)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.logs && workflow.logs.length > 0
                          ? formatDate(workflow.logs[0].createdAt)
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(workflow.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTriggerWorkflow(workflow)}
                            className="text-green-600 hover:text-green-700 p-1 rounded"
                            title="Trigger workflow"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/workflows/${workflow.id}`}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setEditingWorkflow(workflow)}
                            className="text-yellow-600 hover:text-yellow-700 p-1 rounded"
                            title="Edit workflow"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkflow(workflow)}
                            className="text-red-600 hover:text-red-700 p-1 rounded"
                            title="Delete workflow"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
