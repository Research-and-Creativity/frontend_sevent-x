export type UserRole = "PESERTA" | "JURI" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  institution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  registrationFee: number;
  maxTeamMembers: number;
  status: "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED";
  bannerUrl?: string | null;
  guidebookUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineStage {
  id: string;
  stageName: string;
  startDate: string;
  endDate: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  role: "LEADER" | "MEMBER";
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  competitionId: string;
  competition?: Competition;
  leaderId: string;
  leader?: User;
  inviteCode: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  teamId: string;
  team?: Team;
  competitionId: string;
  competition?: Competition;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  repoUrl?: string | null;
  videoUrl?: string | null;
  status: "SUBMITTED" | "UNDER_REVIEW" | "SCORED";
  submittedAt: string;
  updatedAt: string;
}

export interface ScoreCriteria {
  id: string;
  competitionId: string;
  name: string;
  description?: string | null;
  weight: number;
  maxScore: number;
  createdAt: string;
}

export interface CriteriaScore {
  criteriaId: string;
  score: number;
}

export interface Score {
  id: string;
  submissionId: string;
  submission?: Submission;
  juriId: string;
  juri?: User;
  totalScore: number;
  feedback?: string | null;
  criteriaScores: CriteriaScore[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorId: string;
  author?: User;
  category: string;
  publishedAt?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: "ALL" | "PESERTA" | "JURI" | "ADMIN";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
