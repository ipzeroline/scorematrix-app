"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { cn } from "@/lib/utils";
import { proxyFootballMediaUrl } from "@/lib/football-media";
import type { SoccerTeam, SoccerTeamGroup } from "@/lib/soccer-api";

type FavoriteTeamSelectProps = {
  groups: SoccerTeamGroup[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  className?: string;
};

type TeamOption = {
  team: SoccerTeam;
  league: SoccerTeamGroup["league"];
};

export function FavoriteTeamSelect({
  groups,
  value,
  onChange,
  placeholder,
  loading = false,
  className,
}: FavoriteTeamSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => findSelectedTeam(groups, value), [groups, value]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-left text-sm text-white transition-colors",
          "focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <ApiTeamLogo
              name={selected.team.name}
              logo={proxyFootballMediaUrl(selected.team.logo)}
              size="sm"
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-white">
                {selected.team.name}
              </span>
            </span>
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-gray-500 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close team selector"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-800 bg-[#0d1118] shadow-2xl">
            {groups.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">{placeholder}</div>
            ) : (
              groups.map((group) => (
                <section key={group.league.id} className="border-b border-gray-800/70 last:border-b-0">
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-800/70 bg-[#101722] px-3 py-2">
                    <ApiLeagueLogo
                      name={group.league.name}
                      logo={proxyFootballMediaUrl(group.league.logo)}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-cyan-100">
                        {group.league.name}
                      </p>
                      <p className="truncate text-[10px] text-gray-500">
                        {group.league.country}
                      </p>
                    </div>
                  </div>

                  <div className="p-1">
                    {group.teams.map((team) => {
                      const teamValue = String(team.id);
                      const active = value === teamValue;

                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => {
                            onChange(teamValue);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                            active
                              ? "bg-cyan-500/10 text-cyan-100"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <ApiTeamLogo
                            name={team.name}
                            logo={proxyFootballMediaUrl(team.logo)}
                            size="sm"
                            accent={active ? "cyan" : "gray"}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {team.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function findSelectedTeam(groups: SoccerTeamGroup[], value: string): TeamOption | undefined {
  if (!value) return undefined;

  for (const group of groups) {
    const team = group.teams.find((item) => String(item.id) === value);
    if (team) {
      return { team, league: group.league };
    }
  }

  return undefined;
}
