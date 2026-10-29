import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useAnnouncementStore } from "@/store/announcement-store";
import { toast } from "sonner";
import { User, Team, Submission, NewsPost, Competition, MyAnnouncementResponse, GalleryItem } from "@/types/api";

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

// Bentuk timeline dari BE sebelum dinormalisasi menjadi TimelineStage.
type TimelineResponseItem = {
  id: string;
  phase: string;
  stageName?: string | null;
  startDate: string;
  endDate: string;
  description?: string | null;
};

function toTimelineStages(items: TimelineResponseItem[]): TimelineStage[] {
  const now = Date.now();
  return items.map((t) => ({
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

// Timeline diambil dari GET /api/competitions/:slug/timeline
export function useCompetitionTimeline(slug?: string) {
  return useQuery<TimelineStage[]>({
    queryKey: ["competitionTimeline", slug],
    queryFn: async () => {
      if (!slug) return [];
      try {
        const res = await apiClient.get(`/api/competitions/${slug}/timeline`);
        const list = res.data?.data || res.data;
        return toTimelineStages((Array.isArray(list) ? list : []) as TimelineResponseItem[]);
      } catch {
        // Fallback: get from detail competition
        const res = await apiClient.get(`/api/competitions/${slug}`);
        const competition = res.data?.data || res.data;
        const timelines = competition?.timelines || [];
        return toTimelineStages(timelines as TimelineResponseItem[]);
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompetitions() {
  return useQuery<Competition[]>({
    queryKey: ["competitionsList"],
    // Sengaja tidak menangkap error: kalau fetch gagal, isError harus terlihat
    // (bukan diam-diam jadi [] seperti sebelumnya), supaya pemakai tahu data
    // yang kosong itu gagal dimuat, bukan memang kosong.
    queryFn: async () => {
      const res = await apiClient.get("/api/competitions");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Daftar seluruh item galeri (public) GET /api/gallery
export function useGallery() {
  return useQuery<GalleryItem[]>({
    queryKey: ["gallery"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/gallery");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Detail satu kompetisi GET /api/competitions/:slug
export function useCompetition(slug?: string) {
  return useQuery<Competition | null>({
    queryKey: ["competitionDetail", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await apiClient.get(`/api/competitions/${slug}`);
      return res.data?.data ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export const PROFILE_REQUIRED_FIELDS = [
  { key: "institution", label: "Institution" },
  { key: "phone", label: "Phone Number" },
  { key: "birthDate", label: "Birth Date" },
  { key: "domicile", label: "Domicile" },
  { key: "discordId", label: "Discord ID" },
] as const satisfies ReadonlyArray<{ key: keyof User; label: string }>;

// Kelengkapan profil dipakai sebagai gerbang masuk fitur kompetisi. Dokumen
// sengaja tidak termasuk: statusnya menunggu review admin, jadi tidak bisa
// dijadikan syarat yang bisa dipenuhi peserta secara langsung.
export function useProfileComplete() {
  const { data: user, isLoading } = useUserMe();

  const missingFields = PROFILE_REQUIRED_FIELDS.filter(
    (field) => !user?.[field.key],
  ).map((field) => field.label);

  return {
    isLoading,
    isComplete: Boolean(user) && missingFields.length === 0,
    missingFields,
  };
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
      // Endpoint ini milik role PESERTA (roleGuard di backend), jadi tidak
      // ada fallback ke /api/user-documents yang hanya untuk admin.
      const res = await apiClient.get("/api/user/documents");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
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
  return useMutation<Team, unknown, { name: string; competitionSlug: string }>({
    // Backend mencari Competition berdasarkan slug, bukan id.
    mutationFn: async (data) => {
      const res = await apiClient.post("/api/teams", {
        teamName: data.name,
        competitionSlug: data.competitionSlug,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
    },
  });
}

// Batas ukuran mengikuti multer di backend (upload.middleware.ts).
export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const SUBMISSION_DELIVERABLE_MAX_BYTES = 10 * 1024 * 1024;

// Hook: Upload bukti pembayaran POST /api/teams/:id/payment-proof (multipart "file")
export function useUploadPaymentProof() {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, { teamId: string; file: File }>({
    mutationFn: async ({ teamId, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post(`/api/teams/${teamId}/payment-proof`, formData);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeam"] });
      queryClient.invalidateQueries({ queryKey: ["submissionEligibility"] });
    },
  });
}

// Hook 9: Join Team POST /api/teams/join
export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation<Team, unknown, { teamCode: string }>({
    mutationFn: async (data) => {
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
      const res = await apiClient.patch("/api/teams/me", { teamName });
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
        newLeaderUserId: newLeaderId,
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
  instagramFollowApproved: boolean;
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

// Hook 15b: Notifikasi announcement baru di sidebar peserta (badge unread + toast).
// Tidak memanggil useNewsFeed/useMyAnnouncements di sini? — dipanggil di dalam,
// jadi hook ini juga memicu polling 30s untuk badge.
export function useAnnouncementNotifications() {
  const { data: myAnnouncementsData } = useMyAnnouncements();
  const { data: newsFeedData } = useNewsFeed({ page: 1, limit: 10 });

  const lastSeen = useAnnouncementStore((s) => s.lastSeen);
  const markSeen = useAnnouncementStore((s) => s.markSeen);

  // Inisialisasi lastSeen saat pertama kali ada data (hindari spam badge di kunjungan pertama).
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    if (!lastSeen && (myAnnouncementsData || newsFeedData)) {
      markSeen();
      initializedRef.current = true;
    } else {
      initializedRef.current = true;
    }
  }, [lastSeen, myAnnouncementsData, newsFeedData, markSeen]);

  // Kumpulkan item announcement yang published + news posts, dengan timestamp.
  const publishedTeamAnns = useMemo(
    () => (myAnnouncementsData?.announcements || []).filter((a) => a.publishedAt),
    [myAnnouncementsData?.announcements],
  );
  const newsItems = useMemo(() => newsFeedData?.news || [], [newsFeedData?.news]);

  const threshold = lastSeen ? new Date(lastSeen).getTime() : Infinity;

  const unreadTeam = publishedTeamAnns.filter((a) => {
    const t = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    return Number.isFinite(t) && t > threshold;
  });
  const unreadNews = newsItems.filter((n) => {
    const t = new Date(n.createdAt).getTime();
    return Number.isFinite(t) && t > threshold;
  });
  const unreadCount = unreadTeam.length + unreadNews.length;

  // Toast saat item baru muncul setelah load awal (ref-based, tidak fire di load pertama).
  // Inisialisasi prevIdsRef hanya setelah data benar-benar ada, supaya toast tidak
  // muncul saat reload (ketika data awalnya kosong lalu terisi).
  const prevIdsRef = useRef<Set<string> | null>(null);
  const dataReady =
    (myAnnouncementsData?.announcements?.length ?? 0) > 0 ||
    (newsFeedData?.news?.length ?? 0) > 0;
  useEffect(() => {
    const ids = new Set<string>([
      ...publishedTeamAnns.map((a) => `t:${a.id}`),
      ...newsItems.map((n) => `n:${n.id}`),
    ]);

    if (!dataReady) return; // tunggu data load, jangan inisialisasi dengan set kosong
    if (prevIdsRef.current === null) {
      prevIdsRef.current = ids;
      return;
    }
    const prev = prevIdsRef.current;
    const newCount = Array.from(ids).filter((id) => !prev.has(id)).length;
    if (newCount > 0) {
      toast.success(`Ada ${newCount} announcement baru`);
    }
    prevIdsRef.current = ids;
  }, [publishedTeamAnns, newsItems, dataReady]);

  return { unreadCount };
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
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export interface UpdateProfileInput {
  fullName?: string;
  institution?: string;
  birthDate?: string | null;
  domicile?: string | null;
  phone?: string | null;
  discordId?: string | null;
}

// Hook 17: Update User Profile PATCH /api/user/me
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation<User, unknown, UpdateProfileInput>({
    mutationFn: async (data) => {
      const res = await apiClient.patch("/api/user/me", data);
      return res.data?.data ?? res.data;
    },
    onSuccess: (updatedUser) => {
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
  return useMutation<unknown, unknown, { currentPassword: string; newPassword: string }>({
    mutationFn: async (data) => {
      const res = await apiClient.post("/api/auth/change-password", data);
      return res.data?.data || res.data;
    },
  });
}

// Hook 19: Upload User Document File POST /api/user/documents
export function useUploadUserDocument() {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, FormData>({
    mutationFn: async (formData) => {
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





