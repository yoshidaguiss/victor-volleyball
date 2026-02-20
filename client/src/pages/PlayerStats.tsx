import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Target, Zap, Award, Download } from "lucide-react";
import { exportPlayerStats } from "@/lib/exportUtils";
import { toast } from "sonner";

export default function PlayerStats() {
  const params = useParams();
  const playerId = params.playerId ? parseInt(params.playerId) : null;

  const { data: player } = trpc.players.getById.useQuery(
    { playerId: playerId! },
    { enabled: !!playerId }
  );

  const { data: playerStats } = trpc.plays.getPlayerStats.useQuery(
    { playerId: playerId! },
    { enabled: !!playerId }
  );

  if (!player || !playerStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>選手情報を読み込んでいます...</p>
      </div>
    );
  }

  const totalPlays = playerStats.totalPlays || 0;
  const successRate = totalPlays > 0 ? ((playerStats.successfulPlays || 0) / totalPlays * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/teams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              チーム一覧に戻る
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (player && playerStats) {
                exportPlayerStats(player, playerStats);
                toast.success("選手統計をExcel形式でエクスポートしました");
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Excelエクスポート
          </Button>
        </div>

        {/* 選手情報ヘッダー */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">#{player.number}</span>
              </div>
              <div>
                <CardTitle className="text-3xl">{player.name}</CardTitle>
                <CardDescription className="text-lg">
                  ポジション: {player.position} {player.isLibero && "（リベロ）"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                総プレー数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPlays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                成功率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{successRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                得点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{playerStats.points || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                エラー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{playerStats.errors || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* プレー別統計 */}
        <Card>
          <CardHeader>
            <CardTitle>プレー別統計</CardTitle>
            <CardDescription>各プレータイプの詳細な成績</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playerStats.byPlayType && Object.entries(playerStats.byPlayType).map(([playType, stats]: [string, any]) => {
                const total = stats.total || 0;
                const successful = stats.successful || 0;
                const rate = total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0";

                const playTypeLabels: Record<string, string> = {
                  serve: "サーブ",
                  receive: "レシーブ",
                  set: "セット",
                  attack: "アタック",
                  block: "ブロック",
                  dig: "ディグ",
                };

                return (
                  <div key={playType} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-semibold">{playTypeLabels[playType] || playType}</div>
                      <div className="text-sm text-muted-foreground">
                        {successful}/{total} 成功
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{rate}%</div>
                      <div className="text-sm text-muted-foreground">成功率</div>
                    </div>
                  </div>
                );
              })}

              {(!playerStats.byPlayType || Object.keys(playerStats.byPlayType).length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  まだプレーデータがありません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
