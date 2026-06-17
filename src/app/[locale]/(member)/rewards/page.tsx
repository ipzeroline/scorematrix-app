import type { Metadata } from "next";
import RewardsClient from "./RewardsClient";

export const metadata: Metadata = {
  title: "Rewards | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function RewardsPage() {
  return <RewardsClient />;
}
