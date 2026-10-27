"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

export function ConfirmModal({ open, onOpenChange, title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm }: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1D24]/80 backdrop-blur-xl border border-white/20 text-white max-w-md rounded-2xl p-8 shadow-[0_0_60px_rgba(125,140,255,0.15)]" showCloseButton={false}>
        <div className="flex items-start justify-between">
          <DialogTitle className="text-white text-2xl font-extrabold tracking-tight">{title}</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="cursor-pointer w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white" aria-label="Close">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {description && <DialogDescription className="text-white/60 text-sm leading-relaxed -mt-2">{description}</DialogDescription>}
        <div className="flex justify-end gap-3 mt-6">
          <button className="cursor-pointer px-8 py-3 rounded-full border border-white/20 text-white/70 text-sm font-semibold hover:text-white transition-colors" onClick={() => onOpenChange(false)}>
            {cancelText}
          </button>
          <button className="cursor-pointer px-10 py-3 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
