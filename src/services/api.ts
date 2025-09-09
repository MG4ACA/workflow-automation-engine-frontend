/**
 * API Service Layer
 * Handles all communication with the Workflow Automation Engine backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // You can add global error handling here
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    
    return Promise.reject(error);
  }
);

// Types for TypeScript
export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: any;
  createdAt: string;
  updatedAt: string;
  logs?: Log[];
}

export interface Log {
  id: string;
  workflowId: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  message?: string;
  createdAt: string;
  workflow?: {
    id: string;
    name: string;
    trigger: string;
    action: string;
  };
}

export interface CreateWorkflowData {
  name: string;
  trigger: string;
  action: string;
  config: any;
}

export interface TriggerData {
  email?: string;
  name?: string;
  id?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

export interface LogStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  successRate: string;
}

/**
 * Workflow API methods
 */
export const workflowApi = {
  // Create a new workflow
  async create(workflowData: CreateWorkflowData): Promise<ApiResponse<Workflow>> {
    const response = await api.post('/workflows', workflowData);
    return response.data;
  },

  // Get all workflows
  async getAll(): Promise<ApiResponse<Workflow[]>> {
    const response = await api.get('/workflows');
    return response.data;
  },

  // Get workflow by ID
  async getById(id: string): Promise<ApiResponse<Workflow>> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  // Update workflow
  async update(id: string, updateData: Partial<CreateWorkflowData>): Promise<ApiResponse<Workflow>> {
    const response = await api.put(`/workflows/${id}`, updateData);
    return response.data;
  },

  // Delete workflow
  async delete(id: string): Promise<ApiResponse<Workflow>> {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  // Get workflow logs
  async getLogs(id: string): Promise<ApiResponse<Log[]>> {
    const response = await api.get(`/workflows/${id}/logs`);
    return response.data;
  },
};

/**
 * Trigger API methods
 */
export const triggerApi = {
  // Trigger user signup
  async userSignup(userData: TriggerData): Promise<ApiResponse<any>> {
    const response = await api.post('/triggers/userSignup', userData);
    return response.data;
  },

  // Generic trigger
  async generic(triggerName: string, triggerData: any): Promise<ApiResponse<any>> {
    const response = await api.post(`/triggers/${triggerName}`, triggerData);
    return response.data;
  },

  // Test engine connectivity
  async testEngine(): Promise<ApiResponse<any>> {
    const response = await api.get('/triggers/test');
    return response.data;
  },
};

/**
 * Logs API methods
 */
export const logsApi = {
  // Get all logs
  async getAll(options?: {
    limit?: number;
    offset?: number;
    workflowId?: string;
    status?: string;
  }): Promise<ApiResponse<Log[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.workflowId) params.append('workflowId', options.workflowId);
    if (options?.status) params.append('status', options.status);

    const response = await api.get(`/triggers/logs?${params.toString()}`);
    return response.data;
  },

  // Get log statistics
  async getStats(): Promise<ApiResponse<LogStats>> {
    const response = await api.get('/triggers/logs/stats');
    return response.data;
  },
};

/**
 * Health API methods
 */
export const healthApi = {
  // Health check
  async check(): Promise<ApiResponse<any>> {
    const response = await api.get('/health');
    return response.data;
  },
};

// Export default api instance for custom calls
export default api;
