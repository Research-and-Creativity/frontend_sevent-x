export type UserRole = "PESERTA" | "JURI" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  institution: string;
  birthDate?: string | null;
  domicile?: string | null;
  phone?: string | null;
  discordId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TimelinePhase = "REGISTRATION" | "UPLOAD_KARYA" | "PENJURIAN" | "FINAL";

export interface Timeline {
  id: string;
  competitionId: string;
  stageName?: string;
  phase: TimelinePhase;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxMember: number;
  isActive: boolean;
  activeRound?: "PENYISIHAN" | "FINAL";
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
  // Status verifikasi dokumen seluruh anggota, agregasi dari BE.
  documentStatus?: "REVIEW" | "APPROVE" | "REJECT";
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
    competition?: {
      id: string;
      name: string;
      slug: string;
      activeRound?: "PENYISIHAN" | "FINAL";
    };
    members?: Array<{
      id?: string;
      role: "LEADER" | "MEMBER";
      user: {
        id: string;
        fullName: string;
        email?: string;
        institution?: string | null;
      };
    }>;
  };
  projectTitle?: string;
  description?: string;
  githubUrl?: string | null;
  demoVideoUrl?: string | null;
  deploymentUrl?: string | null;
  figmaUrl?: string | null;
  prototypeUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  originalityFileUrl?: string | null;
  originalityFileName?: string | null;
  originalityFileSize?: number | null;
  linkUrl?: string | null;
  /** DRAFT = masih disimpan sebagai draf, SUBMITTED = sudah dikirim dan dikunci. */
  status: "DRAFT" | "SUBMITTED";
  /** Baru terisi ketika leader menekan Submit All. */
  submittedAt: string | null;
  // Data penilaian (hanya ada setelah juri menilai).
  scores?: Array<{
    id: string;
    judgeId?: string;
    score: number;
    note?: string | null;
    isLocked: boolean;
    criteria: {
      id: string;
      name: string;
      maxScore: number;
      weight?: number;
      order?: number;
      round?: "PENYISIHAN" | "FINAL";
      group?: string | null;
    };
    judge: { id?: string; user: { fullName: string } };
  }>;
  judgeEvaluations?: Array<{
    id: string;
    judgeId?: string;
    round?: "PENYISIHAN" | "FINAL";
    recommendation?: string | null;
    feedback?: string | null;
    judge: { id?: string; user: { fullName: string } };
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScoreCriteria {
  id: string;
  competitionId: string;
  round: "PENYISIHAN" | "FINAL";
  name: string;
  description?: string | null;
  group?: string | null;
  weight: number;
  maxScore: number;
  order: number;
  createdAt?: string;
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

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  fileId?: string | null;
  order: number;
  createdAt: string;
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

export interface EvaluationCriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  weight: number;
  note: string | null;
}

export interface EvaluationJudgeBreakdown {
  judgeId: string;
  judgeName: string;
  criteriaCount: number;
  averageScore: number;
  feedback?: string | null;
  criteriaScores?: EvaluationCriteriaScore[];
}

export interface TieBreakerInfo {
  status: "WON" | "LOST";
  rank: number;
  comparedRank: number;
  score: number;
  submittedAt: string | null;
  comparedSubmittedAt: string | null;
  rule?: "CRITERIA_SCORE" | "SUBMISSION_TIME";
  criteriaName?: string | null;
  criteriaScore?: number | null;
  comparedCriteriaScore?: number | null;
}

export interface TeamAnnouncementEvaluation {
  finalScore: number;
  isFullyScored: boolean;
  judgeBreakdown: EvaluationJudgeBreakdown[];
  submittedAt?: string | null;
  tieBreaker?: TieBreakerInfo | null;
}

export interface TeamAnnouncementItem {
  id: string;
  competitionId: string;
  teamId: string;
  isFinalist: boolean;
  // Peringkat pemenang pada babak final: 1 = Juara 1, 2 = Juara 2. Null untuk
  // babak penyisihan dan tim non-podium.
  rank: number | null;
  round: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  competition?: {
    id: string;
    name: string;
    slug: string;
  };
  team?: {
    id: string;
    teamName: string;
    teamCode: string;
  };
  evaluation?: TeamAnnouncementEvaluation | null;
}

export interface MyAnnouncementResponse {
  team: {
    id: string;
    teamName: string;
    teamCode: string;
    competition?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  announcements: TeamAnnouncementItem[];
}
