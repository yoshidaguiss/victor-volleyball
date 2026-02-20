import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ArrowLeft, Edit, Trash2, Users, Download } from "lucide-react";
import { exportTeamInfo } from "@/lib/exportUtils";

export default function TeamDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/teams/:teamId");
  const teamId = params?.teamId ? parseInt(params.teamId, 10) : undefined;

  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<any>(null);
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerPosition, setPlayerPosition] = useState<"S" | "MB" | "WS" | "OP" | "L">("MB");
  const [isLibero, setIsLibero] = useState(false);

  const { data: team } = trpc.teams.getById.useQuery(
    { teamId: teamId || 0 },
    { enabled: !!teamId }
  );

  const { data: players, refetch: refetchPlayers } = trpc.players.listByTeam.useQuery(
    { teamId: teamId || 0 },
    { enabled: !!teamId }
  );

  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      toast.success("選手を追加しました");
      setIsAddPlayerDialogOpen(false);
      setPlayerNumber("");
      setPlayerName("");
      setPlayerPosition("MB");
      setIsLibero(false);
      refetchPlayers();
    },
    onError: (error) => {
      toast.error("選手の追加に失敗しました", {
        description: error.message,
      });
    },
  });

  const updatePlayer = trpc.players.update.useMutation({
    onSuccess: () => {
      toast.success("選手情報を更新しました");
      setIsEditPlayerDialogOpen(false);
      setEditingPlayer(null);
      refetchPlayers();
    },
    onError: (error) => {
      toast.error("選手情報の更新に失敗しました", {
        description: error.message,
      });
    },
  });

  const deletePlayer = trpc.players.delete.useMutation({
    onSuccess: () => {
      toast.success("選手を削除しました");
      setIsDeleteDialogOpen(false);
      setDeletingPlayer(null);
      refetchPlayers();
    },
    onError: (error) => {
      toast.error("選手の削除に失敗しました", {
        description: error.message,
      });
    },
  });

  const handleAddPlayer = () => {
    if (!playerNumber.trim() || !playerName.trim()) {
      toast.error("背番号と名前を入力してください");
      return;
    }

    const number = parseInt(playerNumber, 10);
    if (isNaN(number) || number < 1 || number > 99) {
      toast.error("背番号は1〜99の数字で入力してください");
      return;
    }

    if (!teamId) {
      toast.error("チームIDが不正です");
      return;
    }

    createPlayer.mutate({
      teamId,
      number,
      name: playerName.trim(),
      position: playerPosition,
      isLibero,
    });
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setPlayerNumber(player.number.toString());
    setPlayerName(player.name);
    setPlayerPosition(player.position);
    setIsLibero(player.isLibero);
    setIsEditPlayerDialogOpen(true);
  };

  const handleUpdatePlayer = () => {
    if (!playerNumber.trim() || !playerName.trim()) {
      toast.error("背番号と名前を入力してください");
      return;
    }

    const number = parseInt(playerNumber, 10);
    if (isNaN(number) || number < 1 || number > 99) {
      toast.error("背番号は1〜99の数字で入力してください");
      return;
    }

    updatePlayer.mutate({
      playerId: editingPlayer.id,
      number,
      name: playerName.trim(),
      position: playerPosition,
      isLibero,
    });
  };

  const handleDeletePlayer = (player: any) => {
    setDeletingPlayer(player);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlayer = () => {
    if (deletingPlayer) {
      deletePlayer.mutate({ playerId: deletingPlayer.id });
    }
  };

  if (!teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">チームIDが指定されていません</p>
        </Card>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">チーム情報を読み込み中...</p>
        </Card>
      </div>
    );
  }

  const positionLabels: Record<string, string> = {
    S: "セッター",
    MB: "ミドルブロッカー",
    WS: "ウイングスパイカー",
    OP: "オポジット",
    L: "リベロ",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/teams")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              チーム一覧に戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{team.teamName}</h1>
              {team.season && (
                <p className="text-muted-foreground">{team.season}</p>
              )}
            </div>
          </div>

          <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                選手を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>選手を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="playerNumber">背番号 *</Label>
                  <Input
                    id="playerNumber"
                    type="number"
                    placeholder="例: 10"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                    min="1"
                    max="99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerName">名前 *</Label>
                  <Input
                    id="playerName"
                    placeholder="例: 山田太郎"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerPosition">ポジション *</Label>
                  <Select value={playerPosition} onValueChange={(value: any) => setPlayerPosition(value)}>
                    <SelectTrigger id="playerPosition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">セッター (S)</SelectItem>
                      <SelectItem value="MB">ミドルブロッカー (MB)</SelectItem>
                      <SelectItem value="WS">ウイングスパイカー (WS)</SelectItem>
                      <SelectItem value="OP">オポジット (OP)</SelectItem>
                      <SelectItem value="L">リベロ (L)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isLibero"
                    checked={isLibero}
                    onChange={(e) => setIsLibero(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isLibero" className="cursor-pointer">
                    リベロとして登録
                  </Label>
                </div>
                <Button
                  onClick={handleAddPlayer}
                  className="w-full"
                  disabled={createPlayer.isPending}
                >
                  {createPlayer.isPending ? "追加中..." : "選手を追加"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 選手一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                登録選手一覧
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (team && players) {
                    exportTeamInfo(team, players);
                    toast.success("チーム情報をExcel形式でエクスポートしました");
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Excelエクスポート
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!players || players.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-6">
                  まだ選手が登録されていません
                </p>
                <Button onClick={() => setIsAddPlayerDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  最初の選手を追加
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold text-primary">
                            {player.number}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{player.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {positionLabels[player.position]}
                            </div>
                            {player.isLibero && (
                              <div className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                リベロ
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPlayer(player)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlayer(player)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 選手編集ダイアログ */}
        <Dialog open={isEditPlayerDialogOpen} onOpenChange={setIsEditPlayerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>選手情報を編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="editPlayerNumber">背番号 *</Label>
                <Input
                  id="editPlayerNumber"
                  type="number"
                  placeholder="例: 10"
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  min="1"
                  max="99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPlayerName">名前 *</Label>
                <Input
                  id="editPlayerName"
                  placeholder="例: 山田太郎"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPlayerPosition">ポジション *</Label>
                <Select value={playerPosition} onValueChange={(value: any) => setPlayerPosition(value)}>
                  <SelectTrigger id="editPlayerPosition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">セッター (S)</SelectItem>
                    <SelectItem value="MB">ミドルブロッカー (MB)</SelectItem>
                    <SelectItem value="WS">ウイングスパイカー (WS)</SelectItem>
                    <SelectItem value="OP">オポジット (OP)</SelectItem>
                    <SelectItem value="L">リベロ (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsLibero"
                  checked={isLibero}
                  onChange={(e) => setIsLibero(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="editIsLibero" className="cursor-pointer">
                  リベロとして登録
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditPlayerDialogOpen(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleUpdatePlayer}
                  className="flex-1"
                  disabled={updatePlayer.isPending}
                >
                  {updatePlayer.isPending ? "更新中..." : "更新"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 選手削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>選手を削除</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">
                {deletingPlayer && (
                  <>
                    <span className="font-semibold text-foreground">
                      {deletingPlayer.number}番 {deletingPlayer.name}
                    </span>
                    を削除しますか？
                    <br />
                    この操作は元に戻せません。
                  </>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeletePlayer}
                  className="flex-1"
                  disabled={deletePlayer.isPending}
                >
                  {deletePlayer.isPending ? "削除中..." : "削除"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
