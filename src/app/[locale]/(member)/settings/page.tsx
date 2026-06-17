import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
