import type { Metadata } from "next";
import LeagueDetailClient from "./LeagueDetailClient";

export const metadata: Metadata = {
  title: "Private League Detail | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function LeagueDetailPage() {
  return <LeagueDetailClient />;
}
