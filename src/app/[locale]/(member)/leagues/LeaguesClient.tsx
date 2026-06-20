"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
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

const AVAILABLE_LEAGUES_PAGE_SIZE = 20;

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
  const [availablePage, setAvailablePage] = useState(1);
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
        setAvailablePage(1);
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
  const availableTotalPages = Math.max(
    Math.ceil(filteredAvailableLeagues.length / AVAILABLE_LEAGUES_PAGE_SIZE),
    1
  );
  const safeAvailablePage = Math.min(availablePage, availableTotalPages);
  const availablePageStart =
    filteredAvailableLeagues.length === 0
      ? 0
      : (safeAvailablePage - 1) * AVAILABLE_LEAGUES_PAGE_SIZE + 1;
  const availablePageEnd = Math.min(
    safeAvailablePage * AVAILABLE_LEAGUES_PAGE_SIZE,
    filteredAvailableLeagues.length
  );
  const paginatedAvailableLeagues = filteredAvailableLeagues.slice(
    (safeAvailablePage - 1) * AVAILABLE_LEAGUES_PAGE_SIZE,
    safeAvailablePage * AVAILABLE_LEAGUES_PAGE_SIZE
  );

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
    <div className="mx-auto max-w-6xl space-y-4 pb-8 sm:space-y-5">
      <section className="rounded-xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="cyan" size="sm" className="uppercase tracking-wider">
                {copy.commandCenter}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                <ShieldCheck size={13} />
                {copy.skillNotice}
              </span>
            </div>
            <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:pt-7">
            <Button
              size="sm"
              variant="outline"
              disabled={availableLeagues.length === 0}
              onClick={scrollToAvailableLeagues}
              className="min-h-10 text-sm font-black"
            >
              <UserPlus size={16} />
              {copy.joinLeague}
            </Button>
            <Button
              size="sm"
              neon
              onClick={() => setShowCreate(true)}
              className="min-h-10 text-sm font-black"
            >
              <Plus size={16} />
              {copy.createLeague}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <HeroMetric
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              helper={copy.title}
              tone={stat.tone}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0a101a] p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Activity size={14} />
          </span>
          <h2 className="text-sm font-black uppercase tracking-wide text-white">
            {copy.sections.howItWorks}
          </h2>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {copy.how.map((item, index) => (
            <div
              key={item.title}
              className="flex gap-2.5 rounded-lg border border-gray-800 bg-[#0b111d] p-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-500/10 text-xs font-black text-cyan-300">
                {index + 1}
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{item.title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Radio}
          eyebrow={`${joinedLeagues.length} ${copy.stats.activeLeagues}`}
          title={copy.sections.myLeagues}
          description=""
          action={<Badge variant="cyan" size="md">{joinedLeagues.length} {copy.stats.activeLeagues}</Badge>}
        />

        {isLoadingLeagues ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                  className="relative space-y-3 overflow-hidden border-cyan-400/15 bg-[#0b111d] p-3.5"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/70 via-purple-400/60 to-amber-300/50" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black leading-tight text-white">
                          {league.name}
                        </h3>
                        <Badge variant={league.isOwner ? "gold" : "default"}>
                          {league.isOwner
                            ? copy.labels.owner
                            : copy.labels.member}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-400">
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
                    <Badge variant="green" size="sm" className="shrink-0">
                      {league.myPoints.toLocaleString()} {copy.labels.points}
                    </Badge>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                      <span>{copy.labels.capacity}</span>
                      <span>{fillPercent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full border border-gray-800 bg-black/40 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 rounded-xl border border-gray-800 bg-black/20 p-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-500">
                        {copy.labels.weeklyLeader}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-white">
                        {leader ? listCopy.topPlayer : "-"}{" "}
                        <span className="text-xs text-amber-300">
                          {(leader?.points ?? 0).toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <div className="min-w-0 sm:text-right">
                      <p className="text-xs font-bold text-gray-500">
                        {copy.labels.yourRank}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-white sm:justify-end">
                        <Crown size={13} className="text-amber-300" />
                        {league.myRank > 0 ? `#${league.myRank}` : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-gray-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 truncate text-xs text-gray-500">
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
                        className="inline-flex min-h-9 items-center justify-center rounded-lg bg-cyan-500 px-3 text-sm font-black text-black transition-colors hover:bg-cyan-400"
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

      <section ref={availableSectionRef} className="scroll-mt-24 space-y-3">
          <SectionHeader
            icon={Swords}
            eyebrow={listCopy.available}
            title={listCopy.available}
            description=""
            action={
              !isLoadingLeagues && availableLeagues.length > 0 ? (
                <Badge variant="cyan" size="sm">
                  {availablePageStart}-{availablePageEnd}/{filteredAvailableLeagues.length}
                </Badge>
              ) : undefined
            }
          />
          {!isLoadingLeagues && availableLeagues.length > 0 && (
            <Card className="border-cyan-400/15 bg-[#080d17] p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="available-league-search"
                    className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-white"
                  >
                    <Search size={14} className="text-cyan-300" />
                    {copy.searchLabel}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="available-league-search"
                      type="search"
                      value={availableSearch}
                      onChange={(event) => {
                        setAvailableSearch(event.target.value);
                        setAvailablePage(1);
                      }}
                      placeholder={copy.searchPlaceholder}
                      className="min-h-10 rounded-lg border-cyan-400/20 bg-black/30 pl-3 text-sm font-semibold"
                    />
                    {availableSearch && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAvailableSearch("");
                          setAvailablePage(1);
                        }}
                        className="min-h-10 shrink-0 px-3 text-sm font-black"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span className="font-mono text-xs font-bold text-gray-500">
                    {availablePageStart}-{availablePageEnd} / {filteredAvailableLeagues.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={safeAvailablePage <= 1}
                      onClick={() => setAvailablePage((page) => Math.max(page - 1, 1))}
                      className="min-h-9 px-2"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="min-w-14 text-center font-mono text-xs font-black text-cyan-200">
                      {safeAvailablePage}/{availableTotalPages}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={safeAvailablePage >= availableTotalPages}
                      onClick={() =>
                        setAvailablePage((page) =>
                          Math.min(page + 1, availableTotalPages)
                        )
                      }
                      className="min-h-9 px-2"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
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
            <Card className="overflow-hidden border-white/10 bg-[#0b111d] p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/25">
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                        {copy.labels.leagueName}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                        {listCopy.public}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-500">
                        {copy.labels.members}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-500">
                        {listCopy.entryFee}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-500">
                        {copy.labels.join}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAvailableLeagues.map((league) => {
                      const isFull = league.memberCount >= league.maxMembers;

                      return (
                        <tr
                          key={league.id}
                          className="border-b border-gray-800/60 last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="max-w-[360px] px-4 py-3">
                            <p className="truncate text-sm font-black text-white">
                              {league.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {league.description}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                isFull
                                  ? "default"
                                  : league.isLocked
                                    ? "purple"
                                    : "green"
                              }
                              className="shrink-0"
                            >
                              {isFull
                                ? listCopy.full
                                : league.isLocked
                                  ? listCopy.locked
                                  : listCopy.public}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-300">
                            {league.memberCount}/{league.maxMembers}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-300">
                            {league.entryFeeCredits === 0
                              ? listCopy.free
                              : league.entryFeeCredits.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isFull}
                              onClick={() => openJoinModal(league)}
                              className="min-h-9 px-3"
                            >
                              <UserPlus size={14} />
                              {isFull ? listCopy.full : copy.joinLeague}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
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
        "relative overflow-hidden rounded-xl border border-white/10 bg-black/28 p-3.5",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-black leading-none text-white sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold leading-5 text-gray-500">
            {helper}
          </p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
          <Icon size={19} className={tone} />
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
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0a101a] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <Icon size={14} />
          </span>
          {eyebrow}
        </div>
        <h2 className="font-display text-lg font-black text-white sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
