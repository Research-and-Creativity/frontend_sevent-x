export const REGISTRATION_DEADLINE =
  process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE ?? "2026-12-31T23:59:59Z";

export type TimelineEvent = {
  date: string;
  title: string;
  side: "top" | "bottom";
};

// Timeline landing ditulis statik (tidak lagi dari API/admin).
export const TIMELINE_EVENTS: TimelineEvent[] = [
  { date: "08–31 DEC", title: "Registration", side: "top" },
  { date: "08–10 OCT", title: "Submission", side: "bottom" },
];
