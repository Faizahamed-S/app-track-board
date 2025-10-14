import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobApplication } from '@/types/job';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  roleName: z.string().min(1, 'Role name is required'),
  dateOfApplication: z.string().min(1, 'Date is required'),
  status: z.enum(['APPLIED', 'REJECTED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER']),
  jobLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tailored: z.boolean().default(false),
  jobDescription: z.string().optional(),
  referral: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface EditJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
  onSubmit: (id: string, data: FormValues) => void;
}

export const EditJobModal = ({ open, onOpenChange, job, onSubmit }: EditJobModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      roleName: '',
      dateOfApplication: '',
      status: 'APPLIED',
      jobLink: '',
      tailored: false,
      jobDescription: '',
      referral: false,
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        companyName: job.companyName,
        roleName: job.roleName,
        dateOfApplication: job.dateOfApplication.split('T')[0],
        status: job.status,
        jobLink: job.jobLink || '',
        tailored: job.tailored,
        jobDescription: job.jobDescription || '',
        referral: job.referral || false,
      });
    }
  }, [job, form]);

  const handleSubmit = async (data: FormValues) => {
    if (!job) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(job.id, data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
          <DialogDescription>
            Update your job application details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfApplication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Application</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="ONLINE_ASSESSMENT">Online Assessment</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referral"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Referral</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Do you have a referral for this position?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tailored"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Tailored Application</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Did you customize your resume/cover letter?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
