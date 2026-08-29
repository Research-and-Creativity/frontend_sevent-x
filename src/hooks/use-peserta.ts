import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User, Team, Submission, NewsPost, Competition } from "@/types/api";

export interface TimelineStage {
  id: string;
  phase: string;
  stageName: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  isActive: boolean;
}

export function useUserMe() {
  return useQuery<User | null>({
    queryKey: ["userMe"],
    queryFn: async () => {
      const res = await apiClient.get("/api/user/me");
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserTeam() {
  return useQuery<Team | null>({
    queryKey: ["userTeam"],
    queryFn: async () => {
      const res = await apiClient.get("/api/teams/me");
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserSubmission() {
  return useQuery<Submission | null>({
    queryKey: ["userSubmission"],
    queryFn: async () => {
      const res = await apiClient.get("/api/submissions/me");
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
export const useSubmission = useUserSubmission;

export function useNews(limit: number = 2) {
  return useQuery<NewsPost[]>({
    queryKey: ["newsAnnouncements", limit],
    queryFn: async () => {
      const res = await apiClient.get(`/api/news?limit=${limit}`);
      const list = res.data?.data;
      return Array.isArray(list) ? list.slice(0, limit) : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
export const useNewsAnnouncements = useNews;

// Helper: ubah enum phase jadi label yang enak dibaca
export function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    REGISTRATION: "Pendaftaran & Registrasi Tim",
    UPLOAD_KARYA: "Pengumpulan Karya",
    PENJURIAN: "Penjurian",
    FINAL: "Final & Pengumuman",
  };
  return labels[phase] || phase;
}

// Timeline diambil dari GET /api/competitions/:slug/timeline
export function useCompetitionTimeline(slug?: string) {
  return useQuery<TimelineStage[]>({
    queryKey: ["competitionTimeline", slug],
    queryFn: async () => {
      if (!slug) return [];
      try {
        const res = await apiClient.get(`/api/competitions/${slug}/timeline`);
        const list = res.data?.data || res.data;
        const timelines = Array.isArray(list) ? list : [];
        const now = Date.now();
        return timelines.map((t: any) => ({
          id: t.id,
          phase: t.phase,
          stageName: t.stageName || (t.phase ? getPhaseLabel(t.phase) : "Milestone"),
          startDate: t.startDate,
          endDate: t.endDate,
          description: t.description || "",
          isCompleted: new Date(t.endDate).getTime() < now,
          isActive:
            new Date(t.startDate).getTime() <= now &&
            now <= new Date(t.endDate).getTime(),
        }));
      } catch {
        // Fallback: get from detail competition
        const res = await apiClient.get(`/api/competitions/${slug}`);
        const competition = res.data?.data || res.data;
        const timelines = competition?.timelines || [];
        const now = Date.now();
        return timelines.map((t: any) => ({
          id: t.id,
          phase: t.phase,
          stageName: t.stageName || (t.phase ? getPhaseLabel(t.phase) : "Milestone"),
          startDate: t.startDate,
          endDate: t.endDate,
          description: t.description || "",
          isCompleted: new Date(t.endDate).getTime() < now,
          isActive:
            new Date(t.startDate).getTime() <= now &&
            now <= new Date(t.endDate).getTime(),
        }));
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompetitions() {
  return useQuery<Competition[]>({
    queryKey: ["competitionsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface UserDocumentItem {
  id: string;
  userId: string;
  type: string;
  fileUrl: string;
  status: "REVIEW" | "APPROVE" | "REJECT" | string;
  rejectionReason?: string | null;
  reviewCount?: number;
  lastRejectedAt?: string | null;
}

// Hook 7: Fetch User Documents GET /api/user/documents
export function useUserDocuments() {
  return useQuery<UserDocumentItem[]>({
    queryKey: ["userDocuments"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/user/documents");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        try {
          const resFallback = await apiClient.get("/api/user-documents");
          const list = resFallback.data?.data || resFallback.data;
          return Array.isArray(list) ? list : [];
        } catch {
          return [];
        }
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook 8: Create Team POST /api/teams
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; competitionSlug?: string; competitionId?: string }) => {
      const res = await apiClient.post("/api/teams", {
        teamName: data.name,
        competitionSlug: data.competitionSlug || data.competitionId,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}

// Hook 9: Join Team POST /api/teams/join
export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { inviteCode: string }) => {
      const res = await apiClient.post("/api/teams/join", data);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}

// Hook 10: Update Team Name PATCH /api/teams/me
export function useUpdateTeamName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamName: string) => {
      const res = await apiClient.patch("/api/teams/me", { teamName, name: teamName });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}

// Hook 11: Leave / Disband Team DELETE /api/teams/me
export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/api/teams/me");
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}

// Hook 12: Transfer Leadership POST /api/teams/me/transfer-leadership
export function useTransferLeadership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newLeaderId: string) => {
      const res = await apiClient.post("/api/teams/me/transfer-leadership", {
        newLeaderId,
        targetUserId: newLeaderId,
        memberId: newLeaderId,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}



