
'use client';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { BarChart, CheckCircle, UserPlus, Trash2, Eye, Calendar, Clock, DollarSign, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


const initialJobs: Job[] = [];

type JobStatus = 'Completed' | 'Worker Assigned' | 'Yet To Assign';

type Job = {
    id: string;
    name: string;
    workerNames: string[];
    status: JobStatus;
    location: string;
    date: string;
    time: string;
    pay: string;
};

const statusColors: { [key in JobStatus]: string } = {
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Worker Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
    'Yet To Assign': 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function JobStatusPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client side
    try {
      const storedJobs = localStorage.getItem('panchayatJobs');
      if (storedJobs) {
          const parsedJobs = JSON.parse(storedJobs);
          // Simple validation
          if(Array.isArray(parsedJobs) && parsedJobs.length > 0) {
            setJobs(parsedJobs);
          } else {
            localStorage.setItem('panchayatJobs', JSON.stringify(initialJobs));
            setJobs(initialJobs);
          }
      } else {
          // If nothing is in localStorage, set it with initialJobs
          localStorage.setItem('panchayatJobs', JSON.stringify(initialJobs));
          setJobs(initialJobs);
      }
    } catch (error) {
        console.error("Failed to access localStorage or parse jobs:", error);
        // Fallback to initial jobs if localStorage fails
        setJobs(initialJobs);
    }
  }, []);

  const handleMarkCompleted = (jobId: string, jobName: string) => {
      const updatedJobs = jobs.map(job => 
          job.id === jobId ? { ...job, status: 'Completed' as JobStatus } : job
      );
      setJobs(updatedJobs);
      try {
        localStorage.setItem('panchayatJobs', JSON.stringify(updatedJobs));
      } catch (error) {
        console.error("Failed to update jobs in local storage", error);
      }
      toast({
          title: 'Job Status Updated',
          description: `"${jobName}" has been marked as completed.`
      });
  };

  const handleDeleteJob = (jobId: string, jobName: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    try {
      localStorage.setItem('panchayatJobs', JSON.stringify(updatedJobs));
    } catch (error) {
      console.error("Failed to update jobs in local storage", error);
    }
    toast({
        title: 'Job Deleted',
        description: `The job "${jobName}" has been permanently deleted.`,
        variant: 'destructive',
    });
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const statusOrder: { [key in JobStatus]: number } = {
    'Yet To Assign': 1,
    'Worker Assigned': 2,
    'Completed': 3,
  };

  const sortedJobs = [...jobs].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Job Current Status</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{job.name}</CardTitle>
                  <Badge className={statusColors[job.status]}>
                      {job.status}
                  </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Assigned Workers</h4>
                    {job.workerNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {job.workerNames.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No workers assigned yet.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button asChild size="sm">
                    <Link href="/dashboard/panchayat/assign-worker">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Workers
                    </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id, job.name)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                </Button>
                 {job.status === 'Worker Assigned' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkCompleted(job.id, job.name)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Completed
                    </Button>
                )}
            </CardFooter>
          </Card>
        ))
        ) : (
           <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg col-span-full">
               <h3 className="text-xl font-semibold">No Jobs Available</h3>
               <p className="mt-2">There are currently no job statuses to display.</p>
           </div>
        )}
      </div>

       {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={(isOpen) => !isOpen && setSelectedJob(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedJob.name}</DialogTitle>
              <DialogDescription>
                Job Details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedJob.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">{selectedJob.date}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">{selectedJob.time}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedJob.pay}</span>
                </div>

                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Assigned Workers</h4>
                    {selectedJob.workerNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedJob.workerNames.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No workers assigned to this job yet.</p>
                    )}
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
