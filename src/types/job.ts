export type JobStatus = 'APPLIED' | 'REJECTED' | 'ONLINE_ASSESSMENT' | 'INTERVIEW' | 'OFFER';
export interface JobApplication {
  id: string;
  companyName: string;
  roleName: string;
  dateOfApplication: string;
  jobLink?: string;
  tailored: boolean;
  jobDescription?: string;
  referral?: boolean;
  status: JobStatus;
}

export interface CreateJobApplication extends Omit<JobApplication, 'id'> {}

export interface UpdateJobApplication extends Partial<Omit<JobApplication, 'id'>> {}
