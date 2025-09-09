/**
 * Logs Page
 * View workflow execution logs and system activity
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  ActivityIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  FilterIcon,
  RefreshCwIcon,
  SearchIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { logsApi, type Log } from '@/services/api';
import { toast } from 'react-hot-toast';

type LogLevel = 'success' | 'failed' | 'pending';

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load logs
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await logsApi.getAll();
      setLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadLogs();
      toast.success('Logs refreshed');
    } catch (error) {
      toast.error('Failed to refresh logs');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter logs based on status and search term
  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.status === filter;
    const matchesSearch = !searchTerm || 
      (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.workflowId?.toString().includes(searchTerm) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getLogIcon = (status: string) => {
    switch (status) {
      case 'failed':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLogBgColor = (status: string) => {
    switch (status) {
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getLogCount = (status: LogLevel | 'all') => {
    if (status === 'all') return logs.length;
    return logs.filter(log => log.status === status).length;
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="mt-2 text-gray-600">
              Monitor workflow executions and system activity
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Logs ({getLogCount('all')})</option>
                    <option value="success">Success ({getLogCount('success')})</option>
                    <option value="pending">Pending ({getLogCount('pending')})</option>
                    <option value="failed">Failed ({getLogCount('failed')})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ActivityIcon className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{getLogCount('all')}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{getLogCount('success')}</div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{getLogCount('pending')}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertCircleIcon className="h-6 w-6 text-red-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{getLogCount('failed')}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' ? 'No logs match your filters' : 'No logs available'}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Execute some workflows to see logs appear here'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className={`p-4 hover:bg-gray-50 transition-colors ${getLogBgColor(log.status)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.action && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                {log.action}
                              </span>
                            )}
                            {log.message || `Workflow executed with status: ${log.status}`}
                          </p>
                          
                          {log.workflowId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Workflow ID: {log.workflowId}
                            </p>
                          )}

                          {log.workflow && (
                            <p className="text-xs text-gray-500 mt-1">
                              Workflow: {log.workflow.name} ({log.workflow.trigger} → {log.workflow.action})
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredLogs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        )}
      </div>
    </div>
  );
}
