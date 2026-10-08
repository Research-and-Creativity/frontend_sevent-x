"use client";

import { useState } from "react";
import { ChevronUp, FileText } from "lucide-react";

const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

interface SubmissionAccordionProps {
  team: {
    name: string;
    members: string[];
  };
  product: {
    title: string;
    description: string;
  };
  externalLinks: {
    label: string;
    url: string;
  }[];
  proposal: {
    name: string;
    size: string;
  };
  defaultOpen?: boolean;
}

export function SubmissionAccordion({
  team,
  product,
  externalLinks,
  proposal,
  defaultOpen = true,
}: SubmissionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      {/* Bar Submission (collapsible) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${glass} flex w-full items-center justify-between px-6 py-4 lg:px-8 text-left cursor-pointer hover:bg-white/[0.04] transition-colors`}
        aria-expanded={isOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Submission
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Baris 1: Team Information + Product Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Information */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
                Team Information
              </h2>
              <h3 className="relative font-display text-xl font-bold text-white mb-3">
                {team.name}
              </h3>
              <ul className="relative space-y-1.5">
                {team.members.map((member) => (
                  <li key={member} className="text-sm text-white/90">
                    {member}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Information */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-1">
                Product Information
              </h2>
              <p className="relative text-xs text-white/70 mb-6">
                You can filled this form with the Product Title and Description
              </p>

              <div className="relative space-y-1">
                <span className="block text-sm text-white/60">
                  Product Title
                </span>
                <p className="text-lg text-white">{product.title}</p>
              </div>

              <div className="relative mt-5 space-y-1">
                <span className="block text-sm text-white/60">Description</span>
                <p className="text-lg text-white">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Baris 2: External Links + Proposal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* External Links */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-1">
                External Links
              </h2>
              <p className="relative text-xs text-white/70 mb-6">
                Please make sure this link is open public so we can access it
              </p>

              <div className="relative space-y-5">
                {externalLinks.map((link) => (
                  <div key={link.label} className="space-y-1">
                    <span className="block text-sm text-white/60">
                      {link.label}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg text-white underline underline-offset-4 decoration-white/40 hover:decoration-white break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-5">
                Proposal
              </h2>

              <a
                href="#"
                className="relative flex items-center gap-4 w-full max-w-xs rounded-xl border border-white/40 bg-white/[0.03] p-4 hover:bg-white/[0.07] transition-colors"
              >
                <span className="flex flex-col items-center leading-none shrink-0">
                  <FileText
                    className="w-9 h-9 text-red-500"
                    strokeWidth={1.5}
                  />
                  <span className="-mt-5 mb-3 text-[7px] font-bold text-red-500">
                    PDF
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white truncate">
                    {proposal.name}
                  </span>
                  <span className="block text-xs text-white/60">
                    {proposal.size}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
