import { useState, useEffect } from "react";
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

  BookOpen
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
    <div className="min-h-screen">


      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block mb-4 md:mb-6 bounce-in">
            <div className="status-badge status-badge-info text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              AI搭載バレーボール分析システム
            </div>
          </div>
          <div className="mb-4 md:mb-6 bounce-in flex justify-center" style={{animationDelay: '0.1s'}}>
            <img src="/victor-logo.jpeg" alt="VICTOR" className="w-full max-w-2xl h-auto" />
          </div>
          <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 md:mb-12 max-w-2xl mx-auto font-medium bounce-in px-4" style={{animationDelay: '0.2s'}}>
            リアルタイムデータ記録・分析・ AI支援戦術提案で、チームのパフォーマンスを最大化
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 bounce-in px-2" style={{animationDelay: '0.3s'}}>
            <div className="flex flex-row gap-2 md:gap-4 justify-center w-full md:w-auto">
              <Link href="/teams">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-card border-2 hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 mr-2" />
                  チーム管理
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-card border-2 hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5 mr-2" />
                  設定
                </Button>
              </Link>
            </div>
            <Link href="/setup">
              <Button size="lg" className="neon-button text-lg px-8 py-6">
                <Trophy className="w-5 h-5 mr-2" />
                新しい試合を開始
              </Button>
            </Link>
            <Link href="/guide">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-card border-2 hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 mr-2" />
                使い方ガイド
              </Button>
            </Link>
            <div className="flex gap-2">
              <Input
                placeholder="試合コードを入力（8桁）"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMatch()}
                maxLength={8}
                className="w-48 text-center font-mono text-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16 px-2">
          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">高速データ入力</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              1プレーあたり3-4タップで完結。コート位置タップ入力で直感的に記録
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Zap className="w-4 h-4" />
              平均記録時間: 5秒/プレー
            </div>
          </div>

          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">AI戦術分析</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              Gemini APIによる戦術的示唆、相手パターン分析と具体的改善提案
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <Target className="w-4 h-4" />
              タイムアウト時・セット間に自動生成
            </div>
          </div>

          <div className="clean-card p-6 md:p-8 fade-in">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">リアルタイム統計</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              試合コードで複数端末から同時閲覧。攻撃成功率、サーブ効果率を即座に表示
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              リアルタイム同期
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        {recentMatches && recentMatches.length > 0 && (
          <Card className="mb-8 md:mb-16 mx-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                最近の試合
              </CardTitle>
              <CardDescription>
                過去の試合記録にアクセス
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <Link key={match.id} href={`/coach/${match.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex items-center gap-4">
                        <Trophy className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {match.homeTeamName || "チーム名なし"} vs {match.awayTeamName || "対戦相手"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(match.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{match.matchCode}</Badge>
                    </div>
                  </Link>
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
              <CardDescription>
                試合後の詳細な分析レポートをPDF出力
              </CardDescription>
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
              <CardDescription>
                音声でプレーを記録し、さらに高速化
              </CardDescription>
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
