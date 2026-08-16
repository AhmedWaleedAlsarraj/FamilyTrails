import { Award, BookOpen, Compass, Flag, Trophy, type LucideIcon } from "lucide-react";

export const FRAME_RING_STYLES: Record<string, string> = {
  frame_bronze: "ring-[#B08D57]",
  frame_silver: "ring-gray-400",
  frame_gold: "ring-yellow-400",
};

const BADGE_ICONS: Record<string, LucideIcon> = {
  Compass,
  BookOpen,
  Flag,
  Trophy,
};

// The catalog stores an icon name; anything unrecognised falls back to a
// generic award so a new badge row never renders as a blank space.
export function badgeIcon(icon: string | null): LucideIcon {
  return (icon && BADGE_ICONS[icon]) || Award;
}
