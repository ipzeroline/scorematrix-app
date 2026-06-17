import type { Metadata } from "next";
import RewardDetailClient from "./RewardDetailClient";

export const metadata: Metadata = {
  title: "Reward Detail | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function RewardDetailPage() {
  return <RewardDetailClient />;
}
