import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobStatus } from '@/types/job';
import { jobApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  ONLINE_ASSESSMENT: { label: 'Online Assessment', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  OFFER: { label: 'Offer', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

interface InlineStatusSelectProps {
  applicationId: string;
  currentStatus: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
}

export const InlineStatusSelect = ({ 
  applicationId, 
  currentStatus, 
  onStatusChange 
}: InlineStatusSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusConfig = STATUS_CONFIG[currentStatus];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      jobApi.patchApplication(id, { status }),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['applications-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      
      toast.success('Status updated successfully!');
      onStatusChange?.(variables.status);
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      updateMutation.mutate({ 
        id: applicationId, 
        status: newStatus as JobStatus 
      });
    }
    setIsOpen(false);
  };

  const allStatuses: JobStatus[] = ['APPLIED', 'REJECTED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER'];

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${statusConfig.colorClass} text-sm font-medium px-3 py-1 rounded-full`}>
        {statusConfig.label}
      </Badge>
      
      <Select 
        value={currentStatus} 
        onValueChange={handleStatusChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-0 h-0 p-0 border-0 opacity-0 absolute -z-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allStatuses.map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.colorClass.split(' ')[0] || 'bg-gray-100'}`} />
                  {config.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <button
        onClick={() => setIsOpen(true)}
        className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        disabled={updateMutation.isPending}
      >
        <svg 
          className="w-4 h-4 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};
