"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  useSubmitJudgeRecommendation,
  type JudgeRecommendation,
} from "@/hooks/use-juri";
import { getErrorMessage } from "@/lib/errors";

interface RecommendationActionsProps {
  submissionId: string;
  teamName: string;
  recommendation: JudgeRecommendation | null;
}

/**
 * Rekomendasi juri (Finalist / Waitlist) terhadap sebuah karya. Bersifat
 * advisory - finalis tetap ditentukan perhitungan panitia.
 */
export function RecommendationActions({
  submissionId,
  teamName,
  recommendation,
}: RecommendationActionsProps) {
  const recommend = useSubmitJudgeRecommendation(submissionId);
  const [pending, setPending] = useState<JudgeRecommendation | null>(null);

  const send = async (value: JudgeRecommendation) => {
    setPending(null);
    try {
      await recommend.mutateAsync(value);
      toast.success(
        `Rekomendasi untuk "${teamName}" tersimpan: ${
          value === "FINALIST" ? "Finalist" : "Waitlist"
        }`
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Gagal menyimpan rekomendasi untuk tim ini.")
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs text-white/60 leading-relaxed">
          Rekomendasi ini bersifat advisory. Finalis tetap ditentukan panitia
          lewat perhitungan otomatis pada halaman hasil penilaian.
        </p>
        {recommendation && (
          <p className="text-xs text-white">
            Rekomendasi Anda saat ini:{" "}
            <span
              className={`font-semibold ${
                recommendation === "FINALIST" ? "text-[#7D8CFF]" : "text-[#EAB308]"
              }`}
            >
              {recommendation === "FINALIST" ? "Finalist" : "Waitlist"}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          disabled={recommend.isPending}
          onClick={() => setPending("WAITLIST")}
          className="cursor-pointer px-6 py-2.5 rounded-full border border-[#3B5BFF] text-white text-sm font-semibold hover:bg-[#3B5BFF]/10 transition-colors bg-[#3B5BFF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Waitlist
        </button>
        <button
          type="button"
          disabled={recommend.isPending}
          onClick={() => setPending("FINALIST")}
          className="cursor-pointer px-6 py-2.5 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalist
        </button>
      </div>

      <ConfirmModal
        open={pending === "WAITLIST"}
        onOpenChange={(open) => !open && setPending(null)}
        title="Konfirmasi Waitlist"
        description={`Apakah Anda yakin ingin merekomendasikan "${teamName}" ke Waitlist?`}
        confirmText="Ya, Waitlist"
        cancelText="Batal"
        onConfirm={() => send("WAITLIST")}
      />

      <ConfirmModal
        open={pending === "FINALIST"}
        onOpenChange={(open) => !open && setPending(null)}
        title="Konfirmasi Finalist"
        description={`Apakah Anda yakin ingin merekomendasikan "${teamName}" sebagai Finalist?`}
        confirmText="Ya, Finalist"
        cancelText="Batal"
        onConfirm={() => send("FINALIST")}
      />
    </div>
  );
}
