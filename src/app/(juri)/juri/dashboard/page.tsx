"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { Submission, Team, TeamMember } from "@/types/api";

// Pass 1: Mock data structured strictly according to Team, TeamMember, and Submission types from src/types/api.ts
interface MockSubmissionRow {
  submission: Submission;
  team: Team;
  scoreDisplay: string;
}

export default function JuriDashboardPage() {
  // 5 Mock Submissions & Teams following src/types/api.ts
  const mockSubmissionsData: MockSubmissionRow[] = [
    {
      team: {
        id: "t-101",
        name: "Aura Tech",
        competitionId: "1",
        leaderId: "u-101",
        inviteCode: "AURA2026",
        status: "VERIFIED",
        members: [
          { id: "tm-1", teamId: "t-101", userId: "u-101", role: "LEADER", joinedAt: "" },
          { id: "tm-2", teamId: "t-101", userId: "u-102", role: "MEMBER", joinedAt: "" },
          { id: "tm-3", teamId: "t-101", userId: "u-103", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-101",
        teamId: "t-101",
        competitionId: "1",
        title: "Predictive Crop Yield Engine & Sensor Dashboard",
        description: "AI-driven precision agriculture system for local farmers.",
        fileUrl: "https://example.com/aura_proposal.pdf",
        repoUrl: "https://github.com/auratech/crop-yield",
        videoUrl: "https://youtube.com/watch?v=aura",
        status: "SUBMITTED",
        submittedAt: "2026-10-12T11:59:00Z",
        updatedAt: "2026-10-12T11:59:00Z",
      },
      scoreDisplay: "94 / 100",
    },
    {
      team: {
        id: "t-102",
        name: "Neural Linkers",
        competitionId: "1",
        leaderId: "u-201",
        inviteCode: "NEURAL26",
        status: "VERIFIED",
        members: [
          { id: "tm-4", teamId: "t-102", userId: "u-201", role: "LEADER", joinedAt: "" },
          { id: "tm-5", teamId: "t-102", userId: "u-202", role: "MEMBER", joinedAt: "" },
          { id: "tm-6", teamId: "t-102", userId: "u-203", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-102",
        teamId: "t-102",
        competitionId: "1",
        title: "In-Browser Realtime Translation Framework",
        description: "Low-latency WebAssembly neural translation pipeline.",
        fileUrl: "https://example.com/neural_proposal.pdf",
        repoUrl: "https://github.com/neurallinkers/wasm-translate",
        videoUrl: "https://youtube.com/watch?v=neural",
        status: "SUBMITTED",
        submittedAt: "2026-10-15T18:00:00Z",
        updatedAt: "2026-10-15T18:00:00Z",
      },
      scoreDisplay: "82 / 100",
    },
    {
      team: {
        id: "t-103",
        name: "Apex Alpha",
        competitionId: "1",
        leaderId: "u-301",
        inviteCode: "APEX2026",
        status: "VERIFIED",
        members: [
          { id: "tm-7", teamId: "t-103", userId: "u-301", role: "LEADER", joinedAt: "" },
          { id: "tm-8", teamId: "t-103", userId: "u-302", role: "MEMBER", joinedAt: "" },
          { id: "tm-9", teamId: "t-103", userId: "u-303", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-103",
        teamId: "t-103",
        competitionId: "1",
        title: "Autonomous Security Drone Surveillance Mesh",
        description: "Edge-AI obstacle detection and real-time streaming system.",
        fileUrl: "https://example.com/apex_proposal.pdf",
        repoUrl: "https://github.com/apexalpha/drone-mesh",
        videoUrl: "https://youtube.com/watch?v=apex",
        status: "UNDER_REVIEW",
        submittedAt: "2026-10-16T09:00:00Z",
        updatedAt: "2026-10-16T09:00:00Z",
      },
      scoreDisplay: "-- / 100",
    },
    {
      team: {
        id: "t-104",
        name: "Telkom Devs",
        competitionId: "1",
        leaderId: "u-401",
        inviteCode: "TELKOM26",
        status: "VERIFIED",
        members: [
          { id: "tm-10", teamId: "t-104", userId: "u-401", role: "LEADER", joinedAt: "" },
          { id: "tm-11", teamId: "t-104", userId: "u-402", role: "MEMBER", joinedAt: "" },
          { id: "tm-12", teamId: "t-104", userId: "u-403", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-104",
        teamId: "t-104",
        competitionId: "1",
        title: "Campus Smart Utility Metering Platform",
        description: "IoT energy consumption tracking & predictive analytics.",
        fileUrl: "https://example.com/telkom_proposal.pdf",
        repoUrl: "https://github.com/telkomdevs/metering",
        videoUrl: "https://youtube.com/watch?v=telkom",
        status: "SUBMITTED",
        submittedAt: "2026-10-17T14:20:00Z",
        updatedAt: "2026-10-17T14:20:00Z",
      },
      scoreDisplay: "89 / 100",
    },
    {
      team: {
        id: "t-105",
        name: "Cyber Sentinel",
        competitionId: "1",
        leaderId: "u-501",
        inviteCode: "SENTINEL",
        status: "VERIFIED",
        members: [
          { id: "tm-13", teamId: "t-105", userId: "u-501", role: "LEADER", joinedAt: "" },
          { id: "tm-14", teamId: "t-105", userId: "u-502", role: "MEMBER", joinedAt: "" },
          { id: "tm-15", teamId: "t-105", userId: "u-503", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-105",
        teamId: "t-105",
        competitionId: "1",
        title: "Malware Pattern Recognition via Deep Graphs",
        description: "Automated binary graph threat vector analysis.",
        fileUrl: "https://example.com/sentinel_proposal.pdf",
        repoUrl: "https://github.com/cybersentinel/deep-graph",
        videoUrl: "https://youtube.com/watch?v=sentinel",
        status: "UNDER_REVIEW",
        submittedAt: "2026-10-18T14:00:00Z",
        updatedAt: "2026-10-18T14:00:00Z",
      },
      scoreDisplay: "-- / 100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 2. Welcome Text (Directly on Page Background, NO Card Wrapper) */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Welcome back, <span className="text-accent">Judge Abed</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
          You are assigned to the <strong className="text-white font-semibold">Advanced AI & Engineering</strong> category track. Please review the pending submissions before the final phase milestone.
        </p>
      </div>

      {/* 3. Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs font-semibold uppercase text-text-secondary/70 tracking-wider block">
            TOTAL REVIEWS ASSIGNED
          </span>
          <p className="font-display text-3xl font-bold text-white">32</p>
          <p className="text-xs text-text-secondary">Assigned submissions</p>
        </Card>

        {/* Stat Card 2 */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs font-semibold uppercase text-text-secondary/70 tracking-wider block">
            COMPLETED REVIEWS
          </span>
          <p className="font-display text-3xl font-bold text-white">18</p>
          <p className="text-xs text-text-secondary">Review criteria submitted</p>
        </Card>

        {/* Stat Card 3 (Actionable Highlighted Card with Accent Border) */}
        <Card className="bg-card/90 border-2 border-accent/60 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs font-semibold uppercase text-accent tracking-wider block">
            PENDING EVALUATIONS
          </span>
          <p className="font-display text-3xl font-bold text-white">14</p>
          <p className="text-xs text-text-secondary">Action required soon</p>
        </Card>

        {/* Stat Card 4 */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs font-semibold uppercase text-text-secondary/70 tracking-wider block">
            AVG. SCORE AWARDED
          </span>
          <p className="font-display text-3xl font-bold text-white">84.5</p>
          <p className="text-xs text-text-secondary">Consolidated judge score</p>
        </Card>
      </div>

      {/* Main Grid: Left Column (2/3 Width) vs Right Column (1/3 Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Panel Besar "Assigned Submissions" (LEFT COLUMN - 2/3 Width) */}
        <div className="lg:col-span-2">
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
            {/* Panel Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Assigned Submissions
                </h2>
                <p className="text-xs text-text-secondary">
                  Recent project submissions requiring scoring guidelines
                </p>
              </div>

              {/* Filter Badge */}
              <span className=" border border-accent/30 text-accent font-mono text-[11px] font-bold px-3 py-1 rounded-md self-start sm:self-auto">
                FILTER: ALL SUBMISSIONS
              </span>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-text-secondary font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">TEAM NAME</th>
                    <th className="pb-3 font-semibold">PROJECT TITLE</th>
                    <th className="pb-3 font-semibold">CATEGORY</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockSubmissionsData.map(({ team, submission, scoreDisplay }) => {
                    const isScored = scoreDisplay !== "-- / 100";
                    const memberCount = team.members?.length || 3;

                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-surface/60 transition-colors group cursor-pointer"
                      >
                        {/* TEAM NAME */}
                        <td className="py-4 pr-4">
                          <Link href={`/juri/team/${submission.id}`} className="block">
                            <p className="font-display font-bold text-white text-sm group-hover:text-accent transition-colors">
                              {team.name}
                            </p>
                            <span className="font-mono text-[10px] text-text-secondary uppercase">
                              {memberCount} MEMBERS
                            </span>
                          </Link>
                        </td>

                        {/* PROJECT TITLE */}
                        <td className="py-4 pr-4">
                          <Link href={`/juri/team/${submission.id}`} className="block">
                            <p className="text-xs text-white/90 truncate max-w-xs sm:max-w-sm">
                              {submission.title}
                            </p>
                          </Link>
                        </td>

                        {/* CATEGORY */}
                        <td className="py-4 pr-4">
                          <span className=" border border-accent/30 text-accent font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded">
                            UI/UX
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-4 pr-4">
                          {isScored ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-semibold px-3 py-1 rounded-full">
                              <Check className="w-3.5 h-3.5" /> Scored
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-semibold px-3 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>

                        {/* SCORE */}
                        <td className="py-4 text-right">
                          <span
                            className={`font-display font-bold text-sm ${
                              isScored ? "text-accent" : "text-text-secondary"
                            }`}
                          >
                            {scoreDisplay}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* 5. Kolom Kanan (RIGHT COLUMN - 1/3 Width) */}
        <div className="space-y-6">
          {/* Panel "Judging Schedule" */}
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1 pb-3 border-b border-white/10">
              <h2 className="font-display text-xl font-bold text-white tracking-tight">
                Judging Schedule
              </h2>
              <p className="text-xs text-text-secondary">
                Upcoming milestones and evaluation deadlines to monitor.
              </p>
            </div>

            {/* Schedule Timeline List */}
            <div className="relative border-l border-white/10 pl-6 space-y-6 pt-2">
              {/* Item 1 */}
              <div className="relative flex items-center justify-between gap-4">
                <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-display font-bold text-white text-sm">
                  Lorem ipsum
                </span>
                <div className="text-right font-mono text-xs">
                  <span className="text-accent font-bold block">OCT 12</span>
                  <span className="text-text-secondary text-[11px]">11:59 PM</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative flex items-center justify-between gap-4">
                <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-display font-bold text-white text-sm">
                  Lorem ipsum
                </span>
                <div className="text-right font-mono text-xs">
                  <span className="text-accent font-bold block">OCT 15</span>
                  <span className="text-text-secondary text-[11px]">06:00 PM</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex items-center justify-between gap-4">
                <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-display font-bold text-white text-sm">
                  Lorem ipsum
                </span>
                <div className="text-right font-mono text-xs">
                  <span className="text-accent font-bold block">OCT 16</span>
                  <span className="text-text-secondary text-[11px]">09:00 AM</span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative flex items-center justify-between gap-4">
                <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-display font-bold text-white text-sm">
                  Lorem ipsum
                </span>
                <div className="text-right font-mono text-xs">
                  <span className="text-accent font-bold block">OCT 18</span>
                  <span className="text-text-secondary text-[11px]">02:00 PM</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card Terpisah "Need assistance?" */}
          <Card className="bg-[#0B1533]/90 border border-accent/40 rounded-2xl p-6 space-y-3 shadow-md">
            <h3 className="font-display font-bold text-accent text-base">
              Need assistance?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Refer to the <strong className="text-white font-semibold">judge platform scoring handbook</strong> for detailed rubrics on innovation, design, feasibility, and technical complexity.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
