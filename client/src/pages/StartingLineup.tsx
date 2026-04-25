import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Users, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

type Position = 1 | 2 | 3 | 4 | 5 | 6;

interface LineupPlayer {
  playerId: number;
  position: Position;
  name: string;
  number: number;
}

export default function StartingLineup() {
  const params = useParams();
  const matchId = params.matchId ? parseInt(params.matchId) : null;
  const [, setLocation] = useLocation();
  
  const [lineup, setLineup] = useState<LineupPlayer[]>([]);
  const [liberoId, setLiberoId] = useState<number | null>(null);
  const [currentSet, setCurrentSet] = useState(1);

  const { data: match } = trpc.matches.getById.useQuery(
    { matchId: matchId! },
    { enabled: !!matchId }
  );

  const { data: players } = trpc.players.listByTeam.useQuery(
    { teamId: match?.homeTeamId || 0 },
    { enabled: !!match?.homeTeamId && match.homeTeamId > 0 }
  );

  const createServeOrderMutation = trpc.serveOrders.createBatch.useMutation({
    onSuccess: () => {
      toast.success("スターティングメンバーを設定しました！");
      setLocation(`/input/${matchId}`);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handlePlayerSelect = (position: Position, playerId: string) => {
    const player = players?.find(p => p.id === parseInt(playerId));
    if (!player) return;

    setLineup(prev => {
      const newLineup = prev.filter(p => p.position !== position && p.playerId !== parseInt(playerId));
      return [...newLineup, {
        playerId: parseInt(playerId),
        position,
        name: player.name,
        number: player.number,
      }];
    });
  };

  const handleSubmit = () => {
    if (lineup.length !== 6) {
      toast.error("6人のスターティングメンバーを選択してください");
      return;
    }

    if (!matchId) return;

    // サーブ順を作成（ポジション1から順に）
    const sortedLineup = [...lineup].sort((a, b) => a.position - b.position);
    
    createServeOrderMutation.mutate({
      matchId,
      setNumber: currentSet,
      teamSide: "home",
      players: sortedLineup.map(p => ({
        playerId: p.playerId,
        playerNumber: p.number,
        playerName: p.name,
        position: p.position,
      })),
      liberoId: liberoId || undefined,
    });
  };

  const getPlayerAtPosition = (position: Position) => {
    return lineup.find(p => p.position === position);
  };

  const isPlayerSelected = (playerId: number) => {
    return lineup.some(p => p.playerId === playerId);
  };

  const availablePlayers = players?.filter((p: { id: number }) => !isPlayerSelected(p.id) && p.id !== liberoId) || [];

  if (!match) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p>試合情報を読み込んでいます...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href={`/setup`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              スターティングメンバー設定
            </CardTitle>
            <CardDescription>
              第{currentSet}セットのスターティングメンバーとポジションを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* リベロ選択 */}
            <div>
              <label className="text-sm font-medium mb-2 block">リベロ（任意）</label>
              <Select value={liberoId?.toString() || "none"} onValueChange={(v) => setLiberoId(v === "none" ? null : parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="リベロを選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">リベロなし</SelectItem>
                  {players?.map((player: { id: number; number: number; name: string }) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      #{player.number} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* コート図 */}
            <div>
              <h3 className="text-sm font-medium mb-4">コート配置（ネット側が上）</h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                {/* ネット */}
                <div className="border-t-4 border-blue-600 mb-6 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">
                    ネット
                  </span>
                </div>

                {/* 前衛 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[4, 3, 2].map(pos => {
                    const player = getPlayerAtPosition(pos as Position);
                    return (
                      <div key={pos} className="space-y-2">
                        <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          P{pos}
                        </div>
                        <Select
                          value={player?.playerId.toString() || ""}
                          onValueChange={(v) => handlePlayerSelect(pos as Position, v)}
                        >
                          <SelectTrigger className="bg-blue-50 dark:bg-blue-900/20">
                            <SelectValue placeholder="選手を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {player && (
                              <SelectItem value={player.playerId.toString()}>
                                #{player.number} {player.name}
                              </SelectItem>
                            )}
                            {availablePlayers.map((p: { id: number; number: number; name: string }) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                #{p.number} {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {player && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">#{player.number}</div>
                            <div className="text-sm">{player.name}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 後衛 */}
                <div className="grid grid-cols-3 gap-4">
                  {[5, 6, 1].map(pos => {
                    const player = getPlayerAtPosition(pos as Position);
                    return (
                      <div key={pos} className="space-y-2">
                        <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          P{pos}
                        </div>
                        <Select
                          value={player?.playerId.toString() || ""}
                          onValueChange={(v) => handlePlayerSelect(pos as Position, v)}
                        >
                          <SelectTrigger className="bg-green-50 dark:bg-green-900/20">
                            <SelectValue placeholder="選手を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {player && (
                              <SelectItem value={player.playerId.toString()}>
                                #{player.number} {player.name}
                              </SelectItem>
                            )}
                            {availablePlayers.map((p: { id: number; number: number; name: string }) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                #{p.number} {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {player && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">#{player.number}</div>
                            <div className="text-sm">{player.name}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* サーブ順説明 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2">サーブ順について</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ポジション1（右後衛）から順にサーブを打ちます。ローテーションは時計回りに自動で管理されます。
              </p>
            </div>

            {/* 完了ボタン */}
            <Button
              onClick={handleSubmit}
              disabled={lineup.length !== 6 || createServeOrderMutation.isPending}
              className="w-full"
              size="lg"
            >
              {createServeOrderMutation.isPending ? (
                "設定中..."
              ) : lineup.length === 6 ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  設定完了してデータ入力を開始
                </>
              ) : (
                `スターティングメンバーを選択 (${lineup.length}/6)`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
