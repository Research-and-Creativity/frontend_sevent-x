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
      <DialogContent className="bg-[#101216] border border-white/10 text-white max-w-sm rounded-2xl p-6 shadow-[0_0_60px_rgba(125,140,255,0.15)]" showCloseButton={false}>
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#7D8CFF]/15 border border-[#7D8CFF]/30 flex items-center justify-center mb-1">
            <svg className="w-6 h-6 text-[#9AA6FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <DialogTitle className="text-white text-lg font-bold tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription className="text-white/60 text-sm leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="bg-transparent border-t border-white/10 p-0 mt-5 pt-5">
          <Button variant="outline" className="border-white/20 text-white/70 hover:text-white rounded-full px-6" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
