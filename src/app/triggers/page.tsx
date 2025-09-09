/**
 * Triggers Page
 * Simulate workflow triggers and test the automation engine
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  ZapIcon, 
  UserPlusIcon,
  HistoryIcon,
  CheckCircleIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { triggerApi, workflowApi, type Workflow } from '@/services/api';
import { toast } from 'react-hot-toast';

interface TriggerHistoryItem {
  id: number;
  trigger: string;
  data: {
    email?: string;
    name?: string;
    source?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  response: unknown;
}

export default function TriggersPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerHistory, setTriggerHistory] = useState<TriggerHistoryItem[]>([]);

  // User signup form data
  const [userSignupData, setUserSignupData] = useState({
    email: '',
    name: '',
    source: 'manual_trigger'
  });

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

  const handleUserSignupTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userSignupData.email || !userSignupData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setTriggering(true);
      
      const triggerData = {
        ...userSignupData,
        id: `user-${Date.now()}`,
        signupTime: new Date().toISOString()
      };

      const response = await triggerApi.userSignup(triggerData);
      
      toast.success('User signup trigger executed successfully!');
      
      // Add to trigger history
      const newHistoryItem = {
        id: Date.now(),
        trigger: 'onUserSignup',
        data: triggerData,
        timestamp: new Date().toISOString(),
        response: response
      };
      
      setTriggerHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      // Reset form
      setUserSignupData({
        email: '',
        name: '',
        source: 'manual_trigger'
      });
      
    } catch (error) {
      console.error('Failed to trigger user signup:', error);
      toast.error('Failed to execute trigger');
    } finally {
      setTriggering(false);
    }
  };

  const handleQuickTrigger = async (sampleData: Record<string, unknown>, triggerType: string) => {
    try {
      setTriggering(true);
      
      let response;
      if (triggerType === 'userSignup') {
        response = await triggerApi.userSignup(sampleData);
      } else {
        response = await triggerApi.generic(triggerType, sampleData);
      }
      
      toast.success(`${triggerType} trigger executed successfully!`);
      
      // Add to trigger history
      const newHistoryItem = {
        id: Date.now(),
        trigger: triggerType,
        data: sampleData,
        timestamp: new Date().toISOString(),
        response: response
      };
      
      setTriggerHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error(`Failed to trigger ${triggerType}:`, error);
      toast.error(`Failed to execute ${triggerType} trigger`);
    } finally {
      setTriggering(false);
    }
  };

  const userSignupWorkflows = workflows.filter(w => w.trigger === 'onUserSignup');

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
          <h1 className="text-3xl font-bold text-gray-900">Triggers</h1>
          <p className="mt-2 text-gray-600">
            Simulate workflow triggers to test your automation engine. All matching workflows will be executed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trigger Forms */}
          <div className="space-y-6">
            {/* User Signup Trigger */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <UserPlusIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">User Signup Trigger</h2>
                  <p className="text-sm text-gray-600">
                    Simulate a new user registration event
                  </p>
                </div>
              </div>

              {userSignupWorkflows.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{userSignupWorkflows.length}</strong> workflow(s) will be triggered:
                  </p>
                  <ul className="mt-1 text-xs text-blue-700">
                    {userSignupWorkflows.map(w => (
                      <li key={w.id}>• {w.name} ({w.action})</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleUserSignupTrigger} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userSignupData.email}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userSignupData.name}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    value={userSignupData.source}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="manual_trigger">Manual Trigger</option>
                    <option value="website">Website</option>
                    <option value="mobile_app">Mobile App</option>
                    <option value="api">API</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={triggering}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {triggering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Triggering...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Trigger User Signup
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Triggers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ZapIcon className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quick Test Triggers</h2>
                  <p className="text-sm text-gray-600">
                    Pre-configured test scenarios
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleQuickTrigger({
                    email: 'test.user@example.com',
                    name: 'Test User',
                    source: 'quick_test',
                    plan: 'free'
                  }, 'userSignup')}
                  disabled={triggering}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900">Free Plan User Signup</div>
                  <div className="text-sm text-gray-600">test.user@example.com</div>
                </button>

                <button
                  onClick={() => handleQuickTrigger({
                    email: 'premium.user@example.com',
                    name: 'Premium User',
                    source: 'quick_test',
                    plan: 'premium'
                  }, 'userSignup')}
                  disabled={triggering}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900">Premium User Signup</div>
                  <div className="text-sm text-gray-600">premium.user@example.com</div>
                </button>
              </div>
            </div>
          </div>

          {/* Trigger History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <HistoryIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Triggers</h2>
                <p className="text-sm text-gray-600">
                  History of executed triggers
                </p>
              </div>
            </div>

            {triggerHistory.length === 0 ? (
              <div className="text-center py-8">
                <ZapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No triggers executed yet</p>
                <p className="text-sm text-gray-400">Execute a trigger to see the history</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {triggerHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium text-gray-900">{item.trigger}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.data.email && (
                        <div>Email: {item.data.email}</div>
                      )}
                      {item.data.name && (
                        <div>Name: {item.data.name}</div>
                      )}
                      {item.data.source && (
                        <div>Source: {item.data.source}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
