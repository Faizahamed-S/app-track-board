export type JobStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id: string;
  companyName: string;
  roleName: string;
  dateOfApplication: string;
  jobLink?: string;
  tailored: boolean;
  jobDescription?: string;
  referral?: string;
  status: JobStatus;
}

export interface CreateJobApplication extends Omit<JobApplication, 'id'> {}

export interface UpdateJobApplication extends Partial<Omit<JobApplication, 'id'>> {}
