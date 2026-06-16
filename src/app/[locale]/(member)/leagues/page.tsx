"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Crown,
  LockKeyhole,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Swords,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiClientError, isAuthSessionExpiredError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  createLeague,
  getLeagues,
  joinLeague,
  type AvailableLeague,
  type JoinedLeague,
} from "@/lib/leagues-api";
import { useNotificationStore } from "@/stores/notification-store";

const DEFAULT_CREATE_FORM = {
  name: "",
  description: "",
  maxMembers: "20",
  entryFeeCredits: "0",
  isPrivate: false,
};

type CreateFormErrors = Partial<
  Record<keyof typeof DEFAULT_CREATE_FORM | "submit", string>
>;

export default function LeaguesPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("leagues");
  const copy = {
    title: t("title"),
    subtitle: t("subtitle"),
    joinLeague: t("joinLeague"),
    createLeague: t("createLeague"),
    commandCenter: t("commandCenter"),
    skillNotice: t("skillNotice"),
    hubHint: t("hubHint"),
    availableHint: t("availableHint"),
    searchLabel: t("searchLabel"),
    searchPlaceholder: t("searchPlaceholder"),
    clearSearch: t("clearSearch"),
    noSearchResults: t("noSearchResults"),
    stats: {
      activeLeagues: t("activeLeagues"),
      totalMembers: t("totalMembers"),
      openSlots: t("openSlots"),
    },
    sections: {
      myLeagues: t("myLeagues"),
      howItWorks: t("howItWorks"),
    },
    labels: {
      members: t("members"),
      weeklyLeader: t("weeklyLeader"),
      yourRank: t("yourRank"),
      points: t("points"),
      available: t("available"),
      owner: t("owner"),
      member: t("member"),
      viewBoard: t("viewBoard"),
      capacity: t("capacity"),
      leagueName: t("leagueName"),
      maxMembers: t("maxMembers"),
      inviteOnly: t("inviteOnly"),
      create: t("create"),
      join: t("join"),
      inviteCode: t("inviteCode"),
      invitePlaceholder: t("invitePlaceholder"),
      namePlaceholder: t("namePlaceholder"),
    },
    empty: {
      title: t("noLeagues"),
      description: t("noLeaguesDescription"),
    },
    modal: {
      createTitle: t("createTitle"),
      createDescription: t("createDescription"),
      joinTitle: t("joinTitle"),
      joinDescription: t("joinDescription"),
      publicJoinDescription: t("publicJoinDescription"),
      joinSuccess: t("joinSuccess"),
      joinError: t("joinError"),
      inviteRequired: t("inviteRequired"),
    },
    how: [
      { title: t("howCreateTitle"), description: t("howCreateDescription") },
      { title: t("howPredictTitle"), description: t("howPredictDescription") },
      { title: t("howCompeteTitle"), description: t("howCompeteDescription") },
    ],
  };
  const createCopy = {
    description: t("description"),
    descriptionPlaceholder: t("descriptionPlaceholder"),
    entryFeeCredits: t("entryFeeCredits"),
    privateHint: t("privateHint"),
    createSuccess: t("createSuccess"),
    createError: t("createError"),
    validation: {
      name: t("validationName"),
      description: t("validationDescription"),
      maxMembers: t("validationMaxMembers"),
      entryFeeCredits: t("validationEntryFeeCredits"),
    },
  };
  const listCopy = {
    available: t("availableLeagues"),
    loadError: t("loadError"),
    retry: t("retry"),
    totalPoints: t("totalPoints"),
    entryFee: t("entryFee"),
    prizePool: t("prizePool"),
    free: t("free"),
    locked: t("locked"),
    public: t("public"),
    full: t("full"),
    topPlayer: t("topPlayer"),
    noAvailable: t("noAvailable"),
  };
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<AvailableLeague | null>(
    null
  );
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [joinedLeagues, setJoinedLeagues] = useState<JoinedLeague[]>([]);
  const [availableLeagues, setAvailableLeagues] = useState<AvailableLeague[]>([]);
  const [availableSearch, setAvailableSearch] = useState("");
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const availableSectionRef = useRef<HTMLDivElement>(null);
  const addToast = useNotificationStore((state) => state.addToast);

  useEffect(() => {
    let active = true;

    getLeagues({ locale })
      .then((response) => {
        if (!active) return;
        setJoinedLeagues(response.joined ?? []);
        setAvailableLeagues(response.available ?? []);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        setJoinedLeagues([]);
        setAvailableLeagues([]);
        setLoadFailed(true);
      })
      .finally(() => {
        if (active) setIsLoadingLeagues(false);
      });

    return () => {
      active = false;
    };
  }, [locale, refreshKey]);

  const totalMembers = joinedLeagues.reduce(
    (sum, league) => sum + league.memberCount,
    0
  );
  const totalOpenSlots = joinedLeagues.reduce(
    (sum, league) => sum + Math.max(league.maxMembers - league.memberCount, 0),
    0
  );
  const totalPoints = joinedLeagues.reduce(
    (sum, league) => sum + league.myPoints,
    0
  );
  const normalizedAvailableSearch = availableSearch.trim().toLowerCase();
  const filteredAvailableLeagues =
    normalizedAvailableSearch.length === 0
      ? availableLeagues
      : availableLeagues.filter((league) => {
          const accessLabel = league.isLocked ? listCopy.locked : listCopy.public;
          return [
            league.name,
            league.description ?? "",
            accessLabel,
            `${league.memberCount}/${league.maxMembers}`,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedAvailableSearch);
        });

  const closeCreateModal = () => {
    if (isCreating) return;
    setShowCreate(false);
    setCreateErrors({});
  };

  const openJoinModal = (league: AvailableLeague) => {
    if (league.memberCount >= league.maxMembers) return;

    setSelectedLeague(league);
    setInviteCode("");
    setJoinError("");
    setShowJoin(true);
  };

  const scrollToAvailableLeagues = () => {
    availableSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const closeJoinModal = () => {
    if (isJoining) return;
    setShowJoin(false);
    setSelectedLeague(null);
    setInviteCode("");
    setJoinError("");
  };

  const updateCreateForm = (
    field: keyof typeof DEFAULT_CREATE_FORM,
    value: string | boolean
  ) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
    setCreateErrors((current) => ({
      ...current,
      [field]: undefined,
      submit: undefined,
    }));
  };

  const handleCreateLeague = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const maxMembers =
      createForm.maxMembers === "" ? null : Number(createForm.maxMembers);
    const entryFeeCredits =
      createForm.entryFeeCredits === ""
        ? null
        : Number(createForm.entryFeeCredits);
    const errors: CreateFormErrors = {};

    if (name.length < 3 || name.length > 50) {
      errors.name = createCopy.validation.name;
    }
    if (description.length > 500) {
      errors.description = createCopy.validation.description;
    }
    if (
      maxMembers !== null &&
      (!Number.isInteger(maxMembers) || maxMembers < 2 || maxMembers > 100)
    ) {
      errors.maxMembers = createCopy.validation.maxMembers;
    }
    if (
      entryFeeCredits !== null &&
      (!Number.isInteger(entryFeeCredits) || entryFeeCredits < 0)
    ) {
      errors.entryFeeCredits = createCopy.validation.entryFeeCredits;
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setIsCreating(true);
    setCreateErrors({});

    try {
      await createLeague(
        {
          name,
          description: description || null,
          maxMembers,
          entryFeeCredits,
          isPrivate: createForm.isPrivate,
        },
        { locale }
      );
      setCreateForm(DEFAULT_CREATE_FORM);
      setShowCreate(false);
      setIsLoadingLeagues(true);
      setRefreshKey((current) => current + 1);
      addToast({ type: "success", title: createCopy.createSuccess });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : createCopy.createError;
      setCreateErrors({ submit: message });
      addToast({ type: "error", title: createCopy.createError, message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLeague = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLeague) return;
    if (selectedLeague.memberCount >= selectedLeague.maxMembers) {
      setJoinError(listCopy.full);
      return;
    }

    const normalizedInviteCode = inviteCode.trim();
    if (selectedLeague.isLocked && !normalizedInviteCode) {
      setJoinError(copy.modal.inviteRequired);
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      await joinLeague(
        selectedLeague.id,
        selectedLeague.isLocked
          ? { inviteCode: normalizedInviteCode }
          : undefined,
        { locale }
      );
      setShowJoin(false);
      setSelectedLeague(null);
      setInviteCode("");
      setIsLoadingLeagues(true);
      setRefreshKey((current) => current + 1);
      addToast({ type: "success", title: copy.modal.joinSuccess });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : copy.modal.joinError;
      setJoinError(message);
      addToast({ type: "error", title: copy.modal.joinError, message });
    } finally {
      setIsJoining(false);
    }
  };

  const stats = [
    {
      label: copy.stats.activeLeagues,
      value: joinedLeagues.length.toString(),
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
      label: listCopy.totalPoints,
      value: totalPoints.toLocaleString(),
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
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(168,85,247,0.13),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <div className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {copy.commandCenter}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {copy.skillNotice}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {copy.subtitle}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="md"
                variant="outline"
                disabled={availableLeagues.length === 0}
                onClick={scrollToAvailableLeagues}
                className="min-h-12 text-base font-black"
              >
                <UserPlus size={18} />
                {copy.joinLeague}
              </Button>
              <Button
                size="md"
                neon
                onClick={() => setShowCreate(true)}
                className="min-h-12 text-base font-black"
              >
                <Plus size={18} />
                {copy.createLeague}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat, index) => (
              <HeroMetric
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                helper={index === 0 ? copy.hubHint : copy.title}
                tone={stat.tone}
                className={index === 0 ? "sm:col-span-2" : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Radio}
          eyebrow={`${joinedLeagues.length} ${copy.stats.activeLeagues}`}
          title={copy.sections.myLeagues}
          description={copy.hubHint}
          action={<Badge variant="cyan" size="md">{joinedLeagues.length} {copy.stats.activeLeagues}</Badge>}
        />

        {isLoadingLeagues ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : loadFailed ? (
          <EmptyState
            title={listCopy.loadError}
            action={
              <Button
                onClick={() => {
                  setIsLoadingLeagues(true);
                  setRefreshKey((current) => current + 1);
                }}
              >
                {listCopy.retry}
              </Button>
            }
          />
        ) : joinedLeagues.length === 0 ? (
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
            {joinedLeagues.map((league) => {
              const openSlots = Math.max(
                league.maxMembers - league.memberCount,
                0
              );
              const fillPercent = Math.min(
                Math.round((league.memberCount / league.maxMembers) * 100),
                100
              );
              const leader = league.top3?.[0];

              return (
                <Card
                  key={league.id}
                  hover
                  neon="cyan"
                  className="relative space-y-5 overflow-hidden border-cyan-400/15 bg-[#0b111d] p-4 sm:p-5"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/70 via-purple-400/60 to-amber-300/50" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-black leading-tight text-white">
                          {league.name}
                        </h3>
                        <Badge variant={league.isOwner ? "gold" : "default"}>
                          {league.isOwner
                            ? copy.labels.owner
                            : copy.labels.member}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={13} />
                          {league.memberCount}/{league.maxMembers}{" "}
                          {copy.labels.members}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <LockKeyhole size={13} />
                          {openSlots} {copy.labels.available}
                        </span>
                      </div>
                    </div>
                    <Badge variant="green" size="md" className="shrink-0">
                      {league.myPoints.toLocaleString()} {copy.labels.points}
                    </Badge>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{copy.labels.capacity}</span>
                      <span>{fillPercent}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-gray-800 bg-black/40 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-800 bg-black/24 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {copy.labels.weeklyLeader}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-white">
                          {leader ? listCopy.topPlayer : "-"}
                        </span>
                        <span className="text-xs text-amber-300">
                          {(leader?.points ?? 0).toLocaleString()}{" "}
                          {copy.labels.points}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-800 bg-black/24 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {copy.labels.yourRank}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                          <Crown size={14} className="text-amber-300" />
                          {league.myRank > 0 ? `#${league.myRank}` : "-"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {league.myPoints.toLocaleString()}{" "}
                          {copy.labels.points}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 text-xs text-gray-500">
                      {league.description || listCopy.prizePool}{" "}
                      <span className="font-medium text-amber-300">
                        {league.description
                          ? ""
                          : league.prizePool.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/leagues/${league.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-cyan-500 px-4 text-sm font-black text-black transition-colors hover:bg-cyan-400"
                      >
                        {copy.labels.viewBoard}
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div ref={availableSectionRef} className="scroll-mt-24 space-y-3">
          <SectionHeader
            icon={Swords}
            eyebrow={listCopy.available}
            title={listCopy.available}
            description={copy.availableHint}
            action={
              !isLoadingLeagues && availableLeagues.length > 0 ? (
                <Badge variant="cyan" size="md">
                  {filteredAvailableLeagues.length}/{availableLeagues.length}
                </Badge>
              ) : undefined
            }
          />
          {!isLoadingLeagues && availableLeagues.length > 0 && (
            <Card className="border-cyan-400/15 bg-[#080d17] p-3 sm:p-4">
              <label
                htmlFor="available-league-search"
                className="mb-2 flex items-center gap-2 text-sm font-black text-white"
              >
                <Search size={16} className="text-cyan-300" />
                {copy.searchLabel}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="available-league-search"
                  type="search"
                  value={availableSearch}
                  onChange={(event) => setAvailableSearch(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="min-h-12 rounded-xl border-cyan-400/20 bg-black/30 pl-4 text-base font-semibold"
                />
                {availableSearch && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setAvailableSearch("")}
                    className="min-h-12 shrink-0 text-sm font-black"
                  >
                    <X size={16} />
                    {copy.clearSearch}
                  </Button>
                )}
              </div>
            </Card>
          )}
          {isLoadingLeagues ? (
            <div className="space-y-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : availableLeagues.length === 0 ? (
            <Card className="p-6 text-center text-sm text-gray-500">
              {listCopy.noAvailable}
            </Card>
          ) : filteredAvailableLeagues.length === 0 ? (
            <Card className="border-cyan-400/15 bg-[#0b111d] p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                <Search size={20} />
              </div>
              <h3 className="mt-3 text-lg font-black text-white">
                {copy.noSearchResults}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {copy.availableHint}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAvailableSearch("")}
                className="mt-4 min-h-10 text-sm font-black"
              >
                <X size={16} />
                {copy.clearSearch}
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {filteredAvailableLeagues.map((league) => {
                const isFull = league.memberCount >= league.maxMembers;

                return (
                <Card key={league.id} className="border-white/10 bg-[#0b111d] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {league.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {league.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        isFull ? "default" : league.isLocked ? "purple" : "green"
                      }
                      className="shrink-0"
                    >
                      {isFull
                        ? listCopy.full
                        : league.isLocked
                          ? listCopy.locked
                          : listCopy.public}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
                    <span className="text-sm font-bold text-gray-400">
                      {league.memberCount}/{league.maxMembers}{" "}
                      {copy.labels.members}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isFull}
                      onClick={() => openJoinModal(league)}
                    >
                      <UserPlus size={14} />
                      {isFull ? listCopy.full : copy.joinLeague}
                    </Button>
                  </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader
            icon={Activity}
            eyebrow={copy.sections.howItWorks}
            title={copy.sections.howItWorks}
            description={copy.hubHint}
          />
          <div className="space-y-3">
            {copy.how.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-gray-800 bg-[#0b111d] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-sm font-black text-cyan-300">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
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
        onClose={closeCreateModal}
        title={copy.modal.createTitle}
        size="lg"
        className="max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <form className="space-y-4" onSubmit={handleCreateLeague} noValidate>
          <p className="text-sm leading-6 text-gray-400">
            {copy.modal.createDescription}
          </p>
          <Input
            label={copy.labels.leagueName}
            placeholder={copy.labels.namePlaceholder}
            value={createForm.name}
            onChange={(event) => updateCreateForm("name", event.target.value)}
            minLength={3}
            maxLength={50}
            required
            error={createErrors.name}
          />
          <div>
            <label
              htmlFor="league-description"
              className="mb-1 block text-sm font-medium text-gray-400"
            >
              {createCopy.description}
            </label>
            <textarea
              id="league-description"
              value={createForm.description}
              onChange={(event) =>
                updateCreateForm("description", event.target.value)
              }
              maxLength={500}
              rows={4}
              placeholder={createCopy.descriptionPlaceholder}
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className="text-red-400">{createErrors.description}</span>
              <span className="text-gray-600">
                {createForm.description.length}/500
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={copy.labels.maxMembers}
              type="number"
              value={createForm.maxMembers}
              onChange={(event) =>
                updateCreateForm("maxMembers", event.target.value)
              }
              min={2}
              max={100}
              step={1}
              error={createErrors.maxMembers}
            />
            <Input
              label={createCopy.entryFeeCredits}
              type="number"
              value={createForm.entryFeeCredits}
              onChange={(event) =>
                updateCreateForm("entryFeeCredits", event.target.value)
              }
              min={0}
              step={1}
              error={createErrors.entryFeeCredits}
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            <input
              type="checkbox"
              checked={createForm.isPrivate}
              onChange={(event) =>
                updateCreateForm("isPrivate", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 accent-cyan-500"
            />
            <span>
              <span className="block text-sm font-medium text-white">
                {copy.labels.inviteOnly}
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                {createCopy.privateHint}
              </span>
            </span>
          </label>
          {createErrors.submit && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {createErrors.submit}
            </p>
          )}
          <Button className="w-full" type="submit" loading={isCreating}>
            <Plus size={14} />
            {copy.labels.create}
          </Button>
        </form>
      </Modal>

      <Modal
        open={showJoin}
        onClose={closeJoinModal}
        title={copy.modal.joinTitle}
      >
        <form className="space-y-4" onSubmit={handleJoinLeague}>
          {selectedLeague && (
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {selectedLeague.name}
                  </p>
                  {selectedLeague.description && (
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {selectedLeague.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant={selectedLeague.isLocked ? "purple" : "green"}
                  className="shrink-0"
                >
                  {selectedLeague.isLocked ? listCopy.locked : listCopy.public}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                <span className="text-gray-500">{listCopy.entryFee}</span>
                <span className="font-medium text-cyan-300">
                  {selectedLeague.entryFeeCredits === 0
                    ? listCopy.free
                    : `${selectedLeague.entryFeeCredits.toLocaleString()} Premium Credits`}
                </span>
              </div>
            </div>
          )}
          <p className="text-sm leading-6 text-gray-400">
            {selectedLeague?.isLocked
              ? copy.modal.joinDescription
              : copy.modal.publicJoinDescription}
          </p>
          {selectedLeague?.isLocked && (
            <Input
              label={copy.labels.inviteCode}
              placeholder={copy.labels.invitePlaceholder}
              value={inviteCode}
              onChange={(event) => {
                setInviteCode(event.target.value);
                setJoinError("");
              }}
              error={joinError}
            />
          )}
          {!selectedLeague?.isLocked && joinError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {joinError}
            </p>
          )}
          <Button
            className="w-full"
            type="submit"
            loading={isJoining}
            disabled={
              !selectedLeague ||
              selectedLeague.memberCount >= selectedLeague.maxMembers
            }
          >
            <UserPlus size={14} />
            {copy.labels.join}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  helper,
  tone,
  className,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  helper: string;
  tone: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/28 p-4",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            {helper}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon size={22} className={tone} />
        </span>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: typeof Trophy;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a101a] p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <Icon size={16} />
          </span>
          {eyebrow}
        </div>
        <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-gray-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
