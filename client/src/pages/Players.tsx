import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Plus, User, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Players() {
  const [teamId, setTeamId] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    number: 0,
    name: "",
    position: "WS" as "S" | "MB" | "WS" | "OP" | "L",
    isLibero: false,
  });

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: players, refetch } = trpc.players.listByTeam.useQuery(
    { teamId },
    { enabled: teamId > 0 }
  );

  const createPlayerMutation = trpc.players.create.useMutation({
    onSuccess: () => {
      toast.success("選手を追加しました");
      setIsDialogOpen(false);
      refetch();
      setNewPlayer({ number: 0, name: "", position: "WS", isLibero: false });
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleCreatePlayer = () => {
    if (!newPlayer.name || newPlayer.number === 0) {
      toast.error("背番号と名前を入力してください");
      return;
    }

    createPlayerMutation.mutate({
      teamId,
      ...newPlayer,
    });
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      S: "セッター",
      MB: "ミドルブロッカー",
      WS: "ウイングスパイカー",
      OP: "オポジット",
      L: "リベロ",
    };
    return labels[position] || position;
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      S: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      MB: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      WS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      OP: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      L: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[position] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={teamId === 0}>
                <Plus className="w-4 h-4 mr-2" />
                選手を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しい選手を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>背番号</Label>
                  <Input
                    type="number"
                    value={newPlayer.number || ""}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>名前</Label>
                  <Input
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    placeholder="山田太郎"
                  />
                </div>
                <div>
                  <Label>ポジション</Label>
                  <Select
                    value={newPlayer.position}
                    onValueChange={(value: any) => setNewPlayer({ ...newPlayer, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">セッター</SelectItem>
                      <SelectItem value="MB">ミドルブロッカー</SelectItem>
                      <SelectItem value="WS">ウイングスパイカー</SelectItem>
                      <SelectItem value="OP">オポジット</SelectItem>
                      <SelectItem value="L">リベロ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreatePlayer} className="w-full">
                  追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>チーム選択</CardTitle>
          </CardHeader>
          <CardContent>
            {teams && teams.length > 0 ? (
              <Select value={teamId.toString()} onValueChange={(value) => setTeamId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="チームを選択" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-gray-600">チームがありません。先にチームを作成してください。</p>
            )}
          </CardContent>
        </Card>

        {teamId > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              選手一覧
            </h2>

            {players && players.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {player.number}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{player.name}</CardTitle>
                            <Badge className={`mt-1 ${getPositionColor(player.position)}`}>
                              {getPositionLabel(player.position)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">試合出場</span>
                          <span className="font-semibold">0試合</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">攻撃成功率</span>
                          <span className="font-semibold">--%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">総得点</span>
                          <span className="font-semibold">0点</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        詳細統計
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">選手がまだ登録されていません</p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        最初の選手を追加
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
