"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, CheckCircle2 } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { ConfirmModal } from "@/components/confirm-modal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const members = [
  { name: "Haryanto", institution: "Productnya adalah pokoknya", phone: "Productnya adalah pokoknya", discord: "Productnya adalah pokoknya" },
  { name: "Wifakul Azmi" },
  { name: "Rifki Naufal Dzaki" },
  { name: "Farrel Ghazali" },
  { name: "Geusan Edurais Aria Daffa" },
];

const docs = [
  { label: "Twibbon", file: "Proposal", size: "10.MB" },
  { label: "Post Story", file: "Proposal", size: "10.MB" },
  { label: "Student ID", file: "Proposal", size: "10.MB" },
  { label: "Follow Instagram", file: "Proposal", size: "10.MB" },
];

export default function AdminRegisteredTeamDetailPage() {
  const params = useParams();
  const [open, setOpen] = useState<number>(0);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [reviseNote, setReviseNote] = useState("");
  const [submitReviseOpen, setSubmitReviseOpen] = useState(false);
  const [verifyDocOpen, setVerifyDocOpen] = useState(false);
  const [verifyPayOpen, setVerifyPayOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">Team Anomali</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">TEAM DOCUMENT VERIFICATION</span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">3 <span className="text-lg text-white/40 font-normal">/ 5</span></p>
          <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-[#7D8CFF]" />
          </div>
        </div>
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">DOCUMENT STATUS</span>
            <CheckCircle2 className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold text-[#7D8CFF]">On Review</p>
        </div>
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">PAYMENT STATUS</span>
            <CheckCircle2 className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold text-[#7D8CFF]">On Review</p>
        </div>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Team Information</h2>
          <span className="text-xs text-white/60">Team Code • XYZ092E</span>
        </div>

        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="border border-white/15 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="cursor-pointer w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold">
                {m.name}
                <svg className={`w-4 h-4 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden min-h-0 px-5 pb-5 space-y-5">
                  <h3 className="font-display text-lg font-bold">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["Institution/University/School", m.institution || "Productnya adalah pokoknya"],
                      ["Phone Number", m.phone || "Productnya adalah pokoknya"],
                      ["Discord ID", m.discord || "Productnya adalah pokoknya"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-xs text-white/50 mb-1">{k}</p>
                        <p className="text-sm">{v}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-display text-lg font-bold">Document</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {docs.map((d) => (
                      <div key={d.label}>
                        <p className="text-xs text-white/70 mb-2">{d.label}</p>
                        <a href="#" className="flex items-center gap-3 border border-white/20 rounded-lg p-3 hover:bg-white/5 transition-colors">
                          <span className="w-9 h-9 rounded bg-red-500/20 text-red-400 flex items-center justify-center"><FaFilePdf className="w-5 h-5" /></span>
                          <span>
                            <p className="text-sm font-semibold">{d.file}</p>
                            <p className="text-[10px] text-white/40">{d.size}</p>
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setReviseOpen(true)} className="cursor-pointer px-8 py-2.5 rounded-full border border-[#3B5BFF] text-[#7D8CFF] text-sm font-semibold hover:bg-[#3B5BFF]/10 transition-colors">
                      Revise
                    </button>
                    <button onClick={() => setVerifyDocOpen(true)} className="cursor-pointer px-8 py-2.5 rounded-full bg-white text-[#7C83BC] text-sm font-semibold shadow-[0_0_20px_rgba(180,190,255,0.5)] hover:bg-white/90 transition-colors">
                      Verification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold mb-6">Payment Information</h2>
        <p className="text-xs text-white/70 mb-2">Payment Evidence</p>
        <a href="#" className="inline-flex items-center gap-3 border border-white/20 rounded-lg p-3 hover:bg-white/5 transition-colors min-w-[180px]">
          <span className="w-9 h-9 rounded bg-red-500/20 text-red-400 flex items-center justify-center"><FaFilePdf className="w-5 h-5" /></span>
          <span>
            <p className="text-sm font-semibold">Filename</p>
            <p className="text-[10px] text-white/40">10.MB</p>
          </span>
        </a>
        <div className="flex justify-end mt-6">
          <button onClick={() => setVerifyPayOpen(true)} className="cursor-pointer px-8 py-2.5 rounded-full bg-white text-[#7C83BC] text-sm font-semibold shadow-[0_0_20px_rgba(180,190,255,0.5)] hover:bg-white/90 transition-colors">
            Verification
          </button>
        </div>
      </div>

      {/* Revise modal */}
      <Dialog open={reviseOpen} onOpenChange={setReviseOpen}>
        <DialogContent className="bg-[#1A1D24]/80 backdrop-blur-xl border border-white/20 text-white max-w-lg rounded-2xl p-8 shadow-[0_0_60px_rgba(125,140,255,0.15)]" showCloseButton={false}>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-white text-2xl font-extrabold tracking-tight">Revise Notes</DialogTitle>
            <button onClick={() => setReviseOpen(false)} className="cursor-pointer w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white" aria-label="Close">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <DialogDescription className="text-white/60 text-sm -mt-2">Write the revision note for this team.</DialogDescription>
          <label className="block text-sm text-white/70 mt-4 mb-2">Catatan Revisi</label>
          <textarea
            value={reviseNote}
            onChange={(e) => setReviseNote(e.target.value)}
            placeholder="Catatan revisi..."
            className="w-full h-32 rounded-2xl border border-white/30 bg-transparent p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-colors"
          />
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-white/10">
            <button className="cursor-pointer px-8 py-3 rounded-full border border-white/20 text-white/70 text-sm font-semibold hover:text-white transition-colors" onClick={() => setReviseOpen(false)}>Cancel</button>
            <button className="cursor-pointer px-10 py-3 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors" onClick={() => { setReviseOpen(false); setSubmitReviseOpen(true); }}>Submit</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation modals */}
      <ConfirmModal open={submitReviseOpen} onOpenChange={setSubmitReviseOpen} title="Submit revision note?" description="The team will receive this revision note." confirmText="Submit" cancelText="Cancel" onConfirm={() => setReviseNote("")} />
      <ConfirmModal open={verifyDocOpen} onOpenChange={setVerifyDocOpen} title="Verify document?" description="This will mark the team document as verified." confirmText="Verify" cancelText="Cancel" onConfirm={() => {}} />
      <ConfirmModal open={verifyPayOpen} onOpenChange={setVerifyPayOpen} title="Verify payment?" description="This will mark the payment as verified." confirmText="Verify" cancelText="Cancel" onConfirm={() => {}} />
    </div>
  );
}
