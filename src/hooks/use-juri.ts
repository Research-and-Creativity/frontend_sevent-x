import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface JudgeSubmissionScore {
  id: string;
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

export interface JudgeSubmissionDetailResponse {
  submission: JudgeSubmissionItem;
  criteriaList: Array<{
    id: string;
    name: string;
    maxScore: number;
    order: number;
  }>;
  existingScores: JudgeSubmissionScore[];
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
  isDraft?: boolean;
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
