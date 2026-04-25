import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MatchComparison() {
  const [, navigate] = useLocation();
  const [match1Id, setMatch1Id] = useState<string>("");
  const [match2Id, setMatch2Id] = useState<string>("");

  const { data: recentMatches } = trpc.matches.listRecent.useQuery({ limit: 20 });
  const { data: match1 } = trpc.matches.getByCode.useQuery(
    { matchCode: match1Id },
    { enabled: !!match1Id }
  );
  const { data: match2 } = trpc.matches.getByCode.useQuery(
    { matchCode: match2Id },
    { enabled: !!match2Id }
  );

  const { data: stats1 } = trpc.statistics.getMatchStatistics.useQuery(
    { matchId: parseInt(match1Id) },
    { enabled: !!match1Id }
  );
  const { data: stats2 } = trpc.statistics.getMatchStatistics.useQuery(
    { matchId: parseInt(match2Id) },
    { enabled: !!match2Id }
  );

  const comparisonData = [
    {
      metric: "成功率",
      試合1: stats1?.home.successRate || 0,
      試合2: stats2?.home.successRate || 0,
    },
    {
      metric: "エラー率",
      試合1: stats1?.home.errorRate || 0,
      試合2: stats2?.home.errorRate || 0,
    },
    {
      metric: "総プレー数",
      試合1: stats1?.home.totalPlays || 0,
      試合2: stats2?.home.totalPlays || 0,
    },
  ];

  const getDifferenceIcon = (val1: number, val2: number) => {
    const diff = val1 - val2;
    if (Math.abs(diff) < 0.01) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getDifferenceText = (val1: number, val2: number) => {
    const diff = ((val1 - val2) * 100).toFixed(1);
    const diffNum = parseFloat(diff);
    if (Math.abs(diffNum) < 0.1) return "変化なし";
    return `${diffNum > 0 ? "+" : ""}${diff}%`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              試合比較分析
            </h1>
            <p className="text-muted-foreground mt-1">
              過去の試合データを比較してチームの成長を分析
            </p>
          </div>
        </div>

        {/* 試合選択 */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6 data-card">
            <h3 className="text-lg font-semibold mb-4">試合 1</h3>
            <Select value={match1Id} onValueChange={setMatch1Id}>
              <SelectTrigger>
                <SelectValue placeholder="試合を選択" />
              </SelectTrigger>
              <SelectContent>
                {recentMatches?.map((match) => (
                  <SelectItem key={match.id} value={match.id.toString()}>
                    {match.homeTeamName} vs {match.awayTeamName} - {new Date(match.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {match1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">会場:</span> {match1.venue}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">日付:</span> {new Date(match1.date).toLocaleDateString()}
                </p>

              </div>
            )}
          </Card>

          <Card className="p-6 data-card">
            <h3 className="text-lg font-semibold mb-4">試合 2</h3>
            <Select value={match2Id} onValueChange={setMatch2Id}>
              <SelectTrigger>
                <SelectValue placeholder="試合を選択" />
              </SelectTrigger>
              <SelectContent>
                {recentMatches?.map((match) => (
                  <SelectItem key={match.id} value={match.id.toString()}>
                    {match.homeTeamName} vs {match.awayTeamName} - {new Date(match.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {match2 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">会場:</span> {match2.venue}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">日付:</span> {new Date(match2.date).toLocaleDateString()}
                </p>

              </div>
            )}
          </Card>
        </div>

        {/* 比較グラフ */}
        {match1Id && match2Id && stats1 && stats2 && (
          <>
            <Card className="p-6 data-card mb-6">
              <h3 className="text-lg font-semibold mb-4">統計比較</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 265 / 0.3)" />
                  <XAxis dataKey="metric" stroke="oklch(0.65 0.01 265)" />
                  <YAxis stroke="oklch(0.65 0.01 265)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.02 265)",
                      border: "1px solid oklch(0.25 0.02 265 / 0.3)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="試合1" fill="oklch(0.7 0.25 265)" />
                  <Bar dataKey="試合2" fill="oklch(0.7 0.25 320)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 詳細比較テーブル */}
            <Card className="p-6 data-card">
              <h3 className="text-lg font-semibold mb-4">詳細比較</h3>
              <div className="space-y-4">
                {comparisonData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.metric}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">試合1</p>
                        <p className="text-lg font-semibold">{(item.試合1 * 100).toFixed(1)}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDifferenceIcon(item.試合1, item.試合2)}
                        <span className="text-sm font-medium">
                          {getDifferenceText(item.試合1, item.試合2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">試合2</p>
                        <p className="text-lg font-semibold">{(item.試合2 * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {!match1Id && !match2Id && (
          <Card className="p-12 data-card text-center">
            <p className="text-muted-foreground">
              比較する2つの試合を選択してください
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
