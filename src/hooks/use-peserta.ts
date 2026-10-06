import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { User, Team, Submission, NewsPost, Competition, MyAnnouncementResponse } from "@/types/api";

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
    staleTime: 10 * 1000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    staleTime: 10 * 1000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    mutationFn: async (data: { teamCode: string }) => {
      const res = await apiClient.post("/api/teams/join", {
        teamCode: data.teamCode,
      });
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

export interface TeamEligibilityMember {
  userId: string;
  fullName: string;
  role: "LEADER" | "MEMBER" | string;
  twibbonApproved: boolean;
  shareStoryApproved: boolean;
  ktmApproved: boolean;
  ktpApproved: boolean;
  allDocumentsApproved: boolean;
}

export interface TeamEligibilityRequirements {
  teamApproved: boolean;
  paymentApproved: boolean;
  timelineActive: boolean;
  members: TeamEligibilityMember[];
  allMembersDocumentsApproved: boolean;
}

export interface TeamEligibilityResponse {
  isEligible: boolean;
  message?: string;
  requirements: TeamEligibilityRequirements;
}

// Hook 13: Fetch Team Submission Eligibility GET /api/teams/me/eligibility
export function useSubmissionEligibility() {
  return useQuery<TeamEligibilityResponse | null>({
    queryKey: ["submissionEligibility"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/teams/me/eligibility");
        return res.data?.data || res.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// Hook 14: Submit or Update Submission POST /api/submissions
export function useCreateOrUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post("/api/submissions", formData);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubmission"] });
      queryClient.invalidateQueries({ queryKey: ["submissionEligibility"] });
    },
  });
}

// Hook 15: Fetch Team Announcements (Finalist / Results) GET /api/announcements/me
export function useMyAnnouncements() {
  return useQuery<MyAnnouncementResponse | null>({
    queryKey: ["myAnnouncements"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/announcements/me");
        return res.data?.data ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NewsFeedResponse {
  news: NewsPost[];
  pagination: NewsPagination;
}

// Hook 16: Fetch News Feed with Tag Filter & Pagination GET /api/news
export function useNewsFeed(params?: { tag?: string; page?: number; limit?: number }) {
  return useQuery<NewsFeedResponse>({
    queryKey: ["newsFeed", params?.tag, params?.page, params?.limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.tag && params.tag !== "All") {
        queryParams.append("tag", params.tag);
      }
      if (params?.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.limit) {
        queryParams.append("limit", params.limit.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/news?${queryString}` : "/api/news";
      const res = await apiClient.get(endpoint);
      const data = res.data?.data;

      if (data && Array.isArray(data.news)) {
        return {
          news: data.news,
          pagination: data.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: data.news.length,
            totalPages: 1,
          },
        };
      }
      if (Array.isArray(data)) {
        return {
          news: data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          },
        };
      }
      return {
        news: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

// Hook 17: Update User Profile PATCH /api/user/me
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: async (data: { fullName: string; institution?: string }) => {
      const res = await apiClient.patch("/api/user/me", data);
      return res.data?.data || res.data;
    },
    onSuccess: (updatedUser: any) => {
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
      queryClient.invalidateQueries({ queryKey: ["submissionEligibility"] });
      if (updatedUser) {
        updateUser(updatedUser);
      }
    },
  });
}

// Hook 18: Change Password POST /api/auth/change-password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiClient.post("/api/auth/change-password", data);
      return res.data?.data || res.data;
    },
  });
}

// Hook 19: Upload User Document File (KTM, KTP_PASSPORT_SIM) POST /api/user/documents
export function useUploadUserDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post("/api/user/documents", formData);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["submissionEligibility"] });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
    },
  });
}






