import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobApplication, JobStatus } from '@/types/job';
import { jobApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditJobModal } from '@/components/EditJobModal';
import { InlineStatusSelect } from '@/components/InlineStatusSelect';
import { Search, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  ONLINE_ASSESSMENT: { label: 'Online Assessment', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  OFFER: { label: 'Offer', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

type SortField = 'companyName' | 'roleName' | 'status' | 'dateOfApplication';
type SortDirection = 'asc' | 'desc';

interface AllApplicationsTableProps {
  applications: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: () => void;
}

export const AllApplicationsTable = ({ 
  applications, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: AllApplicationsTableProps) => {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateOfApplication');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((job) =>
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase();
          bValue = b.companyName.toLowerCase();
          break;
        case 'roleName':
          aValue = a.roleName.toLowerCase();
          bValue = b.roleName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dateOfApplication':
          aValue = new Date(a.dateOfApplication).getTime();
          bValue = new Date(b.dateOfApplication).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (id: string, data: any) => {
    updateMutation.mutate({ id, data });
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by company or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('companyName')}
              >
                Company {getSortIcon('companyName')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('roleName')}
              >
                Position {getSortIcon('roleName')}
              </TableHead>
              <TableHead>Link</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('dateOfApplication')}
              >
                Application Date {getSortIcon('dateOfApplication')}
              </TableHead>
              <TableHead>Tailored</TableHead>
              <TableHead>Referral</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {searchTerm ? 'No applications found matching your search.' : 'No applications found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedApplications.map((job) => (
                <TableRow key={job.id} className="group">
                  <TableCell>
                    <InlineStatusSelect
                      applicationId={job.id}
                      currentStatus={job.status}
                      onStatusChange={onStatusChange}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{job.companyName}</TableCell>
                  <TableCell>{job.roleName}</TableCell>
                  <TableCell>
                    {job.jobLink ? (
                      <Button variant="link" size="sm" asChild>
                        <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(job.dateOfApplication)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.tailored ? (
                      <Badge variant="secondary" className="text-xs">✓ Tailored</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.referral ? (
                      <Badge variant="outline" className="text-xs">👤 Referral</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(job.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <div className="opacity-30 group-hover:opacity-0 transition-opacity duration-200">
                      <span className="text-muted-foreground text-sm">⋮</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={editingJob}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};
