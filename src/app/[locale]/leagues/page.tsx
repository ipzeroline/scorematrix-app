"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, Copy } from "lucide-react";

const MOCK_LEAGUES = [
  { id: "l1", name: "Cyber Squad", inviteCode: "CYBER-2026", ownerId: "u1", memberCount: 12, maxMembers: 20 },
  { id: "l2", name: "Football Gurus", inviteCode: "GURU-2026", ownerId: "u2", memberCount: 8, maxMembers: 20 },
  { id: "l3", name: "Weekend Warriors", inviteCode: "WAR-2026", ownerId: "u1", memberCount: 15, maxMembers: 20 },
];

export default function LeaguesPage() {
  const { locale } = useParams<{ locale: string }>();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          Private Leagues
        </h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowJoin(true)}>
            Join League
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Create League
          </Button>
        </div>
      </div>

      {MOCK_LEAGUES.length === 0 ? (
        <EmptyState
          title="No leagues yet"
          description="Create or join a private league to compete with friends."
          action={
            <Button onClick={() => setShowCreate(true)}>Create League</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_LEAGUES.map((league) => (
            <Link key={league.id} href={`/${locale}/leagues/${league.id}`}>
              <Card hover neon="cyan" className="p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  {league.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {league.memberCount}/{league.maxMembers}
                  </span>
                  <span className="flex items-center gap-1">
                    Code: <code className="text-cyan-400">{league.inviteCode}</code>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create League Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create League">
        <div className="space-y-4">
          <Input label="League Name" placeholder="My Squad" />
          <Input label="Max Members" type="number" placeholder="20" />
          <Button className="w-full" onClick={() => setShowCreate(false)}>
            Create
          </Button>
        </div>
      </Modal>

      {/* Join League Modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join League">
        <div className="space-y-4">
          <Input label="Invite Code" placeholder="Enter code..." />
          <Button className="w-full" onClick={() => setShowJoin(false)}>
            Join
          </Button>
        </div>
      </Modal>
    </div>
  );
}
