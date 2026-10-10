import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface JudgeSubmissionScore {
  id: string;
  criteriaId: string;
  score: number;
  note?: string | null;
  isLocked: boolean;
  criteria: {
    id: string;
    name: string;
    maxScore: number;
    order: number;
  };
}

export interface JudgeSubmissionItem {
  id: string;
  teamId: string;
  projectTitle: string;
  description: string;
  githubUrl: string;
  demoVideoUrl: string;
  deploymentUrl?: string | null;
  fileUrl?: string | null;
  submittedAt: string;
  updatedAt: string;
  team: {
    id: string;
    teamName: string;
    teamCode: string;
    competition: {
      id: string;
      name: string;
      slug: string;
    };
    members: Array<{
      role: string;
      user: {
        id: string;
        fullName: string;
        email: string;
        institution: string;
      };
    }>;
  };
  scores: JudgeSubmissionScore[];
  evaluationStatus: {
    isEvaluated: boolean;
    isLocked: boolean;
    totalScore: number;
  };
}

export interface JudgeEvaluation {
  id: string;
  feedback: string | null;
  recommendation: JudgeRecommendation | null;
}

export interface JudgeSubmissionDetailResponse {
  submission: JudgeSubmissionItem;
  criteriaList: Array<{
    id: string;
    name: string;
    maxScore: number;
    order: number;
  }>;
  existingScores: JudgeSubmissionScore[];
  /** Catatan tim & rekomendasi milik juri ini (null bila belum pernah menilai). */
  evaluation: JudgeEvaluation | null;
  evaluationStatus: {
    isEvaluated: boolean;
    isLocked: boolean;
    totalScore: number;
  };
}

export interface SubmitScorePayload {
  scores: Array<{
    criteriaId: string;
    score: number;
    note?: string;
  }>;
  /** Catatan untuk tim, disimpan sekali per karya-juri (bukan per kriteria). */
  feedback?: string;
  isDraft?: boolean;
}

export type JudgeRecommendation = "FINALIST" | "WAITLIST";

export interface JudgeRankingItem {
  rank: number;
  teamId: string;
  submissionId: string | null;
  teamName: string;
  teamCode: string;
  leaderName: string | null;
  submittedAt: string | null;
  projectTitle: string;
  finalScore: number;
  isFullyScored: boolean;
  /** null berarti panitia belum menghitung finalis. */
  isFinalist: boolean | null;
  recommendationTally: Record<JudgeRecommendation, number>;
  judgeBreakdown: Array<{
    judgeId: string;
    judgeName: string;
    criteriaCount: number;
    averageScore: number;
  }>;
}

export interface JudgeRankingsResponse {
  competition: { id: string; name: string; slug: string };
  round: string | null;
  isCalculated: boolean;
  rankings: JudgeRankingItem[];
}

// Hook 1: Fetch all submissions assigned to this Judge (GET /api/judge/submissions)
export function useJudgeSubmissions() {
  return useQuery<JudgeSubmissionItem[]>({
    queryKey: ["judgeSubmissions"],
    queryFn: async () => {
      const res = await apiClient.get("/api/judge/submissions");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// Hook 2: Fetch single submission detail for scoring (GET /api/judge/submissions/:id)
export function useJudgeSubmissionDetail(submissionId: string) {
  return useQuery<JudgeSubmissionDetailResponse>({
    queryKey: ["judgeSubmissionDetail", submissionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/judge/submissions/${submissionId}`);
      return res.data?.data || res.data;
    },
    enabled: Boolean(submissionId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// Hook 3: Submit or save draft scores for a submission (POST /api/judge/submissions/:id/score)
export function useSubmitJudgeScore(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitScorePayload) => {
      const res = await apiClient.post(
        `/api/judge/submissions/${submissionId}/score`,
        payload
      );
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judgeSubmissions"] });
      queryClient.invalidateQueries({
        queryKey: ["judgeSubmissionDetail", submissionId],
      });
    },
  });
}

// Hook 4: Simpan rekomendasi juri untuk sebuah karya (PATCH /api/judge/submissions/:id/recommendation)
export function useSubmitJudgeRecommendation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recommendation: JudgeRecommendation) => {
      const res = await apiClient.patch(
        `/api/judge/submissions/${submissionId}/recommendation`,
        { recommendation }
      );
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judgeSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["judgeRankings"] });
      queryClient.invalidateQueries({
        queryKey: ["judgeSubmissionDetail", submissionId],
      });
    },
  });
}

// Hook 5: Ranking karya pada kompetisi yang dinilai juri ini (GET /api/judge/rankings)
export function useJudgeRankings() {
  return useQuery<JudgeRankingsResponse>({
    queryKey: ["judgeRankings"],
    queryFn: async () => {
      const res = await apiClient.get("/api/judge/rankings");
      return res.data?.data || res.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
