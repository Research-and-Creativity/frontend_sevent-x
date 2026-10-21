import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User, UserRole, NewsPost, NewsTag, GalleryItem, Team } from "@/types/api";
import { isVerifiedTeam } from "@/lib/admin-team-status";

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
      queryClient.invalidateQueries({ queryKey: ["teamDetail"] });
    },
  });
}

export interface AdminOverviewStats {
  totalTeams: number;
  totalPeserta: number;
  pendingReview: number;
  totalCompetitions: number;
}

// Hook 6: Fetch Admin Dashboard Overview GET /api/admin/overview
export function useAdminOverview() {
  return useQuery<AdminOverviewStats>({
    queryKey: ["adminOverview"],
    queryFn: async () => {
      const res = await apiClient.get("/api/admin/overview");
      return res.data?.data || res.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// Hook 6b: Hitung jumlah tim dalam antrean kerja admin (BELUM verified) untuk
// badge di sidebar. Memakai isVerifiedTeam yang sama persis dengan halaman
// Registered Team, supaya angka badge dan tabel "Showing X out of Y" tidak
// akan pernah berbeda — satu sumber kebenaran.
//
// `isLoading` ikut dikembalikan agar layout dapat membedakan "data belum
// masuk" dari "antrean benar-benar bertambah" (lihat toast di admin layout).
// Reuse queryKey ["adminTeams", ""] agar share cache dengan halaman
// dashboard (tidak dobel request).
export function useAdminReviewCounts() {
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["adminTeams", ""],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/teams");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  // Satu angka saja: tiap tim dihitung SEKALI, walau dokumen dan pembayarannya
  // sama-sama menunggu review (itulah yang membuat toast lama menampilkan 6
  // untuk 3 tim).
  const pendingReview = teams.filter((t) => !isVerifiedTeam(t)).length;

  return { pendingReview, isLoading };
}

export interface AdminUserDocumentItem {
  id: string;
  userId: string;
  type: "TWIBBON" | "SHARE_STORY" | "KTM" | "KTP" | string;
  fileUrl: string;
  status: "REVIEW" | "APPROVE" | "REJECT" | string;
  rejectionReason?: string | null;
  reviewCount?: number;
  lastRejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    institution?: string | null;
    teamMember?: {
      role: string;
      team?: {
        id: string;
        teamName: string;
        teamCode: string;
        competition?: {
          id: string;
          name: string;
          slug: string;
        };
      };
    } | null;
  };
}

// Hook 7: Fetch Admin User Documents GET /api/admin/user-documents
export function useAdminUserDocuments(status?: string, type?: string) {
  return useQuery<AdminUserDocumentItem[]>({
    queryKey: ["adminUserDocuments", status, type],
    queryFn: async () => {
      const res = await apiClient.get("/api/admin/user-documents", {
        params: {
          ...(status && status !== "ALL" ? { status } : status === "ALL" ? { status: "ALL" } : {}),
          ...(type && type !== "ALL" ? { type } : {}),
        },
      });
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
  });
}

// Hook 8: Update User Document Status PATCH /api/admin/user-documents/:id/status
export function useUpdateUserDocumentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      documentId,
      status,
      reason,
    }: {
      documentId: string;
      status: "APPROVE" | "REJECT";
      reason?: string;
    }) => {
      const res = await apiClient.patch(
        `/api/admin/user-documents/${documentId}/status`,
        {
          status,
          ...(reason ? { reason: reason.trim() } : {}),
        }
      );
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUserDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
      queryClient.invalidateQueries({ queryKey: ["teamDetail"] });
      queryClient.invalidateQueries({ queryKey: ["adminTeams"] });
    },
  });
}

export interface TeamDetailMemberDocument {
  id: string;
  type: "TWIBBON" | "SHARE_STORY" | "KTM" | "INSTAGRAM_FOLLOW" | string;
  fileUrl: string;
  status: "REVIEW" | "APPROVE" | "REJECT" | string;
  rejectionReason: string | null;
}

export interface TeamDetailMember {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    institution: string;
    birthDate?: string | null;
    domicile?: string | null;
    phone?: string | null;
    discordId?: string | null;
    documents: TeamDetailMemberDocument[];
  };
}

