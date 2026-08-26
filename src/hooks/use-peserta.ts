import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { User, Team, Submission, NewsPost, Competition } from "@/types/api";

export interface TimelineStage {
  id: string;
  stageName: string;
  startDate: string;
  endDate: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Fallback Mock Data for Development & Initial Render
export const mockUserFallback: User = {
  id: "u-1",
  email: "peserta@seventx.id",
  name: "Alex Septiadi",
  role: "PESERTA",
  institution: "Telkom University",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-01T00:00:00Z",
};

export const mockTeamFallback: Team = {
  id: "t-101",
  name: "Apex Innovators",
  competitionId: "1",
  leaderId: "u-1",
  inviteCode: "APEX2026",
  status: "VERIFIED",
  members: [
    {
      id: "tm-1",
      teamId: "t-101",
      userId: "u-1",
      user: mockUserFallback,
      role: "LEADER",
      joinedAt: "2026-08-05T00:00:00Z",
    },
    {
      id: "tm-2",
      teamId: "t-101",
      userId: "u-2",
      user: {
        id: "u-2",
        email: "sarah@seventx.id",
        name: "Sarah Amanda",
        role: "PESERTA",
        institution: "Telkom University",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        createdAt: "2026-08-06T00:00:00Z",
        updatedAt: "2026-08-06T00:00:00Z",
      },
      role: "MEMBER",
      joinedAt: "2026-08-06T00:00:00Z",
    },
    {
      id: "tm-3",
      teamId: "t-101",
      userId: "u-3",
      user: {
        id: "u-3",
        email: "budi@seventx.id",
        name: "Budi Pratama",
        role: "PESERTA",
        institution: "Telkom University",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        createdAt: "2026-08-07T00:00:00Z",
        updatedAt: "2026-08-07T00:00:00Z",
      },
      role: "MEMBER",
      joinedAt: "2026-08-07T00:00:00Z",
    },
  ],
  createdAt: "2026-08-05T00:00:00Z",
  updatedAt: "2026-08-05T00:00:00Z",
};

export const mockSubmissionFallback: Submission = {
  id: "sub-1",
  teamId: "t-101",
  competitionId: "1",
  title: "SEVENT X Platform Web Application",
  description: "A high-performance modern web application built with Next.js and Tailwind CSS.",
  fileUrl: "https://example.com/proposal.pdf",
  repoUrl: "https://github.com/Apex-Innovators/seventx-project",
  videoUrl: "https://youtube.com/watch?v=demo",
  status: "SUBMITTED",
  submittedAt: "2026-08-18T14:30:00Z",
  updatedAt: "2026-08-18T14:30:00Z",
};

export const mockNewsFallback: NewsPost[] = [
  {
    id: "n-1",
    title: "Pengumuman Jadwal Technical Meeting Finalis SEVENT X 2026",
    slug: "jadwal-technical-meeting-2026",
    content: "Seluruh tim yang lolos tahap awal wajib menghadiri sesi Technical Meeting melalui Zoom pada tanggal 1 November 2026 pukul 13.00 WIB.",
    excerpt: "Sesi briefing teknis untuk seluruh tim peserta SEVENT X 2026.",
    category: "ANNOUNCEMENT",
    authorId: "admin-1",
    publishedAt: "2026-08-15T09:00:00Z",
    isPublished: true,
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "n-2",
    title: "Update Buku Panduan & Kriteria Penilaian Web Development",
    slug: "update-guidebook-web-dev",
    content: "Telah diterbitkan revisi buku panduan versi 1.2 mencakup detail bobot kriteria penilaian responsivitas dan aksesibilitas.",
    excerpt: "Detail revisi kriteria penilaian kategori Web Development.",
    category: "GUIDEBOOK",
    authorId: "admin-1",
    publishedAt: "2026-08-10T11:00:00Z",
    isPublished: true,
    createdAt: "2026-08-10T11:00:00Z",
    updatedAt: "2026-08-10T11:00:00Z",
  },
];

export const mockTimelineFallback: TimelineStage[] = [
  {
    id: "stage-1",
    stageName: "Registration & Account Setup",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    description: "Pendaftaran akun tim & pengunggahan berkas peserta.",
    isCompleted: true,
    isActive: false,
  },
  {
    id: "stage-upload",
    stageName: "Project Submission (Upload Karya)",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    description: "Batas akhir pengunggahan proposal, repositori kode, dan video demo.",
    isCompleted: false,
    isActive: true,
  },
  {
    id: "stage-3",
    stageName: "Initial Judging & Screening",
    startDate: "2026-10-16T00:00:00Z",
    endDate: "2026-10-24T23:59:59Z",
    description: "Penilaian tahap penyisihan oleh dewan juri ahli.",
    isCompleted: false,
    isActive: false,
  },
  {
    id: "stage-4",
    stageName: "Grand Final & Awarding Night",
    startDate: "2026-11-10T00:00:00Z",
    endDate: "2026-11-10T23:59:59Z",
    description: "Presentasi finalis 10 besar dan pengumuman pemenang.",
    isCompleted: false,
    isActive: false,
  },
];

// Hook 1: Fetch Current User Profile GET /api/user/me
export function useUserMe() {
  const storeUser = useAuthStore((state) => state.user);

  return useQuery<User | null>({
    queryKey: ["userMe"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/user/me");
        return res.data?.data || res.data || storeUser || null;
      } catch {
        return storeUser || null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook 2: Fetch Current Team GET /api/teams/me
export function useUserTeam() {
  return useQuery<Team | null>({
    queryKey: ["userTeam"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/teams/me");
        return res.data?.data ?? res.data ?? null;
      } catch {
        try {
          const fallbackRes = await apiClient.get("/api/user/team");
          return fallbackRes.data?.data ?? fallbackRes.data ?? null;
        } catch {
          return null;
        }
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook 3: Fetch Submission GET /api/submissions/me
export function useUserSubmission() {
  return useQuery<Submission | null>({
    queryKey: ["userSubmission"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/submissions/me");
        return res.data?.data ?? res.data ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Alias for requirement compatibility
export const useSubmission = useUserSubmission;

// Hook 4: Fetch Announcements / News GET /api/news?limit=X
export function useNews(limit: number = 2) {
  return useQuery<NewsPost[]>({
    queryKey: ["newsAnnouncements", limit],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/api/news?limit=${limit}`);
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          return list.slice(0, limit);
        }
        return mockNewsFallback.slice(0, limit);
      } catch {
        return mockNewsFallback.slice(0, limit);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export const useNewsAnnouncements = useNews;

// Hook 5: Fetch Competition Timeline GET /api/competitions/:id/timeline
export function useCompetitionTimeline(competitionId?: string) {
  return useQuery<TimelineStage[]>({
    queryKey: ["competitionTimeline", competitionId],
    queryFn: async () => {
      if (!competitionId) return mockTimelineFallback;
      try {
        const res = await apiClient.get(`/api/competitions/${competitionId}/timeline`);
        const list = res.data?.data || res.data;
        return Array.isArray(list) && list.length > 0 ? list : mockTimelineFallback;
      } catch {
        return mockTimelineFallback;
      }
    },
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000,
  });
}

export const mockCompetitionsFallback: Competition[] = [
  {
    id: "1",
    title: "Web Development Competition",
    slug: "web-development",
    description: "Bangun aplikasi web inovatif, responsif, dan modern menggunakan teknologi web terbaru.",
    category: "Web Development",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-28T23:59:59Z",
    registrationFee: 150000,
    maxTeamMembers: 5,
    status: "OPEN",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "2",
    title: "UI/UX Design Competition",
    slug: "ui-ux-design",
    description: "Rancang antarmuka & pengalaman pengguna yang intuitif, estetik, dan berdaya guna tinggi.",
    category: "UI/UX Design",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-30T23:59:59Z",
    registrationFee: 100000,
    maxTeamMembers: 3,
    status: "OPEN",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "3",
    title: "Competitive Programming",
    slug: "competitive-programming",
    description: "Uji kemampuan algoritma, struktur data, dan pemecahan masalah dengan batas waktu ketat.",
    category: "Competitive Programming",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-11-05T23:59:59Z",
    registrationFee: 75000,
    maxTeamMembers: 3,
    status: "OPEN",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
];

// Hook 6: Fetch Competitions GET /api/competitions
export function useCompetitions() {
  return useQuery<Competition[]>({
    queryKey: ["competitionsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        const list = res.data?.data || res.data;
        return Array.isArray(list) && list.length > 0 ? list : mockCompetitionsFallback;
      } catch {
        return mockCompetitionsFallback;
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
    mutationFn: async (data: { name: string; competitionId: string }) => {
      const res = await apiClient.post("/api/teams", data);
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


