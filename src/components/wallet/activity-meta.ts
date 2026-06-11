import {
  ArrowDownRight,
  ArrowUp,
  Brain,
  CalendarCheck,
  Coins,
  Gift,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ActivityType } from "@/lib/activities-api";

type Accent = "cyan" | "magenta" | "green" | "amber" | "red" | "gray";

export type ActivityMeta = {
  icon: LucideIcon;
  accent: Accent;
  /** Sign hint when the amount field is absent or unsigned. null = neutral. */
  sign: "+" | "-" | null;
};

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  prediction_placed: { icon: Target, accent: "cyan", sign: null },
  prediction_won: { icon: Trophy, accent: "green", sign: "+" },
  prediction_lost: { icon: X, accent: "red", sign: null },
  points_earned: { icon: Coins, accent: "green", sign: "+" },
  xp_gained: { icon: Zap, accent: "cyan", sign: "+" },
  checkin: { icon: CalendarCheck, accent: "green", sign: "+" },
  points_spent: { icon: ArrowDownRight, accent: "amber", sign: "-" },
  boost_used: { icon: Brain, accent: "magenta", sign: "-" },
  boost_received: { icon: Brain, accent: "magenta", sign: "+" },
  shield_used: { icon: Shield, accent: "cyan", sign: "-" },
  shield_received: { icon: ShieldCheck, accent: "cyan", sign: "+" },
  mission_claimed: { icon: Sparkles, accent: "green", sign: "+" },
  reward_redeemed: { icon: Gift, accent: "amber", sign: "-" },
  referral_earned: { icon: Users, accent: "green", sign: "+" },
  level_up: { icon: ArrowUp, accent: "magenta", sign: null },
};

const FALLBACK_META: ActivityMeta = {
  icon: Sparkles,
  accent: "gray",
  sign: null,
};

export function getActivityMeta(type: string): ActivityMeta {
  return ACTIVITY_META[type as ActivityType] ?? FALLBACK_META;
}

/** Tailwind text-color class per accent, for icon + amount. */
export const ACCENT_TEXT: Record<Accent, string> = {
  cyan: "text-cyan-400",
  magenta: "text-magenta-400",
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
  gray: "text-gray-400",
};

/** Tailwind icon-chip background class per accent. */
export const ACCENT_CHIP: Record<Accent, string> = {
  cyan: "bg-cyan-500/10 text-cyan-400",
  magenta: "bg-magenta-500/10 text-magenta-400",
  green: "bg-green-500/10 text-green-400",
  amber: "bg-amber-500/10 text-amber-400",
  red: "bg-red-500/10 text-red-400",
  gray: "bg-gray-500/10 text-gray-400",
};