export interface TeamDetail {
  id: string;
  teamName: string;
  teamCode: string;
  status: "REVIEW" | "APPROVE" | "REJECT" | string;
  documentStatus?: "REVIEW" | "APPROVE" | "REJECT" | string;
  createdAt: string;
  competition?: { id: string; name: string; slug: string; maxMember: number };
  members: TeamDetailMember[];
  paymentProof?: {
    fileUrl: string;
    status: "REVIEW" | "APPROVE" | "REJECT" | string;
    rejectionReason: string | null;
  } | null;
  submission?: {
    projectTitle: string;
    // Nullable: kompetisi UI/UX mengisi figmaUrl/prototypeUrl, bukan dua ini.
    githubUrl: string | null;
    demoVideoUrl: string | null;
    deploymentUrl: string | null;
    figmaUrl: string | null;
    prototypeUrl: string | null;
    fileUrl: string | null;
    status: "DRAFT" | "SUBMITTED";
  } | null;
}

// Hook 9: Detail satu tim lengkap dengan dokumen anggota & bukti pembayaran
// GET /api/teams/:id (ADMIN atau anggota tim). Dipakai halaman detail admin.
export function useTeamDetail(teamId: string) {
  return useQuery<TeamDetail>({
    queryKey: ["teamDetail", teamId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/teams/${teamId}`);
      return res.data?.data || res.data;
    },
    enabled: Boolean(teamId),
    staleTime: 30 * 1000,
  });
}

// Empat dokumen wajib peserta; KTP tidak termasuk syarat eligibilitas.
export const REQUIRED_DOC_LABELS: Array<{
  type: TeamDetailMemberDocument["type"];
  label: string;
}> = [
  { type: "TWIBBON", label: "Twibbon" },
  { type: "SHARE_STORY", label: "Post Story" },
  { type: "KTM", label: "Student ID" },
  { type: "INSTAGRAM_FOLLOW", label: "Follow Instagram" },
];

export function fileNameFromUrl(url: string): string {
  return url.split("/").pop() || "Dokumen";
}

// ===== Gallery =====

export function useAdminGallery() {
  return useQuery<GalleryItem[]>({
    queryKey: ["adminGallery"],
    queryFn: async () => {
      const res = await apiClient.get("/api/admin/gallery");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? (list as GalleryItem[]) : [];
    },
    staleTime: 30 * 1000,
  });
}

export function useGalleryItem(id: string) {
  return useQuery<GalleryItem | null>({
    queryKey: ["galleryItem", id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/gallery/${id}`);
      return (res.data?.data ?? res.data ?? null) as GalleryItem | null;
    },
    enabled: Boolean(id),
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, file }: { title: string; file: File }) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      const res = await apiClient.post("/api/admin/gallery", formData);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      file,
    }: {
      id: string;
      title?: string;
      file?: File;
    }) => {
      const formData = new FormData();
      if (title !== undefined) formData.append("title", title);
      if (file) formData.append("file", file);
      const res = await apiClient.put(`/api/admin/gallery/${id}`, formData);
      return res.data?.data || res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminGallery"] });
      queryClient.invalidateQueries({ queryKey: ["galleryItem", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/api/admin/gallery/${id}`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

// ===== Announcement (reuses NewsPost) =====

export function useAdminNews() {
  return useQuery<NewsPost[]>({
    queryKey: ["adminNews"],
    queryFn: async () => {
      const res = await apiClient.get("/api/news", { params: { limit: 100 } });
      const data = res.data?.data;
      if (data && Array.isArray(data.news)) return data.news as NewsPost[];
      if (Array.isArray(data)) return data as NewsPost[];
      return [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      tag: NewsTag;
    }) => {
      const res = await apiClient.post("/api/admin/news", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
      queryClient.invalidateQueries({ queryKey: ["newsFeed"] });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      title?: string;
      content?: string;
      tag?: NewsTag;
    }) => {
      const res = await apiClient.put(`/api/admin/news/${id}`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
      queryClient.invalidateQueries({ queryKey: ["newsFeed"] });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/api/admin/news/${id}`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
      queryClient.invalidateQueries({ queryKey: ["newsFeed"] });
    },
  });
}



