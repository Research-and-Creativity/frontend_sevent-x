export type UserRole = "PESERTA" | "JURI" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  institution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TimelinePhase = "REGISTRATION" | "UPLOAD_KARYA" | "PENJURIAN" | "FINAL";

export interface Timeline {
  id: string;
  competitionId: string;
  phase: TimelinePhase;
  startDate: string;
  endDate: string;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxMember: number;
  isActive: boolean;
  prizePool?: string | null;
  twibbonFrameUrl?: string | null;
  twibbonCaption?: string | null;
  timelines?: Timeline[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineStage {
  id: string;
  stageName: string;
  phase?: TimelinePhase | string;
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
  user?: {
    id: string;
    email: string;
    fullName: string;
    institution: string;
    avatar?: string | null;
  };
  role: "LEADER" | "MEMBER";
  joinedAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  teamCode: string;
  competitionId: string;
  competition?: {
    id: string;
    name: string;
    slug: string;
    maxMember: number;
  };
  status: "REVIEW" | "APPROVE" | "REJECT";
  members?: TeamMember[];
  paymentProof?: {
    id: string;
    fileUrl: string;
    status: string;
    rejectionReason?: string | null;
    reviewCount?: number;
    lastRejectedAt?: string | null;
  } | null;
  rejectionReason?: string | null;
  reviewCount?: number;
  lastRejectedAt?: string | null;
  submission?: Submission | null;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  teamId: string;
  team?: {
    id: string;
    teamName: string;
    teamCode: string;
    competition?: { id: string; name: string; slug: string };
  };
  fileUrl?: string | null;
  linkUrl?: string | null;
  submittedAt: string;
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

export type NewsTag = "IMPORTANT" | "INFO" | "UPDATE";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  tag: NewsTag;
  authorId: string;
  author?: { id: string; fullName: string };
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
