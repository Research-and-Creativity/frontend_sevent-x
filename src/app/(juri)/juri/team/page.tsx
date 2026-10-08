"use client";

import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Style glass yang sama dengan halaman Overview
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Kaca untuk elemen kecil (input, tombol, select trigger)
const glassControl =
  "bg-white/[0.03] border border-white/15 backdrop-blur-md " +
  "hover:bg-white/10 text-white/70 hover:text-white transition-colors";

// Dummy data for participants (akan diganti dengan data API di kemudian hari)
const participants = [
  {
    id: "1",
    team: "Tim Anomali",
    productName: "Product",
    teamLeader: "Yanto",
    submittedDate: "21 October 2026",
  },
  {
    id: "2",
    team: "Coba coba saja",
    productName: "Product",
    teamLeader: "Azmi",
    submittedDate: "22 October 2026",
  },
  {
    id: "5",
    team: "Adalah pokoknya",
    productName: "Product",
    teamLeader: "Wifakul",
    submittedDate: "23 October 2026",
  },
];

export default function JuriTeamDirectoryPage() {
  const filteredParticipants = participants;

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      <div className={`${glass} p-6 lg:p-8 flex flex-col justify-center`}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">
          List Finalists
        </h1>
        <p className="text-text-secondary text-sm">
          This is all finalists SEVENT X in Softdev competition, judge can start judgement when the day of final and time started.
        </p>
      </div>

      <div className={`${glass} p-6 lg:p-8`}>
        <div className="flex items-center gap-2 justify-between mb-6">
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-white">
            List of Finalists
          </h2>
        </div>

        {/* Participant Table */}
        <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-white/[0.015]">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-white uppercase bg-white/[0.04] border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Team
                </th>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Team Leader Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Status Judgement
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">
                      Tidak ada peserta yang cocok
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Coba ubah kata kunci pencarian atau filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="bg-transparent border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {participant.team}
                    </td>
                    <td className="px-6 py-4">{participant.productName}</td>
                    <td className="px-6 py-4">{participant.teamLeader}</td>
                    <td className="px-6 py-4">{participant.submittedDate}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/juri/team/${participant.id}`}
                        className="inline-flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-semibold text-white">
              10
            </span>{" "}
            data out of{" "}
            <span className="font-semibold text-white">100</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Show</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-[80px] text-sm bg-white/[0.03] border-white/15 backdrop-blur-md">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0C12]/80 backdrop-blur-xl border border-white/10 text-white">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-text-secondary">data per page</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className={glassControl}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className={glassControl}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
