// TEMPORARY MOCK DATA — replace with real API once backend contract is stable
export const DUMMY_TEAMS = [
  {
    id: "1",
    teamName: "Tim Anomali",
    competition: { name: "Web Development", slug: "web-dev" },
    members: [
      { role: "LEADER", user: { fullName: "Yanto" } },
    ],
    createdAt: "2026-10-12T19:23:00Z",
    paymentProof: { status: "NOT_PAID" },
    status: "REVIEW",
  },
  {
    id: "2",
    teamName: "Coba coba saja",
    competition: { name: "UI/UX Design", slug: "uiux" },
    members: [{ role: "LEADER", user: { fullName: "Azmi" } }],
    createdAt: "2026-10-12T19:23:00Z",
    paymentProof: { status: "REVIEW" },
    status: "REVISE",
  },
  {
    id: "3",
    teamName: "Adalah pokoknya",
    competition: { name: "Web Development", slug: "web-dev" },
    members: [{ role: "LEADER", user: { fullName: "Wifakul" } }],
    createdAt: "2026-10-12T19:23:00Z",
    paymentProof: { status: "APPROVED" },
    status: "APPROVED",
  },
];
