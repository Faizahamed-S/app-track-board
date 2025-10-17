import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { ArrowLeft, Search, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  ONLINE_ASSESSMENT: { label: 'Online Assessment', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  OFFER: { label: 'Offer', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

type SortField = 'companyName' | 'roleName' | 'dateOfApplication';
type SortDirection = 'asc' | 'desc';

const StatusApplicationsPage = () => {
  const { status } = useParams<{ status: JobStatus }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateOfApplication');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch applications by status
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications-by-status', status],
    queryFn: () => jobApi.getApplicationsByStatus(status!),
    enabled: !!status,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jobApi.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-by-status', status] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete application');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-by-status', status] });
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = (id: string, data: any) => {
    updateMutation.mutate({ id, data });
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const handleStatusChange = () => {
    // Refresh the data when status changes
    queryClient.invalidateQueries({ queryKey: ['applications-by-status', status] });
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

  if (!status || !STATUS_CONFIG[status as JobStatus]) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Kanban Board
            </Button>
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Status</h1>
            <p className="text-muted-foreground">The requested status page could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[status];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Kanban Board
            </Button>
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Applications</h1>
            <p className="text-muted-foreground">Failed to load applications. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Kanban Board
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {statusConfig.label} Applications
              </h1>
              <p className="text-muted-foreground">
                {filteredAndSortedApplications.length} application{filteredAndSortedApplications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Badge className={`${statusConfig.colorClass} text-lg font-medium px-4 py-2`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('companyName')}
                >
                  Status {getSortIcon('companyName')}
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
                        onStatusChange={handleStatusChange}
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
                          onClick={() => handleDelete(job.id)}
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
    </div>
  );
};

export default StatusApplicationsPage;
