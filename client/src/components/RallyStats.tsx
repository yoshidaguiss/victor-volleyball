import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Award, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RallyStatsProps {
  matchId: number;
}

export default function RallyStats({ matchId }: RallyStatsProps) {
  const { data: stats, isLoading } = trpc.rallies.stats.useQuery(
    { matchId },
    { refetchInterval: 5000 }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            ラリー統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalRallies === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            ラリー統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">データがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          ラリー統計
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 基本統計 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-900 font-medium">総ラリー数</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalRallies}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-900 font-medium">平均プレー数</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.averagePlayCount}</p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-900 font-medium">最長ラリー</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.longestRally}</p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-900 font-medium">最短ラリー</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.shortestRally}</p>
          </div>
        </div>

        {/* ラリー勝率 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">ラリー勝率</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">ホーム</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${stats.winRate.home}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right">{stats.winRate.home}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">アウェイ</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${stats.winRate.away}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right">{stats.winRate.away}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ラリー終了パターン */}
        {Object.keys(stats.endPatterns).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">ラリー終了パターン</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.endPatterns)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([pattern, count]) => (
                  <Badge key={pattern} variant="outline" className="text-xs">
                    {pattern}: {count}回
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
