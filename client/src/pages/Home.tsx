import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

import {
  Users,
  Activity,
  BarChart3,
  Sparkles,
  FileText,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  Zap,
  Mic,
  Settings,
  BookOpen,
  ClipboardEdit,
  Monitor,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [matchCode, setMatchCode] = useState("");
  const [, setLocation] = useLocation();

  const { data: recentMatches } = trpc.matches.listRecent.useQuery({ limit: 5 });
  const getByCodeQuery = trpc.matches.getByCode.useQuery(
    { matchCode: matchCode.toUpperCase() },
    { enabled: false }
  );

  const handleJoinMatch = async () => {
    if (!matchCode || matchCode.length !== 8) {
      toast.error("8桁の試合コードを入力してください");
      return;
    }

    try {
      const result = await getByCodeQuery.refetch();
      if (result.data) {
        setLocation(`/coach/${result.data.id}`);
      } else {
        toast.error("試合が見つかりません。コードを確認してください。");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">

      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-10 md:mb-16">
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-xs md:text-sm font-medium mb-6 fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            AI搭載バレーボール分析システム
          </div>

          {/* Brand name */}
          <div className="mb-4 fade-in" style={{ animationDelay: "0.05s" }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              AID ANALYTICS
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mt-1">
              for Volleyball
            </p>
          </div>

          <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-xl mx-auto fade-in px-4" style={{ animationDelay: "0.1s" }}>
            リアルタイムデータ記録・分析・AI支援戦術提案で、チームのパフォーマンスを最大化
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 md:gap-4 justify-center items-center mb-10 fade-in px-2" style={{ animationDelay: "0.15s" }}>
            <Link href="/setup">
              <Button size="lg" className="text-base md:text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                <Trophy className="w-5 h-5 mr-2" />
                新しい試合を開始
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <div className="flex flex-row gap-2 md:gap-3 justify-center w-full md:w-auto">
              <Link href="/teams">
                <Button size="lg" variant="outline" className="text-sm md:text-base px-5 py-5 border-2 hover:border-primary/40 hover:bg-orange-50 transition-all">
                  <Users className="w-4 h-4 mr-2" />
                  チーム管理
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="lg" variant="outline" className="text-sm md:text-base px-5 py-5 border-2 hover:border-primary/40 hover:bg-orange-50 transition-all">
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="text-sm md:text-base px-5 py-5 border-2 hover:border-primary/40 hover:bg-orange-50 transition-all">
                  <BookOpen className="w-4 h-4 mr-2" />
                  使い方
                </Button>
              </Link>
            </div>

            {/* Match code join */}
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="試合コードを入力（8桁）"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMatch()}
                maxLength={8}
                className="w-48 text-center font-mono text-base"
              />
              <Button
                variant="outline"
                size="lg"
                disabled={!matchCode || getByCodeQuery.isFetching}
                onClick={handleJoinMatch}
              >
                {getByCodeQuery.isFetching ? "確認中..." : "参加"}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16 px-2">
          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">高速データ入力</h3>
            <p className="text-sm text-muted-foreground mb-3">
              1プレーあたり3-4タップで完結。コート位置タップ入力で直感的に記録
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Zap className="w-4 h-4" />
              平均記録時間: 5秒/プレー
            </div>
          </div>

          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI戦術分析</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Gemini APIによる戦術的示唆、相手パターン分析と具体的改善提案
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <Target className="w-4 h-4" />
              タイムアウト時・セット間に自動生成
            </div>
          </div>

          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">リアルタイム統計</h3>
            <p className="text-sm text-muted-foreground mb-3">
              試合コードで複数端末から同時閲覧。攻撃成功率、サーブ効果率を即座に表示
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              リアルタイム同期
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        {Array.isArray(recentMatches) && recentMatches.length > 0 && (
          <Card className="mb-10 md:mb-16 mx-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                最近の試合
              </CardTitle>
              <CardDescription>過去の試合記録にアクセス</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recentMatches || []).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <Trophy className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {match.homeTeamName || "チーム名なし"} vs {match.awayTeamName || "対戦相手"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {match.date ? new Date(match.date).toLocaleDateString("ja-JP") : "日付不明"}
                          {match.venue ? ` | ${match.venue}` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="mr-2">{match.matchCode}</Badge>
                          <Badge variant={match.status === "completed" ? "default" : match.status === "inProgress" ? "destructive" : "secondary"}>
                            {match.status === "completed" ? "終了" : match.status === "inProgress" ? "試合中" : "準備中"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/input/${match.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <ClipboardEdit className="w-3 h-3 mr-1" />
                          データ入力
                        </Button>
                      </Link>
                      <Link href={`/coach/${match.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Monitor className="w-3 h-3 mr-1" />
                          コーチ画面
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2">
          <Card className="fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                詳細レポート
              </CardTitle>
              <CardDescription>試合後の詳細な分析レポートをPDF出力</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  選手別パフォーマンス分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  攻撃・サーブ・レシーブのヒートマップ
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  セット別統計と推移グラフ
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                音声入力対応
              </CardTitle>
              <CardDescription>音声でプレーを記録し、さらに高速化</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  「7番アタック成功」で即座に記録
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ハンズフリーでの高速入力
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  自然言語での柔軟な記録
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
