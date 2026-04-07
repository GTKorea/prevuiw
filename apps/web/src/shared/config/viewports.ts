import type { Viewport } from "@/shared/types";
import { Monitor, Tablet, Smartphone, Laptop } from "lucide-react";

export const VIEWPORT_CONFIG = [
  { key: "MOBILE_375" as Viewport, label: "Mobile", icon: Smartphone, width: 375 },
  { key: "TABLET_768" as Viewport, label: "Tablet", icon: Tablet, width: 768 },
  { key: "LAPTOP_1440" as Viewport, label: "Laptop", icon: Laptop, width: 1440 },
  { key: "DESKTOP_1920" as Viewport, label: "Desktop", icon: Monitor, width: 1920 },
] as const;
