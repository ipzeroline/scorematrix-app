import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function EventsPage() {
  return <EventsClient />;
}
