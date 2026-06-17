import type { Metadata } from "next";
import MissionsClient from "./MissionsClient";

export const metadata: Metadata = {
  title: "Missions | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function MissionsPage() {
  return <MissionsClient />;
}
