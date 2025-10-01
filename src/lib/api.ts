import { JobApplication, CreateJobApplication, UpdateJobApplication, JobStatus } from '@/types/job';

const API_BASE_URL = '/board';

export const jobApi = {
  // Fetch all job applications
  getAllApplications: async (status?: JobStatus): Promise<JobApplication[]> => {
    const url = status 
      ? `${API_BASE_URL}/applications?status=${status}`
      : `${API_BASE_URL}/applications`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  // Fetch single application
  getApplication: async (id: string): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    return response.json();
  },

  // Create new application
  createApplication: async (data: CreateJobApplication): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
  },

  // Update application (full)
  updateApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
  },

  // Partial update (e.g., status only)
  patchApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to patch application');
    return response.json();
  },

  // Delete application
  deleteApplication: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete application');
  },
};
