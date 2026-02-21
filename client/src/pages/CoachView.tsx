import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Download, FileSpreadsheet, Sparkles, TrendingUp, Target, Users, BarChart3, Lightbulb } from "lucide-react";
import { exportMatchToExcel } from "@/lib/exportUtils";
import { Link, useParams } from "wouter";
import MatchCodeDisplay from "@/components/MatchCodeDisplay";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function CoachView() {
  const params = useParams();
  const matchId = parseInt(params.matchId || "0");
  const [activeTab, setActiveTab] = useState("overview");
  const [heatmapFilter, setHeatmapFilter] = useState<"all" | "success" | "error">("all");

  const { data: match, isLoading: matchLoading } = trpc.matches.getById.useQuery(
    { matchId },
    { enabled: !!matchId }
  );
  const { data: plays, isLoading: playsLoading } = trpc.plays.listByMatch.useQuery(
    { matchId },
    { enabled: !!matchId }
  );
  const { data: homePlayers } = trpc.players.listByTeam.useQuery(
    { teamId: match?.homeTeamId || 0 },
    { enabled: !!match && !!match.homeTeamId }
  );
  // アウェイチームの選手はプレーデータから抽出（awayTeamIdがスキーマにないため）
  const awayPlayers = useMemo(() => {
    if (!plays) return [];
    const awayPlayerMap = new Map<number, { id: number; number: number; name: string }>();
    plays.filter((p: any) => p.teamSide === "away").forEach((p: any) => {
      if (!awayPlayerMap.has(p.playerId)) {
        awayPlayerMap.set(p.playerId, { id: p.playerId, number: p.playerNumber, name: p.playerName });
      }
    });
    return Array.from(awayPlayerMap.values());
  }, [plays]);

  const handleExportExcel = () => {
    if (!match) {
      toast.error("試合データが読み込まれていません");
      return;
    }
    if (!plays) {
      toast.error("プレーデータが読み込まれていません");
      return;
    }
    try {
      exportMatchToExcel(match, plays);
      toast.success("Excelファイルをエクスポートしました");
    } catch (error: any) {
      toast.error("エクスポートに失敗しました", {
        description: error.message,
      });
    }
  };

  // 選手別統計を計算
  const calculatePlayerStats = (playerId: number, teamSide: "home" | "away") => {
    if (!plays) return null;
    
    const playerPlays = plays.filter((p: any) => p.playerId === playerId && p.teamSide === teamSide);
    
    const attacks = playerPlays.filter((p: any) => p.playType === "attack");
    const attackSuccess = attacks.filter((p: any) => p.result === "point").length;
    const attackTotal = attacks.length;
    const attackRate = attackTotal > 0 ? (attackSuccess / attackTotal * 100).toFixed(1) : "0.0";

    const serves = playerPlays.filter((p: any) => p.playType === "serve");
    const serveAce = serves.filter((p: any) => p.result === "point").length;
    const serveError = serves.filter((p: any) => p.result === "error").length;
    const serveTotal = serves.length;
    const serveRate = serveTotal > 0 ? (serveAce / serveTotal * 100).toFixed(1) : "0.0";
    const serveErrorRate = serveTotal > 0 ? (serveError / serveTotal * 100).toFixed(1) : "0.0";

    const receives = playerPlays.filter((p: any) => p.playType === "receive");
    const receiveSuccess = receives.filter((p: any) => p.result === "continue").length;
    const receiveTotal = receives.length;
    const receiveRate = receiveTotal > 0 ? (receiveSuccess / receiveTotal * 100).toFixed(1) : "0.0";

    const blocks = playerPlays.filter((p: any) => p.playType === "block");
    const blockSuccess = blocks.filter((p: any) => p.result === "point").length;
    const blockTotal = blocks.length;
    const blockRate = blockTotal > 0 ? (blockSuccess / blockTotal * 100).toFixed(1) : "0.0";

    const sets = playerPlays.filter((p: any) => p.playType === "set");
    const setSuccess = sets.filter((p: any) => p.result === "continue").length;
    const setTotal = sets.length;
    const setRate = setTotal > 0 ? (setSuccess / setTotal * 100).toFixed(1) : "0.0";

    // 調子判定（最近5プレー）
    const recentPlays = playerPlays.slice(-5);
    const recentSuccess = recentPlays.filter((p: any) => p.result === "point" || p.result === "continue").length;
    const condition = recentSuccess >= 4 ? "🔥 ホット" : recentSuccess <= 1 ? "❄️ コールド" : "😐 普通";

    return {
      attackRate: parseFloat(attackRate),
      attackSuccess,
      attackTotal,
      serveRate: parseFloat(serveRate),
      serveErrorRate: parseFloat(serveErrorRate),
      serveAce,
      serveError,
      serveTotal,
      receiveRate: parseFloat(receiveRate),
      receiveSuccess,
      receiveTotal,
      blockRate: parseFloat(blockRate),
      blockSuccess,
      blockTotal,
      setRate: parseFloat(setRate),
      setSuccess,
      setTotal,
      condition,
      totalPlays: playerPlays.length,
    };
  };

  // チーム統計を計算
  const calculateTeamStats = (teamSide: "home" | "away") => {
    if (!plays) return null;
    
    const teamPlays = plays.filter((p: any) => p.teamSide === teamSide);
    
    const attacks = teamPlays.filter((p: any) => p.playType === "attack");
    const attackSuccess = attacks.filter((p: any) => p.result === "point").length;
    const attackTotal = attacks.length;

    const serves = teamPlays.filter((p: any) => p.playType === "serve");
    const serveAce = serves.filter((p: any) => p.result === "point").length;
    const serveTotal = serves.length;

    const receives = teamPlays.filter((p: any) => p.playType === "receive");
    const receiveSuccess = receives.filter((p: any) => p.result === "continue").length;
    const receiveTotal = receives.length;

    const blocks = teamPlays.filter((p: any) => p.playType === "block");
    const blockSuccess = blocks.filter((p: any) => p.result === "point").length;
    const blockTotal = blocks.length;

    return {
      attackRate: attackTotal > 0 ? (attackSuccess / attackTotal * 100).toFixed(1) : "0.0",
      attackSuccess,
      attackTotal,
      serveRate: serveTotal > 0 ? (serveAce / serveTotal * 100).toFixed(1) : "0.0",
      serveAce,
      serveTotal,
      receiveRate: receiveTotal > 0 ? (receiveSuccess / receiveTotal * 100).toFixed(1) : "0.0",
      receiveSuccess,
      receiveTotal,
      blockRate: blockTotal > 0 ? (blockSuccess / blockTotal * 100).toFixed(1) : "0.0",
      blockSuccess,
      blockTotal,
      totalPlays: teamPlays.length,
    };
  };

  // セット別スコア推移データ
  const setProgressionData = useMemo(() => {
    if (!match) return [];
    
    const scoreHome = Array.isArray(match.scoreHome) ? match.scoreHome : [];
    const scoreAway = Array.isArray(match.scoreAway) ? match.scoreAway : [];
    
    return scoreHome.map((home, idx) => ({
      set: `第${idx + 1}セット`,
      home,
      away: scoreAway[idx] || 0,
    }));
  }, [match]);

  // チーム比較レーダーチャートデータ
  const teamComparisonData = useMemo(() => {
    if (!plays) return [];
    
    const homeStats = calculateTeamStats("home");
    const awayStats = calculateTeamStats("away");
    
    if (!homeStats || !awayStats) return [];
    
    return [
      {
        category: "アタック",
        home: parseFloat(homeStats.attackRate),
        away: parseFloat(awayStats.attackRate),
      },
      {
        category: "サーブ",
        home: parseFloat(homeStats.serveRate),
        away: parseFloat(awayStats.serveRate),
      },
      {
        category: "レシーブ",
        home: parseFloat(homeStats.receiveRate),
        away: parseFloat(awayStats.receiveRate),
      },
      {
        category: "ブロック",
        home: parseFloat(homeStats.blockRate),
        away: parseFloat(awayStats.blockRate),
      },
    ];
  }, [plays]);

  // リアルタイム戦術提案
  const tacticalSuggestions = useMemo(() => {
    if (!plays || !homePlayers || !awayPlayers) return [];
    
    const suggestions: string[] = [];
    
    // ホームチームの調子の良い選手を検出
    const hotHomePlayers = (homePlayers || [])
      .map((player: any) => ({
        player,
        stats: calculatePlayerStats(player.id, "home"),
      }))
      .filter((p: any) => p.stats && p.stats.condition === "🔥 ホット");
    
    if (hotHomePlayers.length > 0) {
      hotHomePlayers.forEach((p: any) => {
        suggestions.push(`✨ ${p.player.name}（#${p.player.number}）が好調です！積極的に攻撃に参加させましょう。`);
      });
    }
    
    // アウェイチームの弱点を検出
    const awayStats = calculateTeamStats("away");
    if (awayStats) {
      if (parseFloat(awayStats.receiveRate) < 50) {
        suggestions.push(`🎯 相手のレシーブ成功率が${awayStats.receiveRate}%と低いです。強力なサーブで攻めましょう。`);
      }
      if (parseFloat(awayStats.blockRate) < 30) {
        suggestions.push(`💥 相手のブロック成功率が${awayStats.blockRate}%と低いです。積極的にアタックを仕掛けましょう。`);
      }
    }
    
    // ホームチームの課題を検出
    const homeStats = calculateTeamStats("home");
    if (homeStats) {
      if (parseFloat(homeStats.attackRate) < 40) {
        suggestions.push(`⚠️ アタック決定率が${homeStats.attackRate}%と低いです。コンビネーションを見直しましょう。`);
      }
      if (parseFloat(homeStats.serveRate) < 20) {
        suggestions.push(`⚠️ サーブ効果率が${homeStats.serveRate}%と低いです。サーブ練習を強化しましょう。`);
      }
    }
    
    return suggestions;
  }, [plays, homePlayers, awayPlayers]);

  // 初回読み込み時のみローディング表示（データが既にある場合は表示を維持）
  if ((matchLoading && !match) || (playsLoading && !plays)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-lg text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>試合が見つかりません</p>
            <Link href="/">
              <Button className="mt-4">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const homeStats = calculateTeamStats("home");
  const awayStats = calculateTeamStats("away");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center justify-between w-full md:w-auto">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1 md:gap-2 p-2 md:p-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">ホームに戻る</span>
                </Button>
              </Link>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">コーチ画面</h1>
            </div>
            <div className="flex gap-1 md:gap-2 w-full md:w-auto">
              <Button onClick={handleExportExcel} variant="outline" size="sm" className="flex-1 md:flex-none text-xs md:text-sm">
                <FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Excel出力</span>
              </Button>
              <Link href={`/ai-advice/${matchId}`} className="flex-1 md:flex-none">
                <Button variant="default" size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs md:text-sm">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">AI戦術提案</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* スコア表示 */}
        <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 soft-shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm opacity-90 mb-1 truncate">{match.homeTeamName}</p>
              <p className="text-3xl md:text-5xl font-bold">{match.scoreHome?.reduce((a: number, b: number) => a + b, 0) || 0}</p>
              <div className="flex justify-center gap-2 mt-2">
                {Array.isArray(match.scoreHome) && match.scoreHome.map((score: number, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-2 py-1">
                    {score}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-xl md:text-3xl font-bold px-4 md:px-8">VS</div>
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm opacity-90 mb-1 truncate">{match.awayTeamName}</p>
              <p className="text-3xl md:text-5xl font-bold">{match.scoreAway?.reduce((a: number, b: number) => a + b, 0) || 0}</p>
              <div className="flex justify-center gap-2 mt-2">
                {Array.isArray(match.scoreAway) && match.scoreAway.map((score: number, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-2 py-1">
                    {score}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 gap-1 overflow-x-auto">
            <TabsTrigger value="overview">
              <Target className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm">概要</span>
            </TabsTrigger>
            <TabsTrigger value="players">
              <Users className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">選手</span>
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">比較</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">着弾</span>
            </TabsTrigger>
            <TabsTrigger value="position">
              <Target className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">位置</span>
            </TabsTrigger>
            <TabsTrigger value="tactics">
              <Lightbulb className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">戦術</span>
            </TabsTrigger>
            <TabsTrigger value="contribution">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">関与</span>
            </TabsTrigger>
            <TabsTrigger value="setAnalysis">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">セット</span>
            </TabsTrigger>
            <TabsTrigger value="timeSeries">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs md:text-sm hidden sm:inline">時系列</span>
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                <CardHeader>
                  <CardTitle>セット別スコア推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={setProgressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="set" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="home" fill="#3b82f6" name={match.homeTeamName} />
                      <Bar dataKey="away" fill="#ef4444" name={match.awayTeamName} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                <CardHeader>
                  <CardTitle>チーム統計サマリー</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {homeStats && awayStats && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>アタック決定率</span>
                          <span className="font-semibold">{homeStats.attackRate}% vs {awayStats.attackRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500" style={{ width: `${homeStats.attackRate}%` }} />
                          <div className="bg-red-500 ml-auto" style={{ width: `${awayStats.attackRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>サーブ効果率</span>
                          <span className="font-semibold">{homeStats.serveRate}% vs {awayStats.serveRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500" style={{ width: `${homeStats.serveRate}%` }} />
                          <div className="bg-red-500 ml-auto" style={{ width: `${awayStats.serveRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>レシーブ成功率</span>
                          <span className="font-semibold">{homeStats.receiveRate}% vs {awayStats.receiveRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500" style={{ width: `${homeStats.receiveRate}%` }} />
                          <div className="bg-red-500 ml-auto" style={{ width: `${awayStats.receiveRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ブロック成功率</span>
                          <span className="font-semibold">{homeStats.blockRate}% vs {awayStats.blockRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500" style={{ width: `${homeStats.blockRate}%` }} />
                          <div className="bg-red-500 ml-auto" style={{ width: `${awayStats.blockRate}%` }} />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 選手統計タブ */}
          <TabsContent value="players" className="space-y-6 mt-6">
            {/* ホームチーム選手統計 */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  {match.homeTeamName} 選手別統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">背番号</th>
                        <th className="text-left py-3 px-4">名前</th>
                        <th className="text-center py-3 px-4">調子</th>
                        <th className="text-right py-3 px-4">アタック</th>
                        <th className="text-right py-3 px-4">サーブ</th>
                        <th className="text-right py-3 px-4">レシーブ</th>
                        <th className="text-right py-3 px-4">ブロック</th>
                        <th className="text-right py-3 px-4">総プレー</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(homePlayers || []).map((player: any) => {
                        const stats = calculatePlayerStats(player.id, "home");
                        if (!stats) return null;
                        return (
                          <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-semibold">{player.number}</td>
                            <td className="py-3 px-4">{player.name}</td>
                            <td className="text-center py-3 px-4">{stats.condition}</td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.attackRate}%</div>
                              <div className="text-xs text-gray-500">{stats.attackSuccess}/{stats.attackTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.serveRate}%</div>
                              <div className="text-xs text-gray-500">{stats.serveAce}/{stats.serveTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.receiveRate}%</div>
                              <div className="text-xs text-gray-500">{stats.receiveSuccess}/{stats.receiveTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.blockRate}%</div>
                              <div className="text-xs text-gray-500">{stats.blockSuccess}/{stats.blockTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">{stats.totalPlays}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* アウェイチーム選手統計 */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  {match.awayTeamName} 選手別統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">背番号</th>
                        <th className="text-left py-3 px-4">名前</th>
                        <th className="text-center py-3 px-4">調子</th>
                        <th className="text-right py-3 px-4">アタック</th>
                        <th className="text-right py-3 px-4">サーブ</th>
                        <th className="text-right py-3 px-4">レシーブ</th>
                        <th className="text-right py-3 px-4">ブロック</th>
                        <th className="text-right py-3 px-4">総プレー</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(awayPlayers || []).map((player: any) => {
                        const stats = calculatePlayerStats(player.id, "away");
                        if (!stats) return null;
                        return (
                          <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-semibold">{player.number}</td>
                            <td className="py-3 px-4">{player.name}</td>
                            <td className="text-center py-3 px-4">{stats.condition}</td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.attackRate}%</div>
                              <div className="text-xs text-gray-500">{stats.attackSuccess}/{stats.attackTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.serveRate}%</div>
                              <div className="text-xs text-gray-500">{stats.serveAce}/{stats.serveTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.receiveRate}%</div>
                              <div className="text-xs text-gray-500">{stats.receiveSuccess}/{stats.receiveTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="font-semibold">{stats.blockRate}%</div>
                              <div className="text-xs text-gray-500">{stats.blockSuccess}/{stats.blockTotal}</div>
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">{stats.totalPlays}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* チーム比較タブ */}
          <TabsContent value="comparison" className="space-y-6 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
              <CardHeader>
                <CardTitle>チーム能力比較（レーダーチャート）</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={teamComparisonData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name={match.homeTeamName} dataKey="home" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name={match.awayTeamName} dataKey="away" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    {match.homeTeamName} 詳細統計
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {homeStats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">アタック決定率</span>
                        <span className="font-semibold">{homeStats.attackRate}% ({homeStats.attackSuccess}/{homeStats.attackTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">サーブエース率</span>
                        <span className="font-semibold">{homeStats.serveRate}% ({homeStats.serveAce}/{homeStats.serveTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">レシーブ成功率</span>
                        <span className="font-semibold">{homeStats.receiveRate}% ({homeStats.receiveSuccess}/{homeStats.receiveTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ブロック成功率</span>
                        <span className="font-semibold">{homeStats.blockRate}% ({homeStats.blockSuccess}/{homeStats.blockTotal})</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">総プレー数</span>
                        <span className="font-semibold">{homeStats.totalPlays}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    {match.awayTeamName} 詳細統計
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {awayStats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">アタック決定率</span>
                        <span className="font-semibold">{awayStats.attackRate}% ({awayStats.attackSuccess}/{awayStats.attackTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">サーブエース率</span>
                        <span className="font-semibold">{awayStats.serveRate}% ({awayStats.serveAce}/{awayStats.serveTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">レシーブ成功率</span>
                        <span className="font-semibold">{awayStats.receiveRate}% ({awayStats.receiveSuccess}/{awayStats.receiveTotal})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ブロック成功率</span>
                        <span className="font-semibold">{awayStats.blockRate}% ({awayStats.blockSuccess}/{awayStats.blockTotal})</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">総プレー数</span>
                        <span className="font-semibold">{awayStats.totalPlays}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 着弾分析タブ */}
          <TabsContent value="heatmap" className="space-y-6 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  ボール着弾点ヒートマップ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // 着弾点データをフィルタリング
                  const attackPlays = plays?.filter((p: any) => 
                    p.playType === "attack" && 
                    p.details?.landingX > 0 && 
                    p.details?.landingY > 0
                  ) || [];

                  const filteredPlays = attackPlays.filter((p: any) => {
                    if (heatmapFilter === "success") return p.result === "point";
                    if (heatmapFilter === "error") return p.result === "error" || p.result === "out";
                    return true;
                  });

                  if (attackPlays.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">まだ着弾点データがありません</p>
                        <p className="text-sm text-gray-500 mt-2">アタック詳細入力で着弾点を記録すると、ヒートマップが表示されます</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* フィルター */}
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant={heatmapFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHeatmapFilter("all")}
                        >
                          全て ({attackPlays.length})
                        </Button>
                        <Button
                          variant={heatmapFilter === "success" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHeatmapFilter("success")}
                          className={heatmapFilter === "success" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          成功 ({attackPlays.filter((p: any) => p.result === "point").length})
                        </Button>
                        <Button
                          variant={heatmapFilter === "error" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHeatmapFilter("error")}
                          className={heatmapFilter === "error" ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                          ミス ({attackPlays.filter((p: any) => p.result === "error" || p.result === "out").length})
                        </Button>
                      </div>

                      {/* ヒートマップ */}
                      <div className="relative">
                        <div
                          className="relative w-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg border-4 border-gray-800"
                          style={{ aspectRatio: "3/2" }}
                        >
                          {/* ネット */}
                          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-800 -translate-x-1/2" />
                          
                          {/* アタックライン（3mライン） */}
                          <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-600 opacity-50" />
                          <div className="absolute top-0 bottom-0 right-1/3 w-0.5 bg-gray-600 opacity-50" />
                          
                          {/* 着弾点マーカー */}
                          {filteredPlays.map((play: any, idx: number) => {
                            const x = play.details.landingX;
                            const y = play.details.landingY;
                            const isSuccess = play.result === "point";
                            
                            return (
                              <div
                                key={idx}
                                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 ${
                                  isSuccess ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{
                                  left: `${(x / 9) * 100}%`,
                                  top: `${(y / 6) * 100}%`,
                                  opacity: 0.7,
                                }}
                                title={`${isSuccess ? "成功" : "ミス"}: (${x}m, ${y}m)`}
                              />
                            );
                          })}
                          
                          {/* ラベル */}
                          <div className="absolute top-2 left-2 text-xs font-bold text-gray-700 bg-white/70 px-2 py-1 rounded">
                            相手コート
                          </div>
                          <div className="absolute top-2 right-2 text-xs font-bold text-gray-700 bg-white/70 px-2 py-1 rounded">
                            自コート
                          </div>
                        </div>

                        {/* 統計情報 */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-700 font-semibold">成功率</p>
                            <p className="text-2xl font-bold text-green-600">
                              {attackPlays.length > 0 
                                ? ((attackPlays.filter((p: any) => p.result === "point").length / attackPlays.length) * 100).toFixed(1)
                                : 0
                              }%
                            </p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700 font-semibold">ミス率</p>
                            <p className="text-2xl font-bold text-red-600">
                              {attackPlays.length > 0 
                                ? ((attackPlays.filter((p: any) => p.result === "error" || p.result === "out").length / attackPlays.length) * 100).toFixed(1)
                                : 0
                              }%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 位置別分析タブ */}
          <TabsContent value="position" className="space-y-6 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  攻撃位置別成功率分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // 位置別データを集計
                  const attacksByPosition = plays?.filter((p: any) => 
                    p.playType === "attack" && 
                    p.details?.attackPosition
                  ) || [];

                  if (attacksByPosition.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">まだ位置別データがありません</p>
                        <p className="text-sm text-gray-500 mt-2">アタック詳細入力で攻撃位置を記録すると、分析が表示されます</p>
                      </div>
                    );
                  }

                  // 位置別統計を計算
                  const positionStats = ["1", "2", "3", "4", "5"].map(pos => {
                    const positionPlays = attacksByPosition.filter((p: any) => p.details.attackPosition === pos);
                    const total = positionPlays.length;
                    const success = positionPlays.filter((p: any) => p.result === "point").length;
                    const rate = total > 0 ? (success / total * 100).toFixed(1) : "0.0";
                    
                    const positionNames: Record<string, string> = {
                      "1": "1番（レフト）",
                      "2": "2番（レフト寄り）",
                      "3": "3番（センター）",
                      "4": "4番（ライト寄り）",
                      "5": "5番（ライト）",
                    };

                    return {
                      position: positionNames[pos],
                      total,
                      success,
                      rate: parseFloat(rate),
                      rateLabel: `${rate}%`,
                    };
                  });

                  return (
                    <div className="space-y-6">
                      {/* 棒グラフ */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">位置別成功率</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={positionStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="position" />
                            <YAxis label={{ value: "成功率 (%)", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Bar dataKey="rate" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 詳細統計 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">詳細統計</h3>
                        <div className="grid grid-cols-5 gap-4">
                          {positionStats.map((stat, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-700 font-semibold mb-2">{stat.position}</p>
                              <p className="text-3xl font-bold text-blue-600 mb-1">{stat.rateLabel}</p>
                              <p className="text-xs text-blue-600">
                                {stat.success}/{stat.total} 成功
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 視覚的なコート図 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">位置別攻撃ヒートマップ</h3>
                        <div className="relative">
                          <div
                            className="relative w-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-4 border-gray-800"
                            style={{ aspectRatio: "3/1" }}
                          >
                            {/* ネット */}
                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gray-800" />
                            
                            {/* 位置マーカー */}
                            {positionStats.map((stat, idx) => {
                              const positions = [10, 27.5, 45, 62.5, 80]; // 1番（左）から5番（右）まで
                              const color = stat.rate >= 50 ? "bg-green-500" : stat.rate >= 30 ? "bg-yellow-500" : "bg-red-500";
                              
                              return (
                                <div key={idx} className="absolute" style={{ left: `${positions[idx]}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                                  <div className={`w-16 h-16 ${color} rounded-full border-4 border-white shadow-lg flex items-center justify-center`}>
                                    <span className="text-white font-bold text-lg">{stat.rateLabel}</span>
                                  </div>
                                  <p className="text-center text-xs font-semibold mt-2">{stat.position}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 戦術提案タブ */}
          <TabsContent value="tactics" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  リアルタイム戦術提案
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tacticalSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {tacticalSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                        <p className="text-sm leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">まだ十分なデータがありません</p>
                    <p className="text-sm text-gray-500 mt-2">プレーを記録すると、AIが戦術提案を行います</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 得失点関与分析タブ */}
          <TabsContent value="contribution" className="space-y-6 mt-6">
            {(() => {
              if (!plays) {
                return (
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                    <CardContent className="text-center py-12">
                      <p className="text-gray-600">データを読み込んでいます...</p>
                    </CardContent>
                  </Card>
                );
              }

              // 得点・失点関与度を計算
              const calculateContribution = (playerId: number, teamSide: "home" | "away") => {
                const playerPlays = plays.filter((p: any) => p.playerId === playerId && p.teamSide === teamSide);
                
                // 直接得点（サーブエース、アタック決まった、ブロック決まった）
                const directPoints = playerPlays.filter((p: any) => p.result === "point").length;
                
                // 直接失点（サービスミス、アタックミス、レシーブミス）
                const directErrors = playerPlays.filter((p: any) => p.result === "error").length;
                
                // 間接得点（レシーブ成功、セット成功）
                const indirectPoints = playerPlays.filter((p: any) => 
                  p.result === "continue" && (p.playType === "receive" || p.playType === "set")
                ).length * 0.3; // 間接関与は30%の重み付け
                
                const totalContribution = directPoints + indirectPoints;
                const totalErrors = directErrors;
                const plusMinus = totalContribution - totalErrors;
                
                return {
                  directPoints,
                  indirectPoints: Math.round(indirectPoints * 10) / 10,
                  totalContribution: Math.round(totalContribution * 10) / 10,
                  directErrors,
                  plusMinus: Math.round(plusMinus * 10) / 10
                };
              };

              // ホームチームの関与度データ
              const homeContributions = (homePlayers || []).map((player: any) => {
                const contrib = calculateContribution(player.id, "home");
                return {
                  name: player.name,
                  number: player.number,
                  ...contrib
                };
              }).sort((a, b) => b.plusMinus - a.plusMinus);

              // アウェイチームの関与度データ
              const awayContributions = (awayPlayers || []).map((player: any) => {
                const contrib = calculateContribution(player.id, "away");
                return {
                  name: player.name,
                  number: player.number,
                  ...contrib
                };
              }).sort((a, b) => b.plusMinus - a.plusMinus);

              return (
                <>
                  {/* ホームチーム */}
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        {match.homeTeamName} 得失点関与分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* プラス・マイナスグラフ */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">プラス・マイナス評価</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={homeContributions}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="plusMinus" fill="#3b82f6">
                                {homeContributions.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.plusMinus >= 0 ? "#10b981" : "#ef4444"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* 詳細テーブル */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">背番号</th>
                                <th className="text-left py-3 px-4">名前</th>
                                <th className="text-right py-3 px-4">直接得点</th>
                                <th className="text-right py-3 px-4">間接得点</th>
                                <th className="text-right py-3 px-4">総得点関与</th>
                                <th className="text-right py-3 px-4">直接失点</th>
                                <th className="text-right py-3 px-4 font-bold">±</th>
                              </tr>
                            </thead>
                            <tbody>
                              {homeContributions.map((player, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 font-semibold">{player.number}</td>
                                  <td className="py-3 px-4">{player.name}</td>
                                  <td className="text-right py-3 px-4">{player.directPoints}</td>
                                  <td className="text-right py-3 px-4">{player.indirectPoints}</td>
                                  <td className="text-right py-3 px-4 font-semibold">{player.totalContribution}</td>
                                  <td className="text-right py-3 px-4 text-red-600">{player.directErrors}</td>
                                  <td className={`text-right py-3 px-4 font-bold ${player.plusMinus >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {player.plusMinus >= 0 ? "+" : ""}{player.plusMinus}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* アウェイチーム */}
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        {match.awayTeamName} 得失点関与分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* プラス・マイナスグラフ */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">プラス・マイナス評価</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={awayContributions}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="plusMinus" fill="#ef4444">
                                {awayContributions.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.plusMinus >= 0 ? "#10b981" : "#ef4444"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* 詳細テーブル */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">背番号</th>
                                <th className="text-left py-3 px-4">名前</th>
                                <th className="text-right py-3 px-4">直接得点</th>
                                <th className="text-right py-3 px-4">間接得点</th>
                                <th className="text-right py-3 px-4">総得点関与</th>
                                <th className="text-right py-3 px-4">直接失点</th>
                                <th className="text-right py-3 px-4 font-bold">±</th>
                              </tr>
                            </thead>
                            <tbody>
                              {awayContributions.map((player, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 font-semibold">{player.number}</td>
                                  <td className="py-3 px-4">{player.name}</td>
                                  <td className="text-right py-3 px-4">{player.directPoints}</td>
                                  <td className="text-right py-3 px-4">{player.indirectPoints}</td>
                                  <td className="text-right py-3 px-4 font-semibold">{player.totalContribution}</td>
                                  <td className="text-right py-3 px-4 text-red-600">{player.directErrors}</td>
                                  <td className={`text-right py-3 px-4 font-bold ${player.plusMinus >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {player.plusMinus >= 0 ? "+" : ""}{player.plusMinus}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>

          {/* セット別分析タブ */}
          <TabsContent value="setAnalysis" className="space-y-6 mt-6">
            {(() => {
              if (!plays || plays.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                      プレーデータがありません
                    </CardContent>
                  </Card>
                );
              }

              // セット別分析は現在利用不可（setNumberカラムがDBにないため）
              return (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    セット別分析は一時的に利用不可です
                  </CardContent>
                </Card>
              );

              return (
                <div className="space-y-8">
                  {setNumbers.map(setNum => {
                    const setPlays = setGroups[setNum] || [];
                    
                    if (setPlays.length === 0) return null;
                    
                    // 得失点推移データを作成
                    let homeScore = 0;
                    let awayScore = 0;
                    const scoreProgression = setPlays.map((play: any, idx: number) => {
                      if (play.result === "point") {
                        if (play.teamSide === "home") {
                          homeScore++;
                        } else {
                          awayScore++;
                        }
                      }
                      return {
                        index: idx + 1,
                        homeScore,
                        awayScore,
                        playType: play.playType,
                      };
                    });

                    // ターニングポイント検出
                    const turningPoints: any[] = [];
                    
                    // 連続得点検出（3点以上）
                    let homeStreak = 0;
                    let awayStreak = 0;
                    let lastScorer: "home" | "away" | null = null;
                    
                    scoreProgression.forEach((point, idx) => {
                      const prevPoint = idx > 0 ? scoreProgression[idx - 1] : { homeScore: 0, awayScore: 0 };
                      
                      if (point.homeScore > prevPoint.homeScore) {
                        homeStreak++;
                        awayStreak = 0;
                        lastScorer = "home";
                        
                        if (homeStreak >= 3) {
                          turningPoints.push({
                            index: point.index,
                            type: "🔥 連続得点",
                            team: match.homeTeamName,
                            description: `${homeStreak}点連続で得点`,
                            score: `${point.homeScore}-${point.awayScore}`,
                          });
                        }
                      } else if (point.awayScore > prevPoint.awayScore) {
                        awayStreak++;
                        homeStreak = 0;
                        lastScorer = "away";
                        
                        if (awayStreak >= 3) {
                          turningPoints.push({
                            index: point.index,
                            type: "🔥 連続得点",
                            team: match.awayTeamName,
                            description: `${awayStreak}点連続で得点`,
                            score: `${point.homeScore}-${point.awayScore}`,
                          });
                        }
                      }
                      
                      // 逆転ポイント検出
                      if (idx > 0) {
                        const scoreDiff = point.homeScore - point.awayScore;
                        const prevScoreDiff = prevPoint.homeScore - prevPoint.awayScore;
                        
                        if (prevScoreDiff > 0 && scoreDiff < 0) {
                          turningPoints.push({
                            index: point.index,
                            type: "⚡ 逆転",
                            team: match.awayTeamName,
                            description: "リードを奔い逆転",
                            score: `${point.homeScore}-${point.awayScore}`,
                          });
                        } else if (prevScoreDiff < 0 && scoreDiff > 0) {
                          turningPoints.push({
                            index: point.index,
                            type: "⚡ 逆転",
                            team: match.homeTeamName,
                            description: "リードを奴い逆転",
                            score: `${point.homeScore}-${point.awayScore}`,
                          });
                        }
                      }
                    });

                    // セットポイント検出（24点以上）
                    const finalScore = scoreProgression[scoreProgression.length - 1];
                    if (finalScore) {
                      if (finalScore.homeScore >= 24 || finalScore.awayScore >= 24) {
                        const winner = finalScore.homeScore > finalScore.awayScore ? match.homeTeamName : match.awayTeamName;
                        turningPoints.push({
                          index: finalScore.index,
                          type: "🏆 セットポイント",
                          team: winner,
                          description: "セット終了",
                          score: `${finalScore.homeScore}-${finalScore.awayScore}`,
                        });
                      }
                    }

                    // 選手別パフォーマンス（セット内）
                    const playerPerformance: { [key: string]: any } = {};
                    
                    setPlays.forEach((play: any) => {
                      const key = `${play.teamSide}-${play.playerId}`;
                      if (!playerPerformance[key]) {
                        // playデータから直接選手情報を取得（シャドウイング回避）
                        const playerName = play.playerName || "Unknown";
                        const playerNumber = play.playerNumber || 0;
                        playerPerformance[key] = {
                          teamSide: play.teamSide,
                          playerId: play.playerId,
                          playerName,
                          playerNumber,
                          points: 0,
                          errors: 0,
                          total: 0,
                        };
                      }
                      
                      playerPerformance[key].total++;
                      if (play.result === "point") {
                        playerPerformance[key].points++;
                      } else if (play.result === "error") {
                        playerPerformance[key].errors++;
                      }
                    });

                    const homePlayerPerf = Object.values(playerPerformance)
                      .filter((p: any) => p.teamSide === "home")
                      .sort((a: any, b: any) => b.points - a.points);
                    
                    const awayPlayerPerf = Object.values(playerPerformance)
                      .filter((p: any) => p.teamSide === "away")
                      .sort((a: any, b: any) => b.points - a.points);

                    return (
                      <Card key={setNum} className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            第{setNum}セット分析
                            <Badge variant="outline" className="ml-auto">
                              {finalScore.homeScore} - {finalScore.awayScore}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* 得失点推移グラフ */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4">得失点推移</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={scoreProgression}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: "プレー番号", position: "insideBottom", offset: -5 }} />
                                <YAxis label={{ value: "スコア", angle: -90, position: "insideLeft" }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="homeScore" stroke="#3b82f6" name={match.homeTeamName} strokeWidth={2} />
                                <Line type="monotone" dataKey="awayScore" stroke="#ef4444" name={match.awayTeamName} strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* ターニングポイント */}
                          {turningPoints.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">ターニングポイント</h3>
                              <div className="space-y-2">
                                {turningPoints.map((tp, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">{tp.type.split(" ")[0]}</span>
                                    <div className="flex-1">
                                      <div className="font-semibold">{tp.type.split(" ").slice(1).join(" ")} - {tp.team}</div>
                                      <div className="text-sm text-gray-600">{tp.description}</div>
                                    </div>
                                    <Badge variant="outline">{tp.score}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 選手別パフォーマンス */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* ホームチーム */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                {match.homeTeamName} 選手別パフォーマンス
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 px-3">#</th>
                                      <th className="text-left py-2 px-3">名前</th>
                                      <th className="text-right py-2 px-3">得点</th>
                                      <th className="text-right py-2 px-3">ミス</th>
                                      <th className="text-right py-2 px-3">総数</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(homePlayerPerf || []).map((p: any, idx: number) => (
                                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-semibold">{p.playerNumber}</td>
                                        <td className="py-2 px-3">{p.playerName}</td>
                                        <td className="text-right py-2 px-3 text-green-600 font-semibold">{p.points}</td>
                                        <td className="text-right py-2 px-3 text-red-600">{p.errors}</td>
                                        <td className="text-right py-2 px-3">{p.total}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* アウェイチーム */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                {match.awayTeamName} 選手別パフォーマンス
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 px-3">#</th>
                                      <th className="text-left py-2 px-3">名前</th>
                                      <th className="text-right py-2 px-3">得点</th>
                                      <th className="text-right py-2 px-3">ミス</th>
                                      <th className="text-right py-2 px-3">総数</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(awayPlayerPerf || []).map((p: any, idx: number) => (
                                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-semibold">{p.playerNumber}</td>
                                        <td className="py-2 px-3">{p.playerName}</td>
                                        <td className="text-right py-2 px-3 text-green-600 font-semibold">{p.points}</td>
                                        <td className="text-right py-2 px-3 text-red-600">{p.errors}</td>
                                        <td className="text-right py-2 px-3">{p.total}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </TabsContent>

          {/* 時系列分析タブ */}
          <TabsContent value="timeSeries" className="space-y-6 mt-6">
            {!plays || !match ? (
              <div className="text-center py-12 text-muted-foreground">
                プレーデータを読み込んでいます...
              </div>
            ) : (() => {
              // プレータイプ別の時系列データを計算
              const calculateTimeSeriesData = (teamSide: 'home' | 'away') => {
                const teamPlays = plays.filter((p: any) => p.teamSide === teamSide);
                
                // プレータイプ別にグループ化
                const serveData: { index: number; successRate: number; movingAvg: number }[] = [];
                const receiveData: { index: number; successRate: number; movingAvg: number }[] = [];
                const attackData: { index: number; successRate: number; movingAvg: number }[] = [];
                const blockData: { index: number; successRate: number; movingAvg: number }[] = [];

                // ウィンドウサイズ（移動平均の計算に使用）
                const windowSize = 5;

                // サーブの時系列データ
                const servePlays = teamPlays.filter((p: any) => p.playType === 'serve');
                servePlays.forEach((play: any, index: number) => {
                  const recentPlays = servePlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const successCount = recentPlays.filter((p: any) => p.result === 'point' || p.result === 'continue').length;
                  const successRate = (successCount / recentPlays.length) * 100;
                  
                  // 移動平均の計算
                  const movingAvgWindow = servePlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const movingAvgSuccess = movingAvgWindow.filter((p: any) => p.result === 'point' || p.result === 'continue').length;
                  const movingAvg = (movingAvgSuccess / movingAvgWindow.length) * 100;
                  
                  serveData.push({ index: index + 1, successRate, movingAvg });
                });

                // レシーブの時系列データ
                const receivePlays = teamPlays.filter((p: any) => p.playType === 'receive' || p.playType === 'dig');
                receivePlays.forEach((play: any, index: number) => {
                  const recentPlays = receivePlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const successCount = recentPlays.filter((p: any) => p.result === 'continue' || p.result === 'point').length;
                  const successRate = (successCount / recentPlays.length) * 100;
                  
                  const movingAvgWindow = receivePlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const movingAvgSuccess = movingAvgWindow.filter((p: any) => p.result === 'continue' || p.result === 'point').length;
                  const movingAvg = (movingAvgSuccess / movingAvgWindow.length) * 100;
                  
                  receiveData.push({ index: index + 1, successRate, movingAvg });
                });

                // アタックの時系列データ
                const attackPlays = teamPlays.filter((p: any) => p.playType === 'attack');
                attackPlays.forEach((play: any, index: number) => {
                  const recentPlays = attackPlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const successCount = recentPlays.filter((p: any) => p.result === 'point').length;
                  const successRate = (successCount / recentPlays.length) * 100;
                  
                  const movingAvgWindow = attackPlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const movingAvgSuccess = movingAvgWindow.filter((p: any) => p.result === 'point').length;
                  const movingAvg = (movingAvgSuccess / movingAvgWindow.length) * 100;
                  
                  attackData.push({ index: index + 1, successRate, movingAvg });
                });

                // ブロックの時系列データ
                const blockPlays = teamPlays.filter((p: any) => p.playType === 'block');
                blockPlays.forEach((play: any, index: number) => {
                  const recentPlays = blockPlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const successCount = recentPlays.filter((p: any) => p.result === 'point').length;
                  const successRate = (successCount / recentPlays.length) * 100;
                  
                  const movingAvgWindow = blockPlays.slice(Math.max(0, index - windowSize + 1), index + 1);
                  const movingAvgSuccess = movingAvgWindow.filter((p: any) => p.result === 'point').length;
                  const movingAvg = (movingAvgSuccess / movingAvgWindow.length) * 100;
                  
                  blockData.push({ index: index + 1, successRate, movingAvg });
                });

                return { serveData, receiveData, attackData, blockData };
              };

              const homeTimeSeries = calculateTimeSeriesData('home');
              const awayTimeSeries = calculateTimeSeriesData('away');

              return (
                <div className="space-y-6">
                  {/* ホームチームの時系列分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {match.homeTeamName} - プレー種類別成功率推移
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* サーブ成功率推移 */}
                      {homeTimeSeries.serveData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📡 サーブ成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={homeTimeSeries.serveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'サーブ回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#3b82f6" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#ef4444" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のサーブの平均成功率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* レシーブ成功率推移 */}
                      {homeTimeSeries.receiveData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🛡️ レシーブ成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={homeTimeSeries.receiveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'レシーブ回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#10b981" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#f59e0b" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のレシーブの平均成功率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* アタック成功率推移 */}
                      {homeTimeSeries.attackData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            💥 アタック決定率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={homeTimeSeries.attackData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'アタック回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '決定率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#8b5cf6" name="決定率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#ec4899" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のアタックの平均決定率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* ブロック成功率推移 */}
                      {homeTimeSeries.blockData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🧱 ブロック成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={homeTimeSeries.blockData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'ブロック回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#06b6d4" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#f97316" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のブロックの平均成功率を表示しています。
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* アウェイチームの時系列分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {match.awayTeamName} - プレー種類別成功率推移
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* サーブ成功率推移 */}
                      {awayTimeSeries.serveData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📡 サーブ成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={awayTimeSeries.serveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'サーブ回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#3b82f6" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#ef4444" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のサーブの平均成功率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* レシーブ成功率推移 */}
                      {awayTimeSeries.receiveData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🛡️ レシーブ成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={awayTimeSeries.receiveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'レシーブ回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#10b981" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#f59e0b" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のレシーブの平均成功率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* アタック成功率推移 */}
                      {awayTimeSeries.attackData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            💥 アタック決定率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={awayTimeSeries.attackData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'アタック回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '決定率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#8b5cf6" name="決定率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#ec4899" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のアタックの平均決定率を表示しています。
                          </p>
                        </div>
                      )}

                      {/* ブロック成功率推移 */}
                      {awayTimeSeries.blockData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🧱 ブロック成功率推移
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={awayTimeSeries.blockData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'ブロック回数', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#06b6d4" name="成功率" strokeWidth={1} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="movingAvg" stroke="#f97316" name="移動平均" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            移動平均は直近5回のブロックの平均成功率を表示しています。
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
