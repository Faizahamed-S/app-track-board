import { JobStatus } from '@/types/job';

// Backend enum mapping (matches your Java enum order)
// APPLIED = 0, REJECTED = 1, ONLINE_ASSESSMENT = 2, INTERVIEW = 3, OFFER = 4
export const statusToBackendIndex: Record<JobStatus, number> = {
  APPLIED: 0,
  REJECTED: 1,
  ONLINE_ASSESSMENT: 2,
  INTERVIEW: 3,
  OFFER: 4,
};

// Convert frontend string status to backend integer index
export const toBackendStatus = (status: JobStatus): number => {
  return statusToBackendIndex[status];
};

// Convert backend integer index to frontend string status
export const fromBackendStatus = (index: number): JobStatus => {
  const statusMap: Record<number, JobStatus> = {
    0: 'APPLIED',
    1: 'REJECTED', 
    2: 'ONLINE_ASSESSMENT',
    3: 'INTERVIEW',
    4: 'OFFER',
  };
  
  if (statusMap[index] === undefined) {
    throw new Error(`Invalid status index: ${index}`);
  }
  
  return statusMap[index];
};

// Transform application data for backend (convert status to integer)
export const transformForBackend = (data: any) => {
  console.log('transformForBackend - Input data:', data);
  console.log('transformForBackend - Status value:', data.status, 'Type:', typeof data.status);
  
  if (data.status && typeof data.status === 'string') {
    const mappedStatus = toBackendStatus(data.status as JobStatus);
    console.log('transformForBackend - Mapped status:', mappedStatus);
    return {
      ...data,
      status: mappedStatus
    };
  }
  
  console.log('transformForBackend - No transformation needed, returning:', data);
  return data;
};

// Transform application data from backend (convert status from integer to string)
export const transformFromBackend = (data: any) => {
  if (data.status && typeof data.status === 'number') {
    return {
      ...data,
      status: fromBackendStatus(data.status)
    };
  }
  return data;
};
