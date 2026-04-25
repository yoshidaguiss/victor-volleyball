import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface SubstitutionDialogProps {
  matchId: number;
  currentSet: number;
  teamId?: number; // Optional for backward compatibility
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homePlayers?: any[]; // Optional for backward compatibility
  awayPlayers?: any[]; // Optional for backward compatibility
}

export default function SubstitutionDialog({
  matchId,
  currentSet,
  teamId,
  open,
  onOpenChange,
}: SubstitutionDialogProps) {
  const [playerOutId, setPlayerOutId] = useState<number | null>(null);
  const [playerInId, setPlayerInId] = useState<number | null>(null);
  const [isLibero, setIsLibero] = useState(false);

  const { data: players } = trpc.players.listByTeam.useQuery(
    { teamId },
    { enabled: !!teamId && teamId > 0 }
  );

  const createSubstitutionMutation = trpc.substitutions.create.useMutation({
    onSuccess: () => {
      toast.success("選手交代を記録しました");
      onOpenChange(false);
      setPlayerOutId(null);
      setPlayerInId(null);
      setIsLibero(false);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!playerOutId || !playerInId) {
      toast.error("交代する選手を選択してください");
      return;
    }

    const playerOut = players?.find(p => p.id === playerOutId);
    const playerIn = players?.find(p => p.id === playerInId);

    if (!playerOut || !playerIn) {
      toast.error("選手情報が見つかりません");
      return;
    }

    createSubstitutionMutation.mutate({
      matchId,
      setNumber: currentSet,
      teamSide: "home",
      playerOutId,
      playerOutNumber: playerOut.number,
      playerOutName: playerOut.name,
      playerInId,
      playerInNumber: playerIn.number,
      playerInName: playerIn.name,
      isLibero,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            選手交代記録
          </DialogTitle>
          <DialogDescription>
            コートから出る選手と入る選手を選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">コートから出る選手</label>
            <Select
              value={playerOutId?.toString() || ""}
              onValueChange={(v) => setPlayerOutId(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="選手を選択..." />
              </SelectTrigger>
              <SelectContent>
                {players?.map((player: { id: number; number: number; name: string }) => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-2xl text-gray-400">↓</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">コートに入る選手</label>
            <Select
              value={playerInId?.toString() || ""}
              onValueChange={(v) => setPlayerInId(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="選手を選択..." />
              </SelectTrigger>
              <SelectContent>
                {players
                  ?.filter((p: { id: number }) => p.id !== playerOutId)
                  .map((player: { id: number; number: number; name: string }) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      #{player.number} {player.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isLibero"
              checked={isLibero}
              onChange={(e) => setIsLibero(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isLibero" className="text-sm">
              リベロ交代
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              各チームは1セットにつき6回まで選手交代ができます（リベロ交代は回数制限なし）
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSubstitutionMutation.isPending || !playerOutId || !playerInId}
            className="flex-1"
          >
            {createSubstitutionMutation.isPending ? "記録中..." : "記録"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
