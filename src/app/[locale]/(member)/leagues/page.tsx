import type { Metadata } from "next";
import LeaguesClient from "./LeaguesClient";

export const metadata: Metadata = {
  title: "Private Leagues | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function LeaguesPage() {
  return <LeaguesClient />;
}
