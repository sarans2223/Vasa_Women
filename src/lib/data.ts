import type { User, Job, LearningModule, Team } from '@/lib/types';

export const mockUser: User = {
  id: '',
  name: '',
  email: '',
  avatarUrl: '',
  skills: [],
  experience: '',
  desiredJobType: '',
  locationPreferences: '',
  industryPreferences: [],
  rating: 0,
  membership: 'Rise',
  vasaPinkTokens: 0,
  mobileNumber: '',
  address: '',
  walletBalance: 0,
};
export const sampleJobs: Job[] = [];
export const mockJobs: Job[] = [];
export const mockLearningModules: LearningModule[] = [];
export const mockTeams: Team[] = [];
export const mockWorkerHistory: any[] = [];
export const mockRecruiterHistory: any[] = [];
export const workerMonetizationData: any = { monthly: [], weekly: [], last_10_days: [] };
export const recruiterMonetizationData: any = { monthly: [], weekly: [], last_10_days: [] };
