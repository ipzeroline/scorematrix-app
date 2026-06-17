import type { Metadata } from "next";
import ProfileEditClient from "./ProfileEditClient";

export const metadata: Metadata = {
  title: "Edit Profile | ScoreMatrix",
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return <ProfileEditClient />;
}
