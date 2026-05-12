"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Modal } from "@/components/ui/Modal";
import { MatchStatus } from "@/types/common";
import { Timer, Zap, Star } from "lucide-react";

export default function PredictMatchPage() {
  const { matchId, locale } = useParams<{ matchId: string; locale: string }>();
  const router = useRouter();
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const match = {
    home: "AC Milano Nord",
    away: "AS Roma Sud",
    league: "Serie A",
    round: "Round 34",
    time: "22:00",
    venue: "San Siro, Milan",
  };

  const handleSubmit = () => {
    if (homeScore === null || awayScore === null) return;
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    setSubmitted(true);
    setTimeout(() => router.push(`/${locale}/predict`), 2000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Predict Match
      </h1>

      {/* Match Info */}
      <Card className="p-5 text-center neon-cyan">
        <p className="text-[10px] text-gray-500 mb-1">
          {match.league} — {match.round}
        </p>
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 mx-auto mb-2 flex items-center justify-center text-cyan-400 font-bold">
              {match.home.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white">{match.home}</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-gray-500">vs</p>
            <p className="text-xs text-gray-500 mt-1">{match.time}</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-magenta-500/20 mx-auto mb-2 flex items-center justify-center text-magenta-400 font-bold">
              {match.away.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white">{match.away}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Timer size={12} />
          <span>Locks in 2h 30m</span>
        </div>
      </Card>

      {/* Score Input */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4 text-center">
          Predict the Score
        </h3>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">{match.home}</p>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setHomeScore(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-mono font-bold transition-colors cursor-pointer ${
                    homeScore === n
                      ? "bg-cyan-500 text-black"
                      : "bg-[#0a0a0f] border border-gray-700 text-gray-400 hover:border-cyan-500/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <span className="text-gray-600 font-bold mt-4">—</span>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">{match.away}</p>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setAwayScore(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-mono font-bold transition-colors cursor-pointer ${
                    awayScore === n
                      ? "bg-magenta-500 text-black"
                      : "bg-[#0a0a0f] border border-gray-700 text-gray-400 hover:border-magenta-500/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-xs text-gray-500">
          {homeScore !== null && awayScore !== null
            ? `Your prediction: ${homeScore} - ${awayScore}`
            : "Select scores above"}
        </div>
      </Card>

      {/* Streak & Bonus */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Zap size={14} className="mx-auto mb-1 text-amber-400" />
          <p className="text-xs text-gray-500">Streak</p>
          <p className="text-lg font-bold font-mono text-white">3</p>
        </Card>
        <Card className="p-3 text-center">
          <Star size={14} className="mx-auto mb-1 text-cyan-400" />
          <p className="text-xs text-gray-500">Pts/Correct</p>
          <p className="text-lg font-bold font-mono text-green-400">+5-10</p>
        </Card>
        <Card className="p-3 text-center">
          <PointsBadge type="free" amount={2840} size="md" showLabel />
          <p className="text-xs text-gray-500 mt-1">Balance</p>
        </Card>
      </div>

      {submitted ? (
        <Card className="p-5 text-center border-green-500/30 animate-slide-up">
          <p className="text-green-400 font-semibold mb-1">
            Prediction Submitted!
          </p>
          <p className="text-sm text-gray-400">
            Good luck! Results will be available after the match.
          </p>
        </Card>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={homeScore === null || awayScore === null}
          className="w-full"
          size="lg"
          neon
        >
          Submit Prediction
        </Button>
      )}

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Prediction"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">You are predicting:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-lg font-bold font-mono text-white">
                {match.home} {homeScore}
              </span>
              <span className="text-gray-500">—</span>
              <span className="text-lg font-bold font-mono text-white">
                {awayScore} {match.away}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              This prediction will lock at kickoff and cannot be changed.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={confirmSubmit} neon>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
