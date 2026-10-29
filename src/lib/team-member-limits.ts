export type TeamMemberLimits = {
  min: number;
  max: number;
};

const TEAM_MEMBER_LIMITS: Record<string, TeamMemberLimits> = {
  "software-development": { min: 3, max: 5 },
  "ui-ux": { min: 1, max: 3 },
};

export function getTeamMemberLimits(slug?: string): TeamMemberLimits {
  return slug ? TEAM_MEMBER_LIMITS[slug] ?? { min: 1, max: 5 } : { min: 1, max: 5 };
}
