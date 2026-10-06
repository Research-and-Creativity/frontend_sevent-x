"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

export interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading: boolean;
  title: string;
  targetName: string;
  targetDetail?: string;
  contextMessage: string;
  isPreviouslyRejected?: boolean;
  previousRejectionReason?: string | null;
  confirmButtonText?: string;
}

export function AdminApproveModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  targetName,
  targetDetail,
  contextMessage,
  isPreviouslyRejected,
  previousRejectionReason,
  confirmButtonText = "Ya, Approve",
}: ApproveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-surface border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <h3 className="font-display text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Context Box */}
        <div className="p-3 bg-card border border-white/10 rounded-xl space-y-1">
          <p className="text-xs font-bold text-white">{targetName}</p>
          {targetDetail && (
            <p className="text-[10px] text-text-secondary font-mono">
              {targetDetail}
            </p>
          )}
        </div>

        {/* Informational Context */}
        <p className="text-xs text-text-secondary leading-relaxed">
          {contextMessage}
        </p>

        {/* Warning: Previously Rejected */}
        {isPreviouslyRejected && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Perhatian: Menimpa Status Penolakan
              </p>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Item ini sebelumnya berstatus <strong>REJECTED</strong>
                {previousRejectionReason
                  ? ` dengan alasan: "${previousRejectionReason}"`
                  : ""}
                . Menyetujui item ini akan mengubah statusnya menjadi Terverifikasi.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="bg-card border-border text-text-secondary hover:text-white text-xs h-9 rounded-xl cursor-pointer disabled:opacity-50"
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 rounded-xl px-5 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </div>
            ) : (
              <span>{confirmButtonText}</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  isLoading: boolean;
  title: string;
  targetName: string;
  targetDetail?: string;
  isPreviouslyApproved?: boolean;
  placeholder?: string;
  confirmButtonText?: string;
}

export function AdminRejectModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  targetName,
  targetDetail,
  isPreviouslyApproved,
  placeholder = "Contoh: Berkas tidak sesuai ketentuan, foto buram, link tidak dapat diakses, dll",
  confirmButtonText = "Tolak Dokumen",
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isLoading) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-surface border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
          <h3 className="font-display text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Context Box */}
        <div className="p-3 bg-card border border-white/10 rounded-xl space-y-1">
          <p className="text-xs font-bold text-white">{targetName}</p>
          {targetDetail && (
            <p className="text-[10px] text-text-secondary font-mono">
              {targetDetail}
            </p>
          )}
        </div>

        {/* Warning: Previously Approved */}
        {isPreviouslyApproved && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Perhatian: Menimpa Status Terverifikasi
              </p>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Item ini sebelumnya sudah <strong>TERVERIFIKASI</strong> — menolak item ini akan membatalkan status verifikasi dan meminta peserta untuk revisi.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
              Alasan Penolakan <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-card border border-border/80 rounded-xl p-3 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-text-secondary">
              Alasan ini akan ditampilkan langsung ke peserta di dashboard agar mereka dapat segera melakukan perbaikan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="bg-card border-border text-text-secondary hover:text-white text-xs h-9 rounded-xl cursor-pointer disabled:opacity-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <span>{confirmButtonText}</span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
