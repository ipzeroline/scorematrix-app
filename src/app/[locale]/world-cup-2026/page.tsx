import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WorldCupGroupsBoard } from "@/components/world-cup/WorldCupGroupsBoard";
import { LOCALE_CODES, type LocaleCode } from "@/i18n";
import { worldCupGroups } from "@/data/world-cup-2026";

type Props = {
  params: Promise<{ locale: string }>;
};

const copyByLocaleDefault = {
  title: "World Cup 2026 Groups",
  description:
    "Pick Group A-L to scan teams, standings and matchup cards in a quick sports-results layout.",
  eyebrow: "FIFA World Cup 2026",
  backHome: "Back home",
  allGroups: "Groups A-L",
  standings: "Standings",
  matches: "Matches",
  played: "P",
  wins: "W",
  draws: "D",
  losses: "L",
  goalDifference: "GD",
  points: "Pts",
  fifaRank: "FIFA rank",
  nextFixtures: "Group fixtures",
  groupStageSchedule: "Group stage fixtures",
  matchday: "Matchday",
  timeZone: "Times shown in Thailand time",
  winner: "Current 1st",
  runnerUp: "Current 2nd",
  third: "Current 3rd",
  sourceNote:
    "Before kickoff, every team starts on 0 points. The table is ordered by group draw position for quick scanning.",
  statTeams: "48 teams",
  statGroups: "12 groups",
  statKickoff: "11 Jun 2026",
};

const copyByLocale: Record<string, typeof copyByLocaleDefault> = {
  th: {
    title: "ตารางกลุ่มฟุตบอลโลก 2026",
    description:
      "เลือกกลุ่ม A-L เพื่อดูทีมในกลุ่ม ตารางอันดับ และคู่แข่งขันแบบหน้าผลกีฬาที่อ่านเร็ว",
    eyebrow: "FIFA World Cup 2026",
    backHome: "กลับหน้าแรก",
    allGroups: "กลุ่ม A-L",
    standings: "ตารางคะแนน",
    matches: "คู่แข่งขัน",
    played: "แข่ง",
    wins: "ชนะ",
    draws: "เสมอ",
    losses: "แพ้",
    goalDifference: "ได้เสีย",
    points: "แต้ม",
    fifaRank: "อันดับ FIFA",
    nextFixtures: "โปรแกรมในกลุ่ม",
    groupStageSchedule: "การแข่งขันรอบแบ่งกลุ่ม",
    matchday: "นัดที่",
    timeZone: "เวลาแสดงตามเวลาไทย",
    winner: "อันดับ 1 ตอนนี้",
    runnerUp: "อันดับ 2 ตอนนี้",
    third: "อันดับ 3 ตอนนี้",
    sourceNote:
      "ก่อนเริ่มทัวร์นาเมนต์ ทุกทีมยังมี 0 คะแนน ตารางนี้จัดตามลำดับทีมในกลุ่มเพื่อให้กดดูง่าย",
    statTeams: "48 ทีม",
    statGroups: "12 กลุ่ม",
    statKickoff: "11 มิ.ย. 2026",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getCopy(locale);

  return {
    title: `${copy.title} | ScoreMatrix`,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/world-cup-2026`,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, `/${code}/world-cup-2026`])
      ),
    },
    openGraph: {
      title: `${copy.title} | ScoreMatrix`,
      description: copy.description,
      type: "website",
      locale,
      url: `/${locale}/world-cup-2026`,
      siteName: "ScoreMatrix",
    },
  };
}

export default async function WorldCup2026Page({ params }: Props) {
  const { locale } = await params;
  const copy = getCopy(locale);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#080b12] p-4 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(245,158,11,0.14),transparent_26%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,38px_38px,38px_38px]" />
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <div>
            <Link
              href={`/${locale}`}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft size={16} />
              {copy.backHome}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold" size="md">
                {copy.eyebrow}
              </Badge>
              <Badge variant="cyan" size="md">
                {copy.allGroups}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-black leading-tight text-white md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400 md:text-base">
              {copy.description}
            </p>
            <div className="mt-5 grid max-w-2xl grid-cols-3 gap-2">
              {[
                { icon: Trophy, label: copy.statTeams },
                { icon: Globe2, label: copy.statGroups },
                { icon: CalendarDays, label: copy.statKickoff },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-gray-800 bg-black/25 p-3"
                  >
                    <Icon size={16} className="text-cyan-300" />
                    <p className="mt-2 text-xs font-bold text-white md:text-sm">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto h-52 w-36 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_38px_rgba(245,158,11,0.2)] md:h-64 md:w-44">
            <Image
              src="/brand/fifa-world-cup-2026.png"
              alt="FIFA World Cup 2026"
              fill
              priority
              sizes="(min-width: 768px) 176px, 144px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <WorldCupGroupsBoard groups={worldCupGroups} copy={copy} locale={locale} />
    </div>
  );
}

function getCopy(locale: string) {
  return copyByLocale[locale as LocaleCode] ?? copyByLocaleDefault;
}
