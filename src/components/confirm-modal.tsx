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
      <DialogContent className="bg-[#15161A] border border-white/10 text-white max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-white text-base font-semibold">{title}</DialogTitle>
          {description && <DialogDescription className="text-white/60">{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="bg-transparent border-t-0 p-0 mt-2">
          <Button variant="outline" className="border-white/20 text-white/70 hover:text-white" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button className="bg-white text-black hover:bg-white/90" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
