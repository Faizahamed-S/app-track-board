import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { JobApplication, JobStatus } from '@/types/job';
import { jobApi } from '@/lib/api';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';
import { AddJobModal } from './AddJobModal';
import { EditJobModal } from './EditJobModal';
import { PaginationControls } from './PaginationControls';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: JobStatus[] = ['APPLIED', 'REJECTED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER'];

// Debug: Log STATUSES array to check for issues
console.log('STATUSES array:', STATUSES);
console.log('STATUSES length:', STATUSES.length);
console.log('STATUSES indices:', STATUSES.map((status, index) => `${index}: ${status}`));

export const JobKanbanBoard = () => {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch all applications with pagination
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['job-applications', currentPage, itemsPerPage],
    queryFn: () => jobApi.getAllApplications(undefined, currentPage, itemsPerPage),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: jobApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application added successfully!');
    },
    onError: () => {
      toast.error('Failed to add application');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update application');
    },
  });

  // Patch mutation (for status changes)
  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.patchApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Status updated!');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jobApi.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted');
    },
    onError: () => {
      toast.error('Failed to delete application');
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const job = applications.find((j) => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    console.log('Drag and Drop - Active ID:', active.id);
    console.log('Drag and Drop - Over ID:', over?.id);
    console.log('Drag and Drop - Over Data:', over?.data);

    if (!over) {
      console.log('Drag and Drop - No valid drop target');
      return;
    }

    const jobId = active.id as string;
    const overId = over.id as string;

    // Validate that the drop target is a valid status, not a job ID
    const validStatuses = ['APPLIED', 'REJECTED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER'];
    if (!validStatuses.includes(overId)) {
      console.log('Drag and Drop - Invalid drop target (not a status):', overId);
      return;
    }

    const newStatus = overId as JobStatus;

    console.log('Drag and Drop - Job ID:', jobId);
    console.log('Drag and Drop - New Status:', newStatus, 'Type:', typeof newStatus);

    const job = applications.find((j) => j.id === jobId);
    if (!job) {
      console.log('Drag and Drop - Job not found:', jobId);
      return;
    }

    if (job.status === newStatus) {
      console.log('Drag and Drop - Same status, no update needed');
      return;
    }

    console.log('Drag and Drop - Current job status:', job.status);
    console.log('Drag and Drop - New status:', newStatus);
    console.log('Drag and Drop - Patching with data:', { status: newStatus });

    // Optimistic update
    queryClient.setQueryData(['job-applications', currentPage, itemsPerPage], (old: JobApplication[]) =>
      old.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    patchMutation.mutate({ id: jobId, data: { status: newStatus } });
  };

  const handleAddJob = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEditJob = (id: string, data: any) => {
    updateMutation.mutate({ id, data });
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const getJobsByStatus = (status: JobStatus) =>
    applications.filter((job) => job.status === status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Application Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Manage your job search with drag-and-drop simplicity
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Application
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={getJobsByStatus(status)}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>

          <DragOverlay>
            {activeJob ? (
              <div className="rotate-3 scale-105">
                <JobCard
                  job={activeJob}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddJobModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddJob}
      />

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={editingJob}
        onSubmit={handleEditJob}
      />

      {/* Pagination Controls */}
      {applications.length > 0 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(applications.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={applications.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};
