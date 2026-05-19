"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Check,
  Copy,
  Crown,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { privateLeagues } from "@/data/private-leagues";
import { getLeaguesPageCopy } from "@/data/leagues-page-content";

const CURRENT_USER_ID = "user-001";

export default function LeaguesPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getLeaguesPageCopy(locale);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const leagueSummaries = useMemo(
    () =>
      privateLeagues.map((league) => {
        const sortedMembers = [...league.members].sort(
          (a, b) => b.points - a.points
        );
        const currentUserRank =
          sortedMembers.findIndex((member) => member.userId === CURRENT_USER_ID) +
          1;
        const averageAccuracy =
          sortedMembers.reduce((sum, member) => sum + member.accuracy, 0) /
          Math.max(sortedMembers.length, 1);

        return {
          ...league,
          leader: sortedMembers[0],
          currentUserRank,
          averageAccuracy: Math.round(averageAccuracy),
          openSlots: Math.max(league.maxMembers - league.memberCount, 0),
          fillPercent: Math.round((league.memberCount / league.maxMembers) * 100),
          isOwner: league.ownerId === CURRENT_USER_ID,
        };
      }),
    []
  );

  const totalMembers = leagueSummaries.reduce(
    (sum, league) => sum + league.memberCount,
    0
  );
  const totalOpenSlots = leagueSummaries.reduce(
    (sum, league) => sum + league.openSlots,
    0
  );
  const averageAccuracy = Math.round(
    leagueSummaries.reduce((sum, league) => sum + league.averageAccuracy, 0) /
      Math.max(leagueSummaries.length, 1)
  );

  const handleCopy = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(inviteCode);
      window.setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      setCopiedCode(inviteCode);
      window.setTimeout(() => setCopiedCode(null), 1600);
    }
  };

  const stats = [
    {
      label: copy.stats.activeLeagues,
      value: leagueSummaries.length.toString(),
      icon: Trophy,
      tone: "text-amber-300",
    },
    {
      label: copy.stats.totalMembers,
      value: totalMembers.toLocaleString(),
      icon: Users,
      tone: "text-cyan-300",
    },
    {
      label: copy.stats.averageAccuracy,
      value: `${averageAccuracy}%`,
      icon: BarChart3,
      tone: "text-green-300",
    },
    {
      label: copy.stats.openSlots,
      value: totalOpenSlots.toLocaleString(),
      icon: UserPlus,
      tone: "text-purple-300",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-gray-800 bg-[#12121a] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <ShieldCheck size={14} />
              {copy.title}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {copy.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowJoin(true)}
            >
              <UserPlus size={14} />
              {copy.joinLeague}
            </Button>
            <Button size="sm" neon onClick={() => setShowCreate(true)}>
              <Plus size={14} />
              {copy.createLeague}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <Icon size={16} className={stat.tone} />
                </div>
                <p className="mt-2 text-xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">
            {copy.sections.myLeagues}
          </h2>
          <Badge variant="cyan" size="md">
            {leagueSummaries.length} {copy.stats.activeLeagues}
          </Badge>
        </div>

        {leagueSummaries.length === 0 ? (
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={14} />
                {copy.createLeague}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {leagueSummaries.map((league) => (
              <Card key={league.id} hover neon="cyan" className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {league.name}
                      </h3>
                      <Badge variant={league.isOwner ? "gold" : "default"}>
                        {league.isOwner ? copy.labels.owner : copy.labels.member}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={13} />
                        {league.memberCount}/{league.maxMembers}{" "}
                        {copy.labels.members}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <LockKeyhole size={13} />
                        {league.openSlots} {copy.labels.available}
                      </span>
                    </div>
                  </div>
                  <Badge variant="green" className="shrink-0">
                    {league.averageAccuracy}% {copy.labels.accuracy}
                  </Badge>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{copy.labels.capacity}</span>
                    <span>{league.fillPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${league.fillPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                    <p className="text-[11px] text-gray-500">
                      {copy.labels.weeklyLeader}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-white">
                        {league.leader.username}
                      </span>
                      <span className="text-xs text-amber-300">
                        {league.leader.points.toLocaleString()}{" "}
                        {copy.labels.points}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                    <p className="text-[11px] text-gray-500">
                      {copy.labels.yourRank}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                        <Crown size={14} className="text-amber-300" />
                        {league.currentUserRank > 0
                          ? `#${league.currentUserRank}`
                          : "-"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {league.members
                          .find((member) => member.userId === CURRENT_USER_ID)
                          ?.points.toLocaleString() ?? "0"}{" "}
                        {copy.labels.points}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 text-xs text-gray-500">
                    {copy.labels.inviteCode}{" "}
                    <code className="font-mono text-cyan-300">
                      {league.inviteCode}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(league.inviteCode)}
                    >
                      {copiedCode === league.inviteCode ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedCode === league.inviteCode
                        ? copy.labels.copied
                        : copy.labels.copyCode}
                    </Button>
                    <Link
                      href={`/${locale}/leaderboard`}
                      className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400"
                    >
                      {copy.labels.viewBoard}
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">
            {copy.sections.suggested}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {copy.discover.map((item) => (
              <Card key={item.title} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant="purple" className="shrink-0">
                    {item.tag}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">
            {copy.sections.howItWorks}
          </h2>
          <div className="space-y-3">
            {copy.how.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-xl border border-gray-800 bg-[#12121a] p-4"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-semibold text-cyan-300">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={copy.modal.createTitle}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-gray-400">
            {copy.modal.createDescription}
          </p>
          <Input
            label={copy.labels.leagueName}
            placeholder={copy.labels.namePlaceholder}
          />
          <Input label={copy.labels.maxMembers} type="number" placeholder="20" />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              {copy.labels.privacy}
            </label>
            <select className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20">
              <option>{copy.labels.inviteOnly}</option>
              <option>{copy.labels.publicDiscoverable}</option>
            </select>
          </div>
          <Button className="w-full" onClick={() => setShowCreate(false)}>
            <Plus size={14} />
            {copy.labels.create}
          </Button>
        </div>
      </Modal>

      <Modal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        title={copy.modal.joinTitle}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-gray-400">
            {copy.modal.joinDescription}
          </p>
          <Input
            label={copy.labels.inviteCode}
            placeholder={copy.labels.invitePlaceholder}
          />
          <Button className="w-full" onClick={() => setShowJoin(false)}>
            <UserPlus size={14} />
            {copy.labels.join}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
