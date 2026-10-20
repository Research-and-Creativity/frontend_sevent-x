import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AnnouncementState {
  /** ISO timestamp of the last time the announcements page was opened. */
  lastSeen: string | null;
  markSeen: (iso?: string) => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      lastSeen: null,
      markSeen: (iso?: string) =>
        set({ lastSeen: iso ?? new Date().toISOString() }),
    }),
    {
      name: "seventx-announcements-last-seen",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lastSeen: state.lastSeen }),
    }
  )
);