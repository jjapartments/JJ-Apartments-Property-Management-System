"use client";

import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogFooter,
     DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MoveOutModalProps = {
     open: boolean;
     title?: string;
     message: string;
     onCancel: () => void;
     onConfirm: () => void;
};

export function MoveOutModal({
     open,
     title = "Confirm Delete",
     message = "Are you sure you want to delete this record?",
     onCancel,
     onConfirm,
}: MoveOutModalProps) {
     return (
          <Dialog open={open} onOpenChange={onCancel}>
               <DialogContent>
               <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
               </DialogHeader>
               <p>{message}</p>
               <DialogFooter>
                    <Button variant="secondary" onClick={onCancel}>
                    Cancel
                    </Button>
                    <Button onClick={onConfirm}>Confirm</Button>
               </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}