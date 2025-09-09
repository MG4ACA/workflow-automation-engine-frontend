/**
 * Dashboard Page
 * Main landing page showing overview of the Workflow Automation Engine
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PlayIcon, 
  WorkflowIcon, 
  ZapIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { workflowApi, triggerApi, logsApi, type Workflow, type LogStats } from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load workflows and stats in parallel
      const [workflowsResponse, statsResponse] = await Promise.all([
        workflowApi.getAll(),
        logsApi.getStats()
      ]);

      setWorkflows(workflowsResponse.data || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTrigger = async () => {
    try {
      setTriggering(true);
      
      await triggerApi.userSignup({
        email: 'dashboard-test@example.com',
        name: 'Dashboard Test User',
        source: 'dashboard_quick_trigger'
      });
      
      toast.success('User signup trigger executed successfully!');
      
      // Reload stats after trigger
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } catch (error) {
      console.error('Failed to trigger user signup:', error);
      toast.error('Failed to execute trigger');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your Workflow Automation Engine. Manage workflows, triggers, and monitor executions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <WorkflowIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful Executions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.success || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Executions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.failed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.successRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-4">
                <Link
                  href="/workflows"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <PlusIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">Create New Workflow</p>
                      <p className="text-sm text-blue-700">Set up a new automation workflow</p>
                    </div>
                  </div>
                  <div className="text-blue-600">→</div>
                </Link>

                <button
                  onClick={handleQuickTrigger}
                  disabled={triggering}
                  className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <PlayIcon className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">
                        {triggering ? 'Triggering...' : 'Quick Test Trigger'}
                      </p>
                      <p className="text-sm text-green-700">
                        Simulate a user signup event
                      </p>
                    </div>
                  </div>
                  <div className="text-green-600">
                    {triggering ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    ) : (
                      '→'
                    )}
                  </div>
                </button>

                <Link
                  href="/logs"
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ZapIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-purple-900">View Execution Logs</p>
                      <p className="text-sm text-purple-700">Monitor workflow execution history</p>
                    </div>
                  </div>
                  <div className="text-purple-600">→</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Workflows</h2>
                <Link 
                  href="/workflows"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>
              
              {workflows.length === 0 ? (
                <div className="text-center py-8">
                  <WorkflowIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No workflows created yet</p>
                  <Link
                    href="/workflows"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Workflow
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.slice(0, 5).map((workflow) => (
                    <div 
                      key={workflow.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{workflow.name}</p>
                        <p className="text-sm text-gray-600">
                          {workflow.trigger} → {workflow.action}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workflow.logs && workflow.logs.length > 0 && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            workflow.logs[0].status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : workflow.logs[0].status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {workflow.logs[0].status}
                          </span>
                        )}
                        <Link
                          href={`/workflows/${workflow.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
