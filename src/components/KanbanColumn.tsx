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
  onViewDetails: (id: string) => void;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-[hsl(var(--status-applied-bg))] border-[hsl(var(--status-applied))]' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-[hsl(var(--status-rejected-bg))] border-[hsl(var(--status-rejected))]' },
  ONLINE_ASSESSMENT: { label: 'Online Assessment', colorClass: 'bg-[hsl(var(--status-online-assessment-bg))] border-[hsl(var(--status-online-assessment))]' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-[hsl(var(--status-interview-bg))] border-[hsl(var(--status-interview))]' },
  OFFER: { label: 'Offer', colorClass: 'bg-[hsl(var(--status-offer-bg))] border-[hsl(var(--status-offer))]' },
};

export const KanbanColumn = ({ status, jobs, onEdit, onDelete, onViewDetails }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ 
    id: status,
    data: {
      type: 'status',
      status: status
    }
  });
  const config = STATUS_CONFIG[status];

  return (
 <div 
   ref={setNodeRef}
   className={`flex flex-col h-full rounded-lg border-2 ${config.colorClass} shadow-sm transition-all duration-200 ${isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'}`}
 >
   <div className="p-4 border-b-2 bg-white/50 dark:bg-gray-900/50">
     <div className="flex items-center justify-between">
       <h3 className="font-semibold text-foreground">{config.label}</h3>
       <Badge variant="secondary" className="ml-2 font-medium">
         {jobs.length}
       </Badge>
     </div>
   </div>

   <div className="flex-1 p-4 space-y-3 min-h-[600px] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
     <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
       <div className="space-y-3">
         {jobs.length === 0 ? (
           <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
             <div className="text-center">
               <p className="text-sm">No applications</p>
               <p className="text-xs mt-1">Drag applications here</p>
             </div>
           </div>
         ) : (
           jobs.map((job) => (
             <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} onViewDetails={onViewDetails} />
           ))
         )}
       </div>
     </SortableContext>
   </div>
 </div>

  );
};
