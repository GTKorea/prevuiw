"use client";
import { create } from "zustand";

type CommentMode = "idle" | "commenting";

export interface IframeScroll {
  scrollX: number;
  scrollY: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

interface CommentState {
  mode: CommentMode;
  activeCommentId: string | null;
  pinsVisible: boolean;
  iframePageUrl: string | null;
  modifierHeld: boolean;
  sdkDetected: boolean;
  setMode: (mode: CommentMode) => void;
  setActiveComment: (id: string | null) => void;
  setPinsVisible: (visible: boolean) => void;
  setIframePageUrl: (url: string | null) => void;
  setModifierHeld: (held: boolean) => void;
  setSdkDetected: (detected: boolean) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  mode: "idle",
  activeCommentId: null,
  pinsVisible: true,
  iframePageUrl: null,
  modifierHeld: false,
  sdkDetected: false,
  setMode: (mode) => set({ mode }),
  setActiveComment: (activeCommentId) => set({ activeCommentId }),
  setPinsVisible: (pinsVisible) => set({ pinsVisible }),
  setIframePageUrl: (iframePageUrl) => set({ iframePageUrl }),
  setModifierHeld: (modifierHeld) => set({ modifierHeld }),
  setSdkDetected: (sdkDetected) => set({ sdkDetected }),
}));
