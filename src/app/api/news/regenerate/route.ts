import { regenerateTodayNews } from "@/lib/news-generator";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await regenerateTodayNews();
  return NextResponse.json(result);
}
