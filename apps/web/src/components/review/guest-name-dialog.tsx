"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GUEST_NAME_KEY = "prevuiw_guest_name";

export function getGuestName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_NAME_KEY);
}

export function setGuestName(name: string) {
  localStorage.setItem(GUEST_NAME_KEY, name);
}

interface GuestNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function GuestNameDialog({
  open,
  onClose,
  onSubmit,
}: GuestNameDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setGuestName(trimmed);
    onSubmit(trimmed);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter your name</DialogTitle>
          <DialogDescription>
            Choose a nickname to leave comments as a guest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
