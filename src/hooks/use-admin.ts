import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User, UserRole } from "@/types/api";

// Hook 1: Fetch Users list for Admin with search & role filter
export function useAdminUsers(search?: string, role?: UserRole | string) {
  return useQuery<User[]>({
    queryKey: ["adminUsers", search, role],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/admin/users", {
          params: {
            ...(search ? { search } : {}),
            ...(role ? { role } : {}),
          },
        });
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
}

export interface AdminJudgeItem {
  id: string;
  userId: string;
  competitionId?: string;
  competitionSlug: string;
  competition?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
    institution?: string | null;
  };
  createdAt: string;
}

// Hook 2: Fetch Assigned Judges GET /api/admin/judges
export function useAdminJudges() {
  return useQuery<AdminJudgeItem[]>({
    queryKey: ["adminJudges"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/admin/judges");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
}

// Hook 3: Assign Judge POST /api/admin/judges with body { competitionSlug, userId }
export function useAssignJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { competitionSlug: string; userId: string }) => {
      const res = await apiClient.post("/api/admin/judges", {
        competitionSlug: payload.competitionSlug,
        userId: payload.userId,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJudges"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

// Hook 4: Delete / Remove Judge Assignment DELETE /api/admin/judges/:id
export function useRemoveJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (judgeId: string) => {
      const res = await apiClient.delete(`/api/admin/judges/${judgeId}`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJudges"] });
    },
  });
}

// Hook 5: Update Team Payment Proof Status PATCH /api/teams/:id/payment-proof/status
export function useUpdatePaymentProofStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      status,
      reason,
    }: {
      teamId: string;
      status: "APPROVE" | "REJECT";
      reason?: string;
    }) => {
      const res = await apiClient.patch(
        `/api/teams/${teamId}/payment-proof/status`,
        {
          status,
          ...(reason ? { reason: reason.trim() } : {}),
        }
      );
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTeams"] });
    },
  });
}

