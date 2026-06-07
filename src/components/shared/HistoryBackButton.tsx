"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HistoryBackButtonProps {
  label: string;
  fallbackHref: string;
}

export function HistoryBackButton({ label, fallbackHref }: HistoryBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleBack} className="w-fit">
      <ArrowLeft size={15} aria-hidden="true" />
      {label}
    </Button>
  );
}
