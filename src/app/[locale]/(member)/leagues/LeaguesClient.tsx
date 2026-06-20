"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Hourglass,
  LockKeyhole,
  LogOut,
  ImageIcon,
  Pencil,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Swords,
  Target,
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
  getLeague,
  getLeagues,
  joinLeague,
  leaveLeague,
  updateLeague,
  type AvailableLeague,
  type JoinedLeague,
  type LeagueLimit,
  type OwnedLeagueLimit,
  type LeaguePagination,
} from "@/lib/leagues-api";
import { useNotificationStore } from "@/stores/notification-store";

const DEFAULT_CREATE_FORM = {
  name: "",
  description: "",
  entryFeeCredits: "0",
  isPrivate: false,
  inviteCode: "",
  logo: null as File | null,
};

const AVAILABLE_LEAGUES_PAGE_SIZE = 20;
const LEAGUE_LOGO_OVERRIDE_KEY = "scorematrix:league-logo:";
const LEAGUE_INVITE_OVERRIDE_KEY = "scorematrix:league-invite:";
const PENDING_LEAGUE_REQUESTS_KEY = "scorematrix:pending-league-requests";

type LeagueTab = "joined" | "available";

type CreateFormErrors = Partial<
  Record<keyof typeof DEFAULT_CREATE_FORM | "submit", string>
>;

