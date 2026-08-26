"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users, Code2, Sparkles, Cpu, Layers } from "lucide-react";
import { Team, Submission } from "@/types/api";

interface MockDirectoryCard {
  team: Team;
  submission: Submission;
  category: string;
  status: "Scored" | "Pending";
  icon: React.ReactNode;
}

export default function JuriTeamDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Pass 1: 3 Mock Data Cards following Team & Submission interfaces from src/types/api.ts
  const mockDirectoryData: MockDirectoryCard[] = [
    {
      team: {
        id: "4092",
        name: "Quantum Coders",
        competitionId: "1",
        leaderId: "u-401",
        inviteCode: "QUANTUM",
        status: "VERIFIED",
        members: [
          { id: "tm-1", teamId: "4092", userId: "u-401", role: "LEADER", joinedAt: "" },
          { id: "tm-2", teamId: "4092", userId: "u-402", role: "MEMBER", joinedAt: "" },
          { id: "tm-3", teamId: "4092", userId: "u-403", role: "MEMBER", joinedAt: "" },
          { id: "tm-4", teamId: "4092", userId: "u-404", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-4092",
        teamId: "4092",
        competitionId: "1",
        title: "Quantum Algorithm Visualization Engine",
        description: "Interactive UI for quantum circuit simulation.",
        fileUrl: "https://example.com/quantum.pdf",
        repoUrl: "https://github.com/quantum/engine",
        videoUrl: "https://youtube.com/watch?v=quantum",
        status: "SUBMITTED",
        submittedAt: "2026-10-12T11:59:00Z",
        updatedAt: "2026-10-12T11:59:00Z",
      },
      category: "UI/UX",
      status: "Scored",
      icon: <Cpu className="w-6 h-6 text-accent" />,
    },
    {
      team: {
        id: "8120",
        name: "Nexus Navigators",
        competitionId: "1",
        leaderId: "u-801",
        inviteCode: "NEXUS8120",
        status: "VERIFIED",
        members: [
          { id: "tm-5", teamId: "8120", userId: "u-801", role: "LEADER", joinedAt: "" },
          { id: "tm-6", teamId: "8120", userId: "u-802", role: "MEMBER", joinedAt: "" },
          { id: "tm-7", teamId: "8120", userId: "u-803", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-8120",
        teamId: "8120",
        competitionId: "1",
        title: "Autonomous Navigation & Spatial Mapping",
        description: "Real-time indoor spatial mapping portal.",
        fileUrl: "https://example.com/nexus.pdf",
        repoUrl: "https://github.com/nexus/navigator",
        videoUrl: "https://youtube.com/watch?v=nexus",
        status: "UNDER_REVIEW",
        submittedAt: "2026-10-15T18:00:00Z",
        updatedAt: "2026-10-15T18:00:00Z",
      },
      category: "UI/UX",
      status: "Pending",
      icon: <Layers className="w-6 h-6 text-accent" />,
    },
    {
      team: {
        id: "2291",
        name: "Data Drifters",
        competitionId: "1",
        leaderId: "u-201",
        inviteCode: "DRIFTERS",
        status: "VERIFIED",
        members: [
          { id: "tm-8", teamId: "2291", userId: "u-201", role: "LEADER", joinedAt: "" },
          { id: "tm-9", teamId: "2291", userId: "u-202", role: "MEMBER", joinedAt: "" },
          { id: "tm-10", teamId: "2291", userId: "u-203", role: "MEMBER", joinedAt: "" },
          { id: "tm-11", teamId: "2291", userId: "u-204", role: "MEMBER", joinedAt: "" },
          { id: "tm-12", teamId: "2291", userId: "u-205", role: "MEMBER", joinedAt: "" },
        ],
        createdAt: "",
        updatedAt: "",
      },
      submission: {
        id: "sub-2291",
        teamId: "2291",
        competitionId: "1",
        title: "High-Frequency Data Streaming Analytics",
        description: "Dashboard for real-time financial time-series visualization.",
        fileUrl: "https://example.com/drifters.pdf",
        repoUrl: "https://github.com/drifters/analytics",
        videoUrl: "https://youtube.com/watch?v=drifters",
        status: "SUBMITTED",
        submittedAt: "2026-10-16T09:00:00Z",
        updatedAt: "2026-10-16T09:00:00Z",
      },
      category: "UI/UX",
      status: "Scored",
      icon: <Sparkles className="w-6 h-6 text-accent" />,
    },
  ];

  // Client-side search filter
  const filteredData = mockDirectoryData.filter(({ team }) => {
    return (
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* 2. Section Title & Search/Filter Controls (Directly on Page Background) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Participant Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Jury overview of all participating teams and their current status.
          </p>
        </div>

        {/* 3. Search Bar + Filter Button (Right-Aligned) */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Search Input */}
          <div className="relative w-64 sm:w-72">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            className="bg-surface hover:bg-card-hover border-border text-white text-xs font-mono font-semibold px-4 h-10 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Filter className="w-4 h-4 text-text-secondary" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* 4. Grid Card Tim (3 Columns in Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredData.map(({ team, submission, category, status, icon }) => {
          const memberCount = team.members?.length || 0;
          const isScored = status === "Scored";

          return (
            <Link key={team.id} href={`/juri/team/${submission.id}`} className="block group">
              <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 min-h-[220px] shadow-sm">
                {/* Top Part: Thumbnail + Team Info + Category Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Team Name & ID */}
                    <div className="space-y-0.5">
                      <h2 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors leading-snug">
                        {team.name}
                      </h2>
                      <span className="font-mono text-xs text-text-secondary block">
                        ID: #{team.id}
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <span className="border border-accent/30 text-accent font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded shrink-0">
                    {category}
                  </span>
                </div>

                {/* Bottom Part: Members & Status Columns */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {/* Members Column */}
                  <div className="space-y-1">
                    <span className="font-mono text-xs text-text-secondary uppercase block">
                      Members
                    </span>
                    <div className="flex items-center gap-2 font-display font-bold text-white text-base">
                      <Users className="w-4 h-4 text-text-secondary" />
                      <span>{memberCount}</span>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="space-y-1">
                    <span className="font-mono text-xs text-text-secondary uppercase block">
                      Status
                    </span>
                    <div className="flex items-center gap-2 font-display font-bold text-white text-sm">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isScored
                            ? "bg-accent"
                            : "bg-urgent"
                        }`}
                      />
                      <span>{status}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
