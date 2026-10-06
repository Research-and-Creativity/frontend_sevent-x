"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Cpu, Layers, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Team, Submission, Competition } from "@/types/api";

interface MockDirectoryCard {
  team: Team;
  submission: Submission;
  category: string;
  competitionSlug?: string;
  status: "Scored" | "Pending";
  icon: React.ReactNode;
}

export default function JuriTeamDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");

  // 1. Fetch Competitions List
  const { data: competitions = [] } = useQuery<Competition[]>({
    queryKey: ["juriCompetitionsList"],
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

  // Query submissions from backend with competitionSlug query param
  useQuery({
    queryKey: ["juriSubmissions", selectedCompSlug],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/submissions", {
          params: selectedCompSlug ? { competitionSlug: selectedCompSlug } : undefined,
        });
        return res.data?.data || res.data;
      } catch {
        return null;
      }
    },
  });

  // Pass 1: 3 Mock Data Cards following Team & Submission interfaces from src/types/api.ts
  const mockDirectoryData: MockDirectoryCard[] = [
    {
      team: {
        id: "4092",
        teamName: "Quantum Coders",
        teamCode: "QUANTUM",
        competitionId: "1",
        status: "APPROVE",
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
        fileUrl: "https://example.com/quantum.pdf",
        linkUrl: "https://github.com/quantum/engine",
        submittedAt: "2026-10-12T11:59:00Z",
      },
      category: "UI/UX",
      competitionSlug: "ui-ux-design",
      status: "Scored",
      icon: <Cpu className="w-6 h-6 text-accent" />,
    },
    {
      team: {
        id: "8120",
        teamName: "Nexus Navigators",
        teamCode: "NEXUS8120",
        competitionId: "1",
        status: "APPROVE",
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
        fileUrl: "https://example.com/nexus.pdf",
        linkUrl: "https://github.com/nexus/navigator",
        submittedAt: "2026-10-15T18:00:00Z",
      },
      category: "Web Dev",
      competitionSlug: "web-development",
      status: "Pending",
      icon: <Layers className="w-6 h-6 text-accent" />,
    },
    {
      team: {
        id: "2291",
        teamName: "Data Drifters",
        teamCode: "DRIFTERS",
        competitionId: "1",
        status: "APPROVE",
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
        fileUrl: "https://example.com/drifters.pdf",
        linkUrl: "https://github.com/drifters/analytics",
        submittedAt: "2026-10-16T09:00:00Z",
      },
      category: "Web Dev",
      competitionSlug: "web-development",
      status: "Scored",
      icon: <Sparkles className="w-6 h-6 text-accent" />,
    },
  ];

  // Client-side search and competitionSlug filter
  const filteredData = mockDirectoryData.filter(({ team, competitionSlug }) => {
    const matchSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchComp = !selectedCompSlug || competitionSlug === selectedCompSlug;
    return matchSearch && matchComp;
  });

  return (
    <div className="space-y-8">
      {/* 2. Section Title & Search/Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Participant Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Jury overview of all participating teams and their current status.
          </p>
        </div>

        {/* 3. Search Bar + Competition Slug Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {/* Competition Slug Filter Dropdown */}
          <div className="w-52">
            <select
              value={selectedCompSlug}
              onChange={(e) => setSelectedCompSlug(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="" className="bg-card text-white">All Competitions</option>
              {competitions.map((comp) => (
                <option key={comp.id || comp.slug} value={comp.slug} className="bg-card text-white">
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. Grid Card Tim (3 Columns in Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredData.map(({ team, submission, category, status, icon }) => {
          const memberCount = team.members?.length || 0;
          const isScored = status === "Scored";

          return (
            <Link key={team.id} href={`/juri/team/${submission.id}`} className="block group">
              <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 min-h-55 shadow-sm">
                {/* Top Part: Thumbnail + Team Info + Category Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Team Name & ID */}
                    <div className="space-y-0.5">
                      <h2 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors leading-snug">
                        {team.teamName}
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