const DEFAULT_PAGINATION: LeaguePagination = {
  page: 1,
  limit: AVAILABLE_LEAGUES_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

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
      createRemaining: t("createRemaining"),
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
      inviteOnly: t("inviteOnly"),
      create: t("create"),
      join: t("join"),
      inviteCode: t("inviteCode"),
      invitePlaceholder: t("invitePlaceholder"),
      namePlaceholder: t("namePlaceholder"),
      customInviteCode: t("customInviteCode"),
      logo: t("logo"),
      edit: t("edit"),
      save: t("save"),
      leave: t("leave"),
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
      joinPending: t("joinPending"),
      paidJoinSuccess: t("paidJoinSuccess"),
      joinError: t("joinError"),
      inviteRequired: t("inviteRequired"),
      leaveSuccess: t("leaveSuccess"),
      leaveError: t("leaveError"),
      cooldownNotice: t("cooldownNotice"),
      confirmLeave: t("confirmLeave"),
      updateTitle: t("updateTitle"),
      updateDescription: t("updateDescription"),
      updateSuccess: t("updateSuccess"),
      updateError: t("updateError"),
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
      entryFeeCredits: t("validationEntryFeeCredits"),
      inviteCode: t("validationInviteCode"),
      logo: t("validationLogo"),
      logoProcessing: t("logoProcessing"),
      duplicateName: t("validationDuplicateName"),
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
    pendingApproval: t("pendingApproval"),
    paidInstant: t("paidInstant"),
    topPlayer: t("topPlayer"),
    noAvailable: t("noAvailable"),
  };
  const [showCreate, setShowCreate] = useState(false);
  const [editingLeague, setEditingLeague] = useState<JoinedLeague | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<AvailableLeague | null>(
    null
  );
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [leavingLeagueId, setLeavingLeagueId] = useState<string | null>(null);
  const [pendingLeagueIds, setPendingLeagueIds] = useState<Set<string>>(
    () => readStoredPendingLeagueRequestIds()
  );
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoOverrides, setLogoOverrides] = useState<Record<string, string>>({});
  const [inviteOverrides, setInviteOverrides] = useState<Record<string, string>>({});
  const [copiedInviteLeagueId, setCopiedInviteLeagueId] = useState<string | null>(
    null
  );
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [joinedLeagues, setJoinedLeagues] = useState<JoinedLeague[]>([]);
  const [availableLeagues, setAvailableLeagues] = useState<AvailableLeague[]>([]);
  const [availableSearch, setAvailableSearch] = useState("");
  const [appliedAvailableSearch, setAppliedAvailableSearch] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [availablePagination, setAvailablePagination] =
    useState<LeaguePagination>(DEFAULT_PAGINATION);
  const [leagueLimits, setLeagueLimits] = useState<{
    create?: LeagueLimit;
    join?: LeagueLimit;
    owned?: OwnedLeagueLimit;
  }>({});
  const [activeLeagueTab, setActiveLeagueTab] = useState<LeagueTab>("joined");
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(() => Date.now());
  const leagueTabsRef = useRef<HTMLDivElement>(null);
  const addToast = useNotificationStore((state) => state.addToast);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedAvailableSearch(availableSearch.trim());
      setAvailablePage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [availableSearch]);

  useEffect(() => {
    let active = true;

    getLeagues({
      locale,
      page: availablePage,
      limit: AVAILABLE_LEAGUES_PAGE_SIZE,
      search: appliedAvailableSearch,
    })
      .then((response) => {
        if (!active) return;
        const joined = response.joined ?? [];
        const available = response.available ?? [];
        const joinedIds = new Set(joined.map((league) => league.id));
        const backendPendingIds = new Set(
          available
            .filter((league) => league.joinStatus === "pending")
            .map((league) => league.id)
        );
        setJoinedLeagues(joined);
        setAvailableLeagues(available);
        setPendingLeagueIds((current) => {
          const next = new Set(
            [...current, ...backendPendingIds].filter(
              (leagueId) => !joinedIds.has(leagueId)
            )
          );
          storePendingLeagueRequestIds(next);
          return next;
        });
        setLogoOverrides((current) =>
          hydrateStoredLogoOverrides(current, joined, available)
        );
        setInviteOverrides((current) =>
          hydrateStoredInviteOverrides(current, joined)
        );
        setAvailablePagination(response.pagination ?? DEFAULT_PAGINATION);
        setLeagueLimits(response.limits ?? {});
        setLoadFailed(false);
        fetchMissingOwnerInviteCodes(joined, locale).then((codes) => {
          if (!active || Object.keys(codes).length === 0) return;
          setInviteOverrides((current) => ({ ...current, ...codes }));
          setJoinedLeagues((current) =>
            current.map((league) =>
              codes[league.id]
                ? { ...league, inviteCode: codes[league.id] }
                : league
            )
          );
        });
      })
      .catch((error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        setJoinedLeagues([]);
        setAvailableLeagues([]);
        setAvailablePagination(DEFAULT_PAGINATION);
        setLeagueLimits({});
        setLoadFailed(true);
      })
      .finally(() => {
        if (active) setIsLoadingLeagues(false);
      });

    return () => {
      active = false;
    };
  }, [appliedAvailableSearch, availablePage, locale, refreshKey]);

  const ownedLimits = leagueLimits.owned;
  const totalMembers = ownedLimits?.totalMembers ?? joinedLeagues.reduce(
    (sum, league) => sum + league.memberCount,
    0
  );
  const totalOpenSlots = ownedLimits?.availableSlots ?? joinedLeagues.reduce(
    (sum, league) =>
      league.isOwner
        ? sum + Math.max(league.maxMembers - league.memberCount, 0)
        : sum,
    0
  );
  const totalPoints = ownedLimits?.totalPoints ?? joinedLeagues.reduce(
    (sum, league) => sum + league.myPoints,
    0
  );
  const availableTotalPages = Math.max(availablePagination.totalPages, 1);
  const safeAvailablePage = Math.min(availablePagination.page, availableTotalPages);
  const availablePageStart =
    availablePagination.total === 0
      ? 0
      : (safeAvailablePage - 1) * availablePagination.limit + 1;
  const availablePageEnd = Math.min(
    safeAvailablePage * availablePagination.limit,
    availablePagination.total
  );
  const createLimit = leagueLimits.create;
  const createRemaining = createLimit?.remaining ?? 0;
  const createMax = createLimit?.max ?? 0;
  const canCreateLeague = (leagueLimits.create?.remaining ?? 1) > 0;
  const resolveLeagueLogoUrl = (leagueId: string, logoUrl: string | null) =>
    logoOverrides[leagueId] ?? logoUrl;
  const resolveLeagueInviteCode = (
    leagueId: string,
    inviteCode: string | null
  ) => inviteOverrides[leagueId] ?? inviteCode;

  const closeCreateModal = () => {
    if (isCreating || isUpdating) return;
    setShowCreate(false);
    setEditingLeague(null);
    setCreateForm(DEFAULT_CREATE_FORM);
    setLogoPreviewUrl(null);
    setCreateErrors({});
  };

  const openCreateModal = () => {
    setEditingLeague(null);
    setCreateForm(DEFAULT_CREATE_FORM);
    setLogoPreviewUrl(null);
    setCreateErrors({});
    setShowCreate(true);
  };

  const openEditModal = (league: JoinedLeague) => {
    const inviteCode = resolveLeagueInviteCode(league.id, league.inviteCode);
    setEditingLeague(league);
    setCreateForm({
      name: league.name,
      description: league.description ?? "",
      entryFeeCredits: String(league.entryFeeCredits ?? 0),
      isPrivate: league.isPrivate,
      inviteCode: inviteCode ?? "",
      logo: null,
    });
    setLogoPreviewUrl(null);
    setCreateErrors({});
    setShowCreate(true);
    void hydrateEditLeagueForm(league);
  };

  const hydrateEditLeagueForm = async (league: JoinedLeague) => {
    if (!league.isOwner) return;

    try {
      const detail = await getLeague(league.id, { locale });
      setCreateForm((current) => ({
        ...current,
        name: detail.name ?? current.name,
        description: detail.description ?? current.description,
        entryFeeCredits: String(detail.entryFeeCredits ?? 0),
        isPrivate: detail.isPrivate,
        inviteCode: detail.inviteCode ?? current.inviteCode,
      }));

      if (detail.inviteCode) {
        setInviteOverrides((current) => ({
          ...current,
          [league.id]: detail.inviteCode ?? "",
        }));
        storeLeagueInviteOverride(league.id, detail.inviteCode);
      }
    } catch {
      // The modal can still edit fields already available in the list response.
    }
  };

  const openJoinModal = (league: AvailableLeague) => {
    if (league.memberCount >= league.maxMembers) return;

    setSelectedLeague(league);
    setInviteCode("");
    setJoinError("");
    setShowJoin(true);
  };

  const copyInviteCode = async (leagueId: string, inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedInviteLeagueId(leagueId);
      window.setTimeout(() => {
        setCopiedInviteLeagueId((current) =>
          current === leagueId ? null : current
        );
      }, 1600);
    } catch {
      setCopiedInviteLeagueId(null);
    }
  };

  const activateAvailableTab = () => {
    setActiveLeagueTab("available");
    window.requestAnimationFrame(() => {
      leagueTabsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
    value: string | boolean | File | null
  ) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
    setCreateErrors((current) => ({
      ...current,
      [field]: undefined,
      submit: undefined,
    }));
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setCreateErrors((current) => ({ ...current, logo: undefined, submit: undefined }));

    if (!file) {
      updateCreateForm("logo", null);
      setLogoPreviewUrl(null);
      return;
    }

    setIsProcessingLogo(true);
    try {
      const normalizedLogo = await normalizeLogoImage(file);
      updateCreateForm("logo", normalizedLogo);
      setLogoPreviewUrl(await readFileAsDataUrl(normalizedLogo));
    } catch {
      event.target.value = "";
      updateCreateForm("logo", null);
      setCreateErrors((current) => ({
        ...current,
        logo: createCopy.validation.logo,
      }));
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleCreateLeague = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const entryFeeCredits =
      createForm.entryFeeCredits === ""
        ? null
        : Number(createForm.entryFeeCredits);
    const inviteCode = createForm.inviteCode.trim().toUpperCase();
    const errors: CreateFormErrors = {};

    if (name.length < 3 || name.length > 50) {
      errors.name = createCopy.validation.name;
    }
    if (
      inviteCode.length > 0 &&
      !/^[A-Z0-9]{4,20}$/.test(inviteCode)
    ) {
      errors.inviteCode = createCopy.validation.inviteCode;
    }
    if (description.length > 500) {
      errors.description = createCopy.validation.description;
    }
    if (
      entryFeeCredits !== null &&
      (!Number.isInteger(entryFeeCredits) || entryFeeCredits < 0)
    ) {
      errors.entryFeeCredits = createCopy.validation.entryFeeCredits;
    }
    if (createErrors.logo) {
      errors.logo = createErrors.logo;
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    if (hasDuplicateLeagueName(name, editingLeague?.id)) {
      setCreateErrors({ name: createCopy.validation.duplicateName });
      return;
    }

    if (editingLeague) {
      setIsUpdating(true);
    } else {
      setIsCreating(true);
    }
    setCreateErrors({});
    const editingLeagueId = editingLeague?.id ?? null;
    const submittedLogoPreviewUrl = logoPreviewUrl;

    try {
      if (!editingLeague || normalizeLeagueName(name) !== normalizeLeagueName(editingLeague.name)) {
        const remoteDuplicate = await hasRemoteDuplicateLeagueName(
          name,
          editingLeague?.id
        );
        if (remoteDuplicate) {
          setCreateErrors({ name: createCopy.validation.duplicateName });
          return;
        }
      }

      const payload = {
        name,
        description: description || null,
        maxMembers: null,
        entryFeeCredits,
        isPrivate: createForm.isPrivate,
        inviteCode: inviteCode || null,
        logo: createForm.logo,
      };

      let savedLeagueId = editingLeagueId;

      if (editingLeague) {
        await updateLeague(editingLeague.id, payload, { locale });
      } else {
        const createdLeague = await createLeague(payload, { locale });
        if (
          typeof createdLeague.id === "string" ||
          typeof createdLeague.id === "number"
        ) {
          savedLeagueId = String(createdLeague.id);
        }
      }

      if (savedLeagueId && submittedLogoPreviewUrl) {
        setLogoOverrides((current) => ({
          ...current,
          [savedLeagueId]: submittedLogoPreviewUrl,
        }));
        storeLeagueLogoOverride(savedLeagueId, submittedLogoPreviewUrl);
      }
      if (savedLeagueId && inviteCode) {
        setInviteOverrides((current) => ({
          ...current,
          [savedLeagueId]: inviteCode,
        }));
        storeLeagueInviteOverride(savedLeagueId, inviteCode);
      }
      setCreateForm(DEFAULT_CREATE_FORM);
      setLogoPreviewUrl(null);
      setEditingLeague(null);
      setShowCreate(false);
      setIsLoadingLeagues(true);
      setRefreshKey((current) => current + 1);
      addToast({
        type: "success",
        title: editingLeague ? copy.modal.updateSuccess : createCopy.createSuccess,
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : editingLeague
            ? copy.modal.updateError
            : createCopy.createError;
      setCreateErrors({ submit: message });
      addToast({
        type: "error",
        title: editingLeague ? copy.modal.updateError : createCopy.createError,
        message,
      });
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
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
      const result = await joinLeague(
        selectedLeague.id,
        selectedLeague.isLocked
          ? { inviteCode: normalizedInviteCode }
          : undefined,
        { locale }
      );
      const isFreeLeague = selectedLeague.entryFeeCredits === 0;
      setShowJoin(false);
      setSelectedLeague(null);
      setInviteCode("");
      if (isFreeLeague || result.status === "pending") {
        setPendingLeagueIds((current) => {
          const next = new Set(current).add(selectedLeague.id);
          storePendingLeagueRequestIds(next);
          return next;
        });
        addToast({
          type: "success",
          title: copy.modal.joinPending,
          message: copy.modal.cooldownNotice,
        });
      } else {
        setIsLoadingLeagues(true);
        setRefreshKey((current) => current + 1);
        addToast({
          type: "success",
          title: copy.modal.paidJoinSuccess,
        });
      }
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : copy.modal.joinError;
      setJoinError(message);
      addToast({ type: "error", title: copy.modal.joinError, message });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveLeague = async (league: JoinedLeague) => {
    if (!window.confirm(copy.modal.confirmLeave)) return;

    setLeavingLeagueId(league.id);

    try {
      await leaveLeague(league.id, { locale });
      setJoinedLeagues((current) =>
        current.filter((item) => item.id !== league.id)
      );
      setIsLoadingLeagues(true);
      setRefreshKey((current) => current + 1);
      addToast({
        type: "success",
        title: copy.modal.leaveSuccess,
        message: copy.modal.cooldownNotice,
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : copy.modal.leaveError;
      addToast({ type: "error", title: copy.modal.leaveError, message });
    } finally {
      setLeavingLeagueId(null);
    }
  };

  const hasDuplicateLeagueName = (name: string, excludedLeagueId?: string) => {
    const normalizedName = normalizeLeagueName(name);
    return [...joinedLeagues, ...availableLeagues].some(
      (league) =>
        league.id !== excludedLeagueId &&
        normalizeLeagueName(league.name) === normalizedName
    );
  };

  const hasRemoteDuplicateLeagueName = async (
    name: string,
    excludedLeagueId?: string
  ) => {
    try {
      const response = await getLeagues({
        locale,
        search: name,
        page: 1,
        limit: 20,
      });
      const normalizedName = normalizeLeagueName(name);
      return [...(response.joined ?? []), ...(response.available ?? [])].some(
        (league) =>
          league.id !== excludedLeagueId &&
          normalizeLeagueName(league.name) === normalizedName
      );
    } catch {
      return false;
    }
  };

  const stats = [
    {
      label: copy.stats.activeLeagues,
      value: (ownedLimits?.leagues ?? joinedLeagues.length).toString(),
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

          <div className="flex shrink-0 flex-col gap-2 xl:pt-7">
            <div
              className={cn(
                "rounded-xl border px-3 py-2 text-center",
                canCreateLeague
                  ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-100"
                  : "border-red-400/25 bg-red-500/10 text-red-100"
              )}
            >
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                {copy.stats.createRemaining}
              </p>
              <p className="mt-1 font-mono text-2xl font-black leading-none">
                {createLimit
                  ? `${createRemaining.toLocaleString()}/${createMax.toLocaleString()}`
                  : "-"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              disabled={availableLeagues.length === 0}
              onClick={activateAvailableTab}
              className="min-h-10 text-sm font-black"
            >
              <UserPlus size={16} />
              {copy.joinLeague}
            </Button>
            <Button
              size="sm"
              neon
              disabled={!canCreateLeague}
              onClick={openCreateModal}
              className="min-h-10 text-sm font-black"
            >
              <Plus size={16} />
              {copy.createLeague}
            </Button>
            </div>
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

      <section className="rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/[0.09] via-[#0a101a] to-purple-500/[0.08] p-4 shadow-[0_18px_52px_rgba(0,0,0,0.22)]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-400/12 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14)]">
              <Activity size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-white">
                {copy.sections.howItWorks}
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                {copy.hubHint}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100">
            <ShieldCheck size={13} />
            {copy.skillNotice}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {copy.how.map((item, index) => {
            const stepStyles = [
              {
                icon: Plus,
                border: "border-cyan-300/25",
                bg: "bg-cyan-500/[0.07]",
                iconBox: "border-cyan-300/30 bg-cyan-400/12 text-cyan-100",
                number: "text-cyan-200",
              },
              {
                icon: Target,
                border: "border-purple-300/25",
                bg: "bg-purple-500/[0.07]",
                iconBox: "border-purple-300/30 bg-purple-400/12 text-purple-100",
                number: "text-purple-200",
              },
              {
                icon: Trophy,
                border: "border-amber-300/25",
                bg: "bg-amber-500/[0.07]",
                iconBox: "border-amber-300/30 bg-amber-400/12 text-amber-100",
                number: "text-amber-200",
              },
            ][index];
            const StepIcon = stepStyles.icon;

            return (
            <div
              key={item.title}
              className={cn(
                "flex gap-3 rounded-xl border p-3",
                stepStyles.border,
                stepStyles.bg
              )}
            >
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
                  stepStyles.iconBox
                )}
              >
                <StepIcon size={18} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-mono text-[11px] font-black uppercase tracking-wide",
                    stepStyles.number
                  )}
                >
                  STEP {index + 1}
                </p>
                <h3 className="mt-0.5 text-sm font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <div
        ref={leagueTabsRef}
        className="scroll-mt-24 rounded-xl border border-white/10 bg-[#070b13] p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.22)]"
      >
        <div className="grid gap-1.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveLeagueTab("joined")}
            className={cn(
              "flex min-h-12 items-center justify-between rounded-lg border px-3 text-left transition-all",
              activeLeagueTab === "joined"
                ? "border-cyan-400/45 bg-gradient-to-r from-cyan-500/18 to-emerald-500/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                : "border-cyan-400/10 bg-cyan-500/[0.03] text-gray-400 hover:border-cyan-400/25 hover:bg-cyan-500/[0.07] hover:text-cyan-100"
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <Radio
                size={16}
                className={cn(
                  "shrink-0",
                  activeLeagueTab === "joined"
                    ? "text-cyan-200"
                    : "text-cyan-400/70"
                )}
              />
              <span className="truncate text-sm font-black">
                {copy.sections.myLeagues}
              </span>
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-xs font-black",
                activeLeagueTab === "joined"
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                  : "border-cyan-400/15 bg-black/25 text-cyan-300/70"
              )}
            >
              {joinedLeagues.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLeagueTab("available")}
            className={cn(
              "flex min-h-12 items-center justify-between rounded-lg border px-3 text-left transition-all",
              activeLeagueTab === "available"
                ? "border-purple-300/45 bg-gradient-to-r from-purple-500/18 to-amber-400/10 text-white shadow-[0_0_24px_rgba(168,85,247,0.14)]"
                : "border-purple-400/10 bg-purple-500/[0.03] text-gray-400 hover:border-purple-300/25 hover:bg-purple-500/[0.07] hover:text-purple-100"
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <Swords
                size={16}
                className={cn(
                  "shrink-0",
                  activeLeagueTab === "available"
                    ? "text-purple-100"
                    : "text-purple-300/70"
                )}
              />
              <span className="truncate text-sm font-black">
                {listCopy.available}
              </span>
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-xs font-black",
                activeLeagueTab === "available"
                  ? "border-amber-200/25 bg-amber-300/10 text-amber-100"
                  : "border-purple-400/15 bg-black/25 text-purple-300/70"
              )}
            >
              {availablePagination.total || availableLeagues.length}
            </span>
          </button>
        </div>
      </div>

      {activeLeagueTab === "joined" ? (
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
              <Button onClick={openCreateModal} disabled={!canCreateLeague}>
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
              const inviteCode = resolveLeagueInviteCode(
                league.id,
                league.inviteCode
              );

              return (
                <Card
                  key={league.id}
                  hover
                  neon="cyan"
                  className="relative space-y-3 overflow-hidden border-cyan-400/15 bg-[#0b111d] p-3.5"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/70 via-purple-400/60 to-amber-300/50" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <LeagueLogo
                        name={league.name}
                        logoUrl={resolveLeagueLogoUrl(league.id, league.logoUrl)}
                        variant="featured"
                        cacheKey={refreshKey}
                      />
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
                        {inviteCode ? (
                          <button
                            type="button"
                            onClick={() => copyInviteCode(league.id, inviteCode)}
                            className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 font-mono text-[11px] font-black tracking-wide text-purple-200 transition-colors hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100"
                            title={`${copy.labels.inviteCode} ${inviteCode}`}
                            aria-label={`${copy.labels.inviteCode} ${inviteCode}`}
                          >
                            <LockKeyhole size={12} className="shrink-0" />
                            <span className="truncate">{inviteCode}</span>
                            {copiedInviteLeagueId === league.id ? (
                              <Check size={12} className="shrink-0" />
                            ) : (
                              <Copy size={12} className="shrink-0" />
                            )}
                          </button>
                        ) : null}
                      </div>
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
                    <div className="flex shrink-0 items-center gap-2">
                      {!league.isOwner ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          loading={leavingLeagueId === league.id}
                          onClick={() => handleLeaveLeague(league)}
                          className="min-h-9 whitespace-nowrap px-3 text-sm font-black"
                        >
                          <LogOut size={14} />
                          {copy.labels.leave}
                        </Button>
                      ) : null}
                      {league.isOwner ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(league)}
                          className="min-h-9 whitespace-nowrap px-3 text-sm font-black"
                        >
                          <Pencil size={14} />
                          {copy.labels.edit}
                        </Button>
                      ) : null}
                      <Link
                        href={`/${locale}/leagues/${league.id}`}
                        className="inline-flex min-h-9 min-w-[92px] items-center justify-center rounded-lg bg-cyan-500 px-3 text-center text-sm font-black leading-none text-black transition-colors hover:bg-cyan-400"
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
      ) : (

      <section className="space-y-3">
          <SectionHeader
            icon={Swords}
            eyebrow={listCopy.available}
            title={listCopy.available}
            description=""
            action={
              !isLoadingLeagues && availableLeagues.length > 0 ? (
                <Badge variant="cyan" size="sm">
                  {availablePageStart}-{availablePageEnd}/{availablePagination.total}
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
                    {availablePageStart}-{availablePageEnd} / {availablePagination.total}
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
          ) : availableLeagues.length === 0 && appliedAvailableSearch ? (
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
          ) : availableLeagues.length === 0 ? (
            <Card className="p-6 text-center text-sm text-gray-500">
              {listCopy.noAvailable}
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
                    {availableLeagues.map((league) => {
                      const isFull = league.memberCount >= league.maxMembers;
                      const isPending = pendingLeagueIds.has(league.id);
                      const isFreeLeague = league.entryFeeCredits === 0;

                      return (
                        <tr
                          key={league.id}
                          className="border-b border-gray-800/60 last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="max-w-[360px] px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <LeagueLogo
                                name={league.name}
                                logoUrl={resolveLeagueLogoUrl(league.id, league.logoUrl)}
                                variant="table"
                                cacheKey={refreshKey}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">
                                  {league.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {league.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                isPending
                                  ? "gold"
                                  : isFull
                                  ? "default"
                                  : league.isLocked
                                    ? "purple"
                                    : "green"
                              }
                              className="shrink-0"
                            >
                              {isPending
                                ? listCopy.pendingApproval
                                : isFull
                                ? listCopy.full
                                : league.isLocked
                                  ? listCopy.locked
                                  : listCopy.public}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-mono text-sm font-bold text-gray-300">
                              {league.memberCount}/{league.maxMembers}
                            </p>
                            <p className="mt-1 text-xs font-bold text-cyan-300">
                              {Math.max(league.maxMembers - league.memberCount, 0)}{" "}
                              {copy.labels.available}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-300">
                            {league.entryFeeCredits === 0
                              ? listCopy.free
                              : league.entryFeeCredits.toLocaleString()}
                            <p className="mt-1 text-xs font-bold text-gray-500">
                              {isFreeLeague
                                ? listCopy.pendingApproval
                                : listCopy.paidInstant}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isFull || isPending}
                              onClick={() => openJoinModal(league)}
                              className="min-h-9 px-3"
                            >
                              {isPending ? (
                                <Hourglass size={14} />
                              ) : (
                                <UserPlus size={14} />
                              )}
                              {isPending
                                ? listCopy.pendingApproval
                                : isFull
                                  ? listCopy.full
                                  : copy.joinLeague}
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
      )}

      <Modal
        open={showCreate}
        onClose={closeCreateModal}
        title={editingLeague ? copy.modal.updateTitle : copy.modal.createTitle}
        size="lg"
        className="max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <form className="space-y-4" onSubmit={handleCreateLeague} noValidate>
          <p className="text-sm leading-6 text-gray-400">
            {editingLeague
              ? copy.modal.updateDescription
              : copy.modal.createDescription}
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
          <Input
            label={copy.labels.customInviteCode}
            placeholder="MYCODE"
            value={createForm.inviteCode}
            onChange={(event) =>
              updateCreateForm("inviteCode", event.target.value.toUpperCase())
            }
            minLength={4}
            maxLength={20}
            error={createErrors.inviteCode}
          />
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
          <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            {logoPreviewUrl || editingLeague ? (
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-cyan-400/15 bg-cyan-500/[0.04] p-2.5">
                <LeagueLogo
                  name={createForm.name || editingLeague?.name || "League"}
                  logoUrl={
                    logoPreviewUrl ??
                    (editingLeague
                      ? resolveLeagueLogoUrl(
                          editingLeague.id,
                          editingLeague.logoUrl
                        )
                      : null)
                  }
                  variant="preview"
                  cacheKey={refreshKey}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-500">
                    {copy.labels.logo}
                  </p>
                  <p className="truncate text-sm font-black text-white">
                    {createForm.name || editingLeague?.name || "League"}
                  </p>
                </div>
              </div>
            ) : null}
            <label
              htmlFor="league-logo"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-white"
            >
              <ImageIcon size={16} className="text-cyan-300" />
              {copy.labels.logo}
            </label>
            <input
              id="league-logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full cursor-pointer rounded-lg border border-gray-700 bg-black/30 text-sm text-gray-400 file:mr-3 file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-black file:text-black"
            />
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {createCopy.validation.logo}
            </p>
            {isProcessingLogo ? (
              <p className="mt-2 text-xs font-semibold text-cyan-200">
                {createCopy.validation.logoProcessing}
              </p>
            ) : null}
            {createForm.logo ? (
              <p className="mt-2 truncate text-xs font-semibold text-cyan-200">
                {createForm.logo.name}
              </p>
            ) : null}
            {createErrors.logo ? (
              <p className="mt-2 text-xs font-semibold text-red-300">
                {createErrors.logo}
              </p>
            ) : null}
          </div>
          {createErrors.submit && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {createErrors.submit}
            </p>
          )}
          <Button
            className="w-full"
            type="submit"
            loading={isCreating || isUpdating || isProcessingLogo}
            disabled={isProcessingLogo}
          >
            {editingLeague ? <Pencil size={14} /> : <Plus size={14} />}
            {editingLeague ? copy.labels.save : copy.labels.create}
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
            {selectedLeague?.entryFeeCredits === 0
              ? copy.modal.publicJoinDescription
              : copy.modal.joinDescription}
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

function LeagueLogo({
  name,
  logoUrl,
  variant = "default",
  cacheKey,
}: {
  name: string;
  logoUrl: string | null;
  variant?: "default" | "featured" | "table" | "preview";
  cacheKey?: number;
}) {
  const sizeClass = {
    default: "h-14 w-14 rounded-2xl text-lg",
    featured: "h-20 w-20 rounded-2xl text-2xl",
    table: "h-[52px] w-[52px] rounded-xl text-lg",
    preview: "h-16 w-16 rounded-2xl text-xl",
  }[variant];
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      <span
        className={`${sizeClass} relative grid shrink-0 place-items-center overflow-hidden border border-cyan-300/45 bg-cyan-400/10 p-1 shadow-[0_0_24px_rgba(34,211,238,0.18)] ring-1 ring-white/10`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_34%)]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withCacheKey(logoUrl, cacheKey)}
          alt=""
          className="relative h-full w-full rounded-[inherit] object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`${sizeClass} grid shrink-0 place-items-center border border-cyan-300/45 bg-gradient-to-br from-cyan-400/20 via-purple-500/12 to-amber-300/14 font-mono font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)] ring-1 ring-white/10`}
    >
      {initials || "L"}
    </span>
  );
}

function withCacheKey(url: string, cacheKey?: number) {
  if (!cacheKey || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheKey}`;
}

function hydrateStoredLogoOverrides(
  current: Record<string, string>,
  joined: JoinedLeague[],
  available: AvailableLeague[]
) {
  let next = current;

  for (const league of [...joined, ...available]) {
    const storedLogo = readStoredLeagueLogoOverride(league.id);
    if (!storedLogo || current[league.id] === storedLogo) continue;
    if (next === current) next = { ...current };
    next[league.id] = storedLogo;
  }

  return next;
}

function hydrateStoredInviteOverrides(
  current: Record<string, string>,
  joined: JoinedLeague[]
) {
  let next = current;

  for (const league of joined) {
    const storedInvite = readStoredLeagueInviteOverride(league.id);
    if (!storedInvite || current[league.id] === storedInvite) continue;
    if (next === current) next = { ...current };
    next[league.id] = storedInvite;
  }

  return next;
}

async function fetchMissingOwnerInviteCodes(
  leagues: JoinedLeague[],
  locale: string
) {
  const missingInviteLeagues = leagues.filter(
    (league) => !league.inviteCode
  );
  if (missingInviteLeagues.length === 0) return {};

  const entries = await Promise.all(
    missingInviteLeagues.map(async (league) => {
      try {
        const detail = await getLeague(league.id, { locale });
        return detail.inviteCode
          ? ([league.id, detail.inviteCode] as const)
          : null;
      } catch {
        return null;
      }
    })
  );

  const codes: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry) continue;
    codes[entry[0]] = entry[1];
    storeLeagueInviteOverride(entry[0], entry[1]);
  }

  return codes;
}

function readStoredLeagueLogoOverride(leagueId: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(`${LEAGUE_LOGO_OVERRIDE_KEY}${leagueId}`);
  } catch {
    return null;
  }
}

function readStoredLeagueInviteOverride(leagueId: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(`${LEAGUE_INVITE_OVERRIDE_KEY}${leagueId}`);
  } catch {
    return null;
  }
}

function storeLeagueInviteOverride(leagueId: string, inviteCode: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${LEAGUE_INVITE_OVERRIDE_KEY}${leagueId}`,
      inviteCode
    );
  } catch {
    // Local storage is best-effort; fetched detail data still updates the current view.
  }
}

function storeLeagueLogoOverride(leagueId: string, logoUrl: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(`${LEAGUE_LOGO_OVERRIDE_KEY}${leagueId}`, logoUrl);
  } catch {
    // A large image can exceed storage quota. The in-memory override still updates the current view.
  }
}

function readStoredPendingLeagueRequestIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const rawValue = window.localStorage.getItem(PENDING_LEAGUE_REQUESTS_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(
      parsed
        .filter((value): value is string => typeof value === "string")
        .filter(Boolean)
    );
  } catch {
    return new Set<string>();
  }
}

function storePendingLeagueRequestIds(leagueIds: Set<string>) {
  if (typeof window === "undefined") return;

  try {
    const values = Array.from(leagueIds);
    if (values.length === 0) {
      window.localStorage.removeItem(PENDING_LEAGUE_REQUESTS_KEY);
      return;
    }
    window.localStorage.setItem(PENDING_LEAGUE_REQUESTS_KEY, JSON.stringify(values));
  } catch {
    // Pending state is only a UI hint; backend requests remain the source of truth.
  }
}

function normalizeLeagueName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Invalid image"));
    };
    reader.onerror = () => reject(new Error("Invalid image"));
    reader.readAsDataURL(file);
  });
}

function normalizeLogoImage(file: File) {
  return new Promise<File>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");

      if (!context || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        reject(new Error("Invalid image"));
        return;
      }

      context.clearRect(0, 0, 512, 512);
      const scale = Math.min(512 / image.naturalWidth, 512 / image.naturalHeight);
      const width = Math.round(image.naturalWidth * scale);
      const height = Math.round(image.naturalHeight * scale);
      const x = Math.round((512 - width) / 2);
      const y = Math.round((512 - height) / 2);

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, x, y, width, height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Invalid image"));
          return;
        }

        const baseName =
          file.name
            .replace(/\.[^.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "league-logo";
        resolve(
          new File([blob], `${baseName}-512.png`, {
            type: "image/png",
            lastModified: Date.now(),
          })
        );
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    image.src = url;
  });
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
