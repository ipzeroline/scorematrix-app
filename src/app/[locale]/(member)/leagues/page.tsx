"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  BarChart3,
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
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiClientError, isAuthSessionExpiredError } from "@/lib/api-client";
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
              disabled={availableLeagues.length === 0}
              onClick={scrollToAvailableLeagues}
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
            {joinedLeagues.length} {copy.stats.activeLeagues}
          </Badge>
        </div>

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
                  className="space-y-4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {league.name}
                        </h3>
                        <Badge variant={league.isOwner ? "gold" : "default"}>
                          {league.isOwner
                            ? copy.labels.owner
                            : copy.labels.member}
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
                          {openSlots} {copy.labels.available}
                        </span>
                      </div>
                    </div>
                    <Badge variant="green" className="shrink-0">
                      {league.myPoints.toLocaleString()} {copy.labels.points}
                    </Badge>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{copy.labels.capacity}</span>
                      <span>{fillPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width: `${fillPercent}%` }}
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
                          {leader ? listCopy.topPlayer : "-"}
                        </span>
                        <span className="text-xs text-amber-300">
                          {(leader?.points ?? 0).toLocaleString()}{" "}
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
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400"
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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div ref={availableSectionRef} className="scroll-mt-24 space-y-3">
          <h2 className="text-base font-semibold text-white">
            {listCopy.available}
          </h2>
          {isLoadingLeagues ? (
            <div className="space-y-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : availableLeagues.length === 0 ? (
            <Card className="p-6 text-center text-sm text-gray-500">
              {listCopy.noAvailable}
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {availableLeagues.map((league) => {
                const isFull = league.memberCount >= league.maxMembers;

                return (
                <Card key={league.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {league.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
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
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-800 pt-3">
                    <span className="text-xs text-gray-500">
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
