import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { trpc as trpcClient } from "@/lib/trpc";

export default function Teams() {
  const [, navigate] = useLocation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [season, setSeason] = useState("");

  const { data: teams, refetch } = trpc.teams.list.useQuery();

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      toast.success("チームを作成しました");
      setIsCreateDialogOpen(false);
      setTeamName("");
      setSeason("");
      refetch();
    },
    onError: (error) => {
      toast.error("チームの作成に失敗しました", {
        description: error.message,
      });
    },
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast.error("チーム名を入力してください");
      return;
    }

    createTeam.mutate({
      teamName: teamName.trim(),
      season: season.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-2 md:p-4">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-1 md:gap-2 p-2 md:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">ホームに戻る</span>
            </Button>
            <h1 className="text-xl md:text-3xl font-bold">チーム管理</h1>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full md:w-auto text-sm md:text-base">
                <Plus className="w-4 h-4" />
                新しいチームを作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいチームを作成</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">チーム名 *</Label>
                  <Input
                    id="teamName"
                    placeholder="例: 〇〇高校バレーボール部"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season">シーズン（任意）</Label>
                  <Input
                    id="season"
                    placeholder="例: 2026年度"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateTeam}
                  className="w-full"
                  disabled={createTeam.isPending}
                >
                  {createTeam.isPending ? "作成中..." : "チームを作成"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* チーム一覧 */}
        {!teams || teams.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Users className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">チームがありません</h3>
                <p className="text-muted-foreground mb-6">
                  新しいチームを作成して、選手を登録しましょう
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  最初のチームを作成
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{team.teamName}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {team.season && (
                      <p className="text-sm text-muted-foreground">
                        シーズン: {team.season}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>選手を管理</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
