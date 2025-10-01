import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { JobApplication, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-[hsl(var(--status-applied-bg))] border-[hsl(var(--status-applied))]' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-[hsl(var(--status-interview-bg))] border-[hsl(var(--status-interview))]' },
  OFFER: { label: 'Offer', colorClass: 'bg-[hsl(var(--status-offer-bg))] border-[hsl(var(--status-offer))]' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-[hsl(var(--status-rejected-bg))] border-[hsl(var(--status-rejected))]' },
};

export const KanbanColumn = ({ status, jobs, onEdit, onDelete }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col h-full">
      <div className={`rounded-t-lg border-2 border-b-0 ${config.colorClass} p-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{config.label}</h3>
          <Badge variant="secondary" className="ml-2">
            {jobs.length}
          </Badge>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 bg-muted/30 rounded-b-lg border-2 border-t-0 border-border p-4 space-y-3 min-h-[500px] overflow-y-auto"
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
