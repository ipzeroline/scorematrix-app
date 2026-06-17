import type { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
