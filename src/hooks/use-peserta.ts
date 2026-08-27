import { useQuery } from "@tanstack/react-query";
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

// Timeline diambil dari detail competition (getCompetitionBySlug), 
// karena endpoint timeline terpisah belum pasti ada.
// isActive/isCompleted dihitung di sini berdasarkan tanggal sekarang.
export function useCompetitionTimeline(slug?: string) {
  return useQuery<TimelineStage[]>({
    queryKey: ["competitionTimeline", slug],
    queryFn: async () => {
      if (!slug) return [];
      const res = await apiClient.get(`/api/competitions/${slug}`);
      const competition = res.data?.data;
      const timelines = competition?.timelines || [];
      const now = Date.now();
      return timelines.map((t: any) => ({
        id: t.id,
        phase: t.phase,
        stageName: getPhaseLabel(t.phase),
        startDate: t.startDate,
        endDate: t.endDate,
        isCompleted: new Date(t.endDate).getTime() < now,
        isActive:
          new Date(t.startDate).getTime() <= now &&
          now <= new Date(t.endDate).getTime(),
      }));
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
