"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Input pill gelap sesuai desain
const glassInput =
  "h-12 w-full rounded-full px-5 bg-white/[0.03] border border-white/25 backdrop-blur-md " +
  "text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors";

// Input read-only (email akun)
const glassInputReadOnly =
  "h-12 w-full rounded-full px-5 bg-white/[0.02] border border-white/15 backdrop-blur-md " +
  "text-sm text-white/70 focus:outline-none cursor-not-allowed";

// Tombol Save pill putih sesuai desain
const pillButton =
  "cursor-pointer bg-white text-[#1B235E] hover:bg-white/80 rounded-full px-6 h-9 text-xs font-semibold shadow-sm";

// Dummy data (mock statis, akan diganti dengan data API di kemudian hari)
const verificationDocs = [
  "Twibbon",
  "Post Story",
  "Student ID",
  "Follow Instagram Sevent.tup",
];

export default function PesertaProfilePage() {
  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Header */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Profile
        </h1>
      </div>

      {/* General Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          General Information
        </h2>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="block text-sm text-text-secondary"
            >
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              placeholder="Name"
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-birth-date"
              className="block text-sm text-text-secondary"
            >
              Birth Date
            </label>
            <input
              id="profile-birth-date"
              type="text"
              placeholder="Birth Date"
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-domicile"
              className="block text-sm text-text-secondary"
            >
              Domicile
            </label>
            <input
              id="profile-domicile"
              type="text"
              placeholder="Domicile"
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-institution"
              className="block text-sm text-text-secondary"
            >
              Institution/University/School
            </label>
            <input
              id="profile-institution"
              type="text"
              placeholder="Institution/University/School"
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-phone"
              className="block text-sm text-text-secondary"
            >
              Phone Number
            </label>
            <div className="flex h-12 items-center rounded-full border border-white/25 bg-white/[0.03] pl-5 pr-5 backdrop-blur-md transition-colors focus-within:border-[#7D8CFF]/70">
              <span className="text-sm text-white/60">+62</span>
              <input
                id="profile-phone"
                type="tel"
                placeholder="812-3456-7890"
                className="ml-2 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-discord"
              className="block text-sm text-text-secondary"
            >
              Discord ID
            </label>
            <input
              id="profile-discord"
              type="text"
              placeholder="Discord ID"
              className={glassInput}
            />
          </div>
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button className={pillButton}>Save</Button>
        </div>
      </div>

      {/* Account Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          Account Information
        </h2>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-email"
              className="block text-sm text-text-secondary"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value="dummy@gmail.com"
              readOnly
              className={glassInputReadOnly}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-password"
              className="block text-sm text-text-secondary"
            >
              Password
            </label>
            <input
              id="profile-password"
              type="password"
              placeholder="••••••••"
              className={glassInput}
            />
          </div>
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button className={pillButton}>Save</Button>
        </div>
      </div>

      {/* Verification Document */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          Verification Document
        </h2>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          {verificationDocs.map((doc) => (
            <div key={doc} className="space-y-1.5">
              <label className="block text-sm text-text-secondary">
                {doc}
              </label>
              <div className="flex h-12 items-center rounded-full border border-white/25 bg-white/[0.03] pl-5 pr-1.5 backdrop-blur-md transition-colors focus-within:border-[#7D8CFF]/70">
                <span className="flex-1 text-sm text-white/40">
                  Upload File
                </span>
                <button
                  type="button"
                  aria-label={`Upload ${doc}`}
                  className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7D8CFF] transition-colors hover:bg-white/80"
                >
                  <UploadCloud className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-text-secondary">
                JPG, JPEG, or PNG. Max 2MB
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button className={pillButton}>Save</Button>
        </div>
      </div>
    </div>
  );
}
