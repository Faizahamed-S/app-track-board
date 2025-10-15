import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, ExternalLink, Edit2, Trash2, CheckCircle2, User, Building, Briefcase } from 'lucide-react';
import { JobApplication, JobStatus } from '@/types/job';
import { jobApi } from '@/lib/api';

interface ApplicationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; colorClass: string }> = {
  APPLIED: { label: 'Applied', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  REJECTED: { label: 'Rejected', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  ONLINE_ASSESSMENT: { label: 'Online Assessment', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  INTERVIEW: { label: 'Interview', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  OFFER: { label: 'Offer', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

export const ApplicationDetailModal = ({ 
  open, 
  onOpenChange, 
  applicationId, 
  onEdit, 
  onDelete 
}: ApplicationDetailModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch application details
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => jobApi.getApplication(applicationId!),
    enabled: !!applicationId && open,
  });

  const handleEdit = () => {
    if (application) {
      onEdit(application);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(application.id);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = application 
    ? new Date(application.dateOfApplication).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Application Details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !application) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Application</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>Failed to load application details.</p>
            <p className="text-sm mt-2">Please try again later.</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            Application Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{application.companyName}</h2>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg text-muted-foreground">{application.roleName}</span>
                </div>
              </div>
              <Badge className={`${statusConfig.colorClass} text-sm font-medium px-3 py-1`}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Date and Status Info */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Applied on {formattedDate}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Application Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-foreground">{application.companyName}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-foreground">{application.roleName}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={statusConfig.colorClass}>{statusConfig.label}</Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                <p className="text-foreground">{formattedDate}</p>
              </div>
            </div>

            {/* Job Link */}
            {application.jobLink && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Posting</label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  asChild
                >
                  <a
                    href={application.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Original Job Posting
                  </a>
                </Button>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2">
                {application.tailored && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Tailored Application
                  </Badge>
                )}
                {application.referral && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Referral
                  </Badge>
                )}
              </div>
            </div>

            {/* Job Description */}
            {application.jobDescription && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Description</label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{application.jobDescription}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            
            {application.jobLink && (
              <Button 
                variant="outline" 
                asChild
                className="w-full sm:w-auto"
              >
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Job Posting
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="w-full sm:w-auto"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Application
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Deleting...' : 'Delete Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
