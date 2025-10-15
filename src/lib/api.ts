import { JobApplication, CreateJobApplication, UpdateJobApplication, JobStatus } from '@/types/job';
import { transformForBackend, transformFromBackend } from './statusMapper';

// Base URL stops at /board
const API_BASE_URL = 'http://localhost:8080/board';

export const jobApi = {
  // Fetch all job applications
  getAllApplications: async (status?: JobStatus, page = 1, limit = 100): Promise<JobApplication[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/applications?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch applications');
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Fetch single application
  getApplication: async (id: string): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Fetch applications by status
  getApplicationsByStatus: async (status: JobStatus): Promise<JobApplication[]> => {
    const response = await fetch(`${API_BASE_URL}/applications/status/${status}`);
    if (!response.ok) throw new Error('Failed to fetch applications by status');
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Create new application
  createApplication: async (data: CreateJobApplication): Promise<JobApplication> => {
    console.log('Creating application with data:', data);
    console.log('Status being sent:', data.status, 'Type:', typeof data.status);
    
    const transformedData = transformForBackend(data);
    console.log('Transformed data for backend:', transformedData);
    console.log('Transformed status:', transformedData.status, 'Type:', typeof transformedData.status);
    
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to create application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Update application (full)
  updateApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    const transformedData = transformForBackend(data);
    
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to update application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Partial update (PATCH)
  patchApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    console.log('Patching application with data:', data);
    console.log('Status being sent:', data.status, 'Type:', typeof data.status);
    
    const transformedData = transformForBackend(data);
    console.log('Transformed data for backend:', transformedData);
    console.log('Transformed status:', transformedData.status, 'Type:', typeof transformedData.status);
    
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to patch application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Delete application
  deleteApplication: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete application');
  },
};