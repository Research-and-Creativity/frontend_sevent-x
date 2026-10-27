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
 * Rekomendasi juri terhadap sebuah karya. Finalis ditentukan dari rekomendasi
 * juri: tim yang direkomendasikan oleh mayoritas juri (lebih dari separuh)
 * akan dinyatakan finalis. Dengan 2 juri, keduanya harus setuju.
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
          value === "FINALIST" ? "Go to Finalist" : "Hold Team"
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
          Finalis ditentukan dari rekomendasi juri: tim yang direkomendasikan
          oleh mayoritas juri (lebih dari separuh) akan dinyatakan finalis.
          Dengan 2 juri, keduanya harus setuju.
        </p>
        {recommendation && (
          <p className="text-xs text-white">
            Rekomendasi Anda saat ini:{" "}
            <span
              className={`font-semibold ${
                recommendation === "FINALIST" ? "text-[#7D8CFF]" : "text-[#EAB308]"
              }`}
            >
              {recommendation === "FINALIST" ? "Go to Finalist" : "Hold Team"}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          disabled={recommend.isPending}
          onClick={() => setPending("FINALIST")}
          className="cursor-pointer px-6 py-2.5 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Go to Finalist
        </button>
      </div>

      <ConfirmModal
        open={pending === "FINALIST"}
        onOpenChange={(open) => !open && setPending(null)}
        title="Konfirmasi Go to Finalist"
        description={`Apakah Anda yakin ingin merekomendasikan "${teamName}" sebagai Finalist?`}
        confirmText="Ya, Go to Finalist"
        cancelText="Batal"
        onConfirm={() => send("FINALIST")}
      />
    </div>
  );
}
