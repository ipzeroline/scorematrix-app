type FootballLoadingProps = {
  compact?: boolean;
};

export function FootballLoading({ compact = false }: FootballLoadingProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={
        compact
          ? "grid min-h-48 place-items-center"
          : "grid min-h-[calc(100svh-12rem)] place-items-center"
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div className="football-loader-stage" aria-hidden="true">
          <div className="football-loader-ball">
            <span className="football-loader-emoji">⚽</span>
          </div>
          <span className="football-loader-shadow" />
        </div>
        <div className="flex items-center gap-2">
          <span className="football-loader-dot" />
          <span className="football-loader-dot football-loader-dot-delay-1" />
          <span className="football-loader-dot football-loader-dot-delay-2" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

export function FootballSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`football-spinner inline-flex shrink-0 items-center justify-center ${className}`}
      aria-hidden="true"
    >
      ⚽
    </span>
  );
}
