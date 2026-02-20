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
import { Clock } from "lucide-react";

interface TimeoutDialogProps {
  matchId: number;
  currentSet: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TimeoutDialog({ matchId, currentSet, open, onOpenChange }: TimeoutDialogProps) {
  const [teamSide, setTeamSide] = useState<"home" | "away">("home");
  const [duration, setDuration] = useState(30);

  const createTimeoutMutation = trpc.timeouts.create.useMutation({
    onSuccess: () => {
      toast.success("タイムアウトを記録しました");
      onOpenChange(false);
      setTeamSide("home");
      setDuration(30);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    createTimeoutMutation.mutate({
      matchId,
      setNumber: currentSet,
      teamSide,
      homeScore: 0, // TODO: 実際のスコアを渡す
      awayScore: 0, // TODO: 実際のスコアを渡す
      duration,
      type: duration === 60 ? "technical" : "regular",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            タイムアウト記録
          </DialogTitle>
          <DialogDescription>
            タイムアウトを取ったチームと時間を記録します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">チーム</label>
            <Select value={teamSide} onValueChange={(v) => setTeamSide(v as "home" | "away")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">自チーム</SelectItem>
                <SelectItem value="away">相手チーム</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">時間（秒）</label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30秒（通常）</SelectItem>
                <SelectItem value="60">60秒（テクニカル）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              各チームは1セットにつき2回のタイムアウトを取ることができます
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
            disabled={createTimeoutMutation.isPending}
            className="flex-1"
          >
            {createTimeoutMutation.isPending ? "記録中..." : "記録"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
