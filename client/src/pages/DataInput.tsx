import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AttackDetailsDialog from "@/components/AttackDetailsDialog";
import ServeDetailsDialog from "@/components/ServeDetailsDialog";
import ReceiveDetailsDialog from "@/components/ReceiveDetailsDialog";
import TimeoutDialog from "@/components/TimeoutDialog";
import SubstitutionDialog from "@/components/SubstitutionDialog";
import BlockDetailsDialog from "@/components/BlockDetailsDialog";
import SetDetailsDialog from "@/components/SetDetailsDialog";
import ViolationDialog, { type ViolationType } from "@/components/ViolationDialog";
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

/**
 * 革新的データ入力システム
 * 
 * コンセプト：「高校生でも使える簡単さ」×「プロレベルの分析力」
 * - 試合中に全て入力できる（3秒以内/プレー）
 * - リアルタイムでデータを活用
 * - 最小限の入力で最大限のデータ量
 */

type PlayType = "serve" | "receive" | "set" | "attack" | "block" | "dig" | "violation";
type PlayResult = "point" | "error" | "continue";

interface QuickAction {
  playType: PlayType;
  result: PlayResult;
  label: string;
  icon: string;
  color: string;
}

export default function DataInput() {
  const { matchId } = useParams();
  const [, navigate] = useLocation();

  // 状態管理
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [currentTeamSide, setCurrentTeamSide] = useState<"home" | "away">("home");
  const [showAttackDetailsDialog, setShowAttackDetailsDialog] = useState(false);
  const [pendingAttackAction, setPendingAttackAction] = useState<QuickAction | null>(null);
  const [showServeDetailsDialog, setShowServeDetailsDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);
  const [substitutionTeamId, setSubstitutionTeamId] = useState<number | null>(null);
  const [pendingServeAction, setPendingServeAction] = useState<QuickAction | null>(null);
  const [showReceiveDetailsDialog, setShowReceiveDetailsDialog] = useState(false);
  const [pendingReceiveAction, setPendingReceiveAction] = useState<QuickAction | null>(null);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showBlockDetailsDialog, setShowBlockDetailsDialog] = useState(false);
  const [pendingBlockAction, setPendingBlockAction] = useState<QuickAction | null>(null);
  const [showSetDetailsDialog, setShowSetDetailsDialog] = useState(false);
  const [pendingSetAction, setPendingSetAction] = useState<QuickAction | null>(null);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [pendingViolationAction, setPendingViolationAction] = useState<QuickAction | null>(null);

  // データ取得
  const { data: match, refetch: refetchMatch } = trpc.matches.getById.useQuery(
    { matchId: Number(matchId) },
    { enabled: !!matchId, refetchInterval: 5000 }
  );

  const { data: homePlayers } = trpc.players.listByTeam.useQuery(
    { teamId: match?.homeTeamId || 0 },
    { enabled: !!match?.homeTeamId }
  );

  const { data: awayTeamPlayers } = trpc.players.listByTeam.useQuery(
    { teamId: (match as any)?.awayTeamId || 0 },
    { enabled: !!(match as any)?.awayTeamId }
  );

  const { data: recentPlays, refetch: refetchPlays } = trpc.plays.listByMatch.useQuery(
    { matchId: Number(matchId) || 0 },
    { enabled: !!matchId, refetchInterval: 3000 }
  );

  // アウェイチームの選手: awayTeamIdがあれば登録済み選手、なければプレーデータから抽出
  const awayPlayers = useMemo(() => {
    if (awayTeamPlayers && awayTeamPlayers.length > 0) {
      return awayTeamPlayers.map((p: any) => ({ id: p.id, number: p.number, name: p.name }));
    }
    if (!recentPlays) return [];
    const awayPlayerMap = new Map<number, { id: number; number: number; name: string }>();
    recentPlays.filter((p: any) => p.teamSide === "away").forEach((p: any) => {
      if (!awayPlayerMap.has(p.playerId)) {
        awayPlayerMap.set(p.playerId, { id: p.playerId, number: p.playerNumber, name: p.playerName });
      }
    });
    return Array.from(awayPlayerMap.values());
  }, [recentPlays, awayTeamPlayers]);

  // プレー作成
  const createPlay = trpc.plays.create.useMutation({
    onSuccess: () => {
      refetchPlays();
      refetchMatch();
      setSelectedPlayer(null);
      toast.success("記録完了", { duration: 1000 });
    },
    onError: (error) => {
      toast.error("記録に失敗しました");
      console.error(error);
    },
  });

  // プレー削除
  const deletePlay = trpc.plays.delete.useMutation({
    onSuccess: () => {
      refetchPlays();
      refetchMatch();
      toast.success("プレーを削除しました", { duration: 1000 });
    },
    onError: (error) => {
      toast.error("削除に失敗しました");
      console.error(error);
    },
  });

  // セット終了
  const nextSetMutation = trpc.matches.nextSet.useMutation({
    onSuccess: (data) => {
      refetchMatch();
      toast.success(`セット${data.currentSet}に切り替えました`);
    },
    onError: (error: any) => {
      toast.error(error.message || "セット切り替えに失敗しました");
    },
  });

  // 削除確認ハンドラー
  const handleDeletePlay = (playId: number, playerName: string, playType: string) => {
    if (window.confirm(`${playerName}の${playType}を削除しますか？`)) {
      deletePlay.mutate({ playId });
    }
  };

  // プレーグループの定義
  const playGroups = [
    {
      title: "📡 サーブ",
      actions: [
        { playType: "serve" as PlayType, result: "point" as PlayResult, label: "エース", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        { playType: "serve" as PlayType, result: "continue" as PlayResult, label: "成功", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
        { playType: "serve" as PlayType, result: "error" as PlayResult, label: "ミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
      ],
    },
    {
      title: "🛡️ レシーブ・ディグ",
      actions: [
        { playType: "receive" as PlayType, result: "continue" as PlayResult, label: "レシーブ成功", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
        { playType: "receive" as PlayType, result: "error" as PlayResult, label: "レシーブミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
        { playType: "dig" as PlayType, result: "continue" as PlayResult, label: "ディグ成功", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
        { playType: "dig" as PlayType, result: "error" as PlayResult, label: "ディグミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
      ],
    },
    {
      title: "🤲 セット",
      actions: [
        { playType: "set" as PlayType, result: "continue" as PlayResult, label: "セット", color: "bg-gradient-to-br from-violet-500 to-violet-600" },
        { playType: "attack" as PlayType, result: "point" as PlayResult, label: "ツーアタック決まった", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        { playType: "attack" as PlayType, result: "error" as PlayResult, label: "ツーアタックミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
      ],
    },
    {
      title: "💥 アタック",
      actions: [
        { playType: "attack" as PlayType, result: "point" as PlayResult, label: "決まった", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        { playType: "attack" as PlayType, result: "error" as PlayResult, label: "ミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
        { playType: "attack" as PlayType, result: "continue" as PlayResult, label: "拾われた", color: "bg-gradient-to-br from-amber-500 to-amber-600" },
      ],
    },
    {
      title: "🧱 ブロック",
      actions: [
        { playType: "block" as PlayType, result: "point" as PlayResult, label: "決まった", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        { playType: "block" as PlayType, result: "continue" as PlayResult, label: "タッチ", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
        { playType: "block" as PlayType, result: "error" as PlayResult, label: "ブロックミス", color: "bg-gradient-to-br from-rose-500 to-rose-600" },
      ],
    },
    {
      title: "🚨 反則",
      actions: [
        { playType: "violation" as PlayType, result: "error" as PlayResult, label: "反則を記録", color: "bg-gradient-to-br from-red-600 to-red-700" },
      ],
    },
  ];

  // プレー記録
  const handleQuickAction = (action: QuickAction) => {
    if (!selectedPlayer || !match) {
      toast.error("選手を選択してください");
      return;
    }

    const player = currentPlayers?.find(p => p.id === selectedPlayer);
    if (!player) return;

    // アタックの場合、詳細ダイアログを表示（3タップ目）
    if (action.playType === "attack") {
      setPendingAttackAction(action);
      setShowAttackDetailsDialog(true);
      return;
    }

    // サーブの場合、詳細ダイアログを表示
    if (action.playType === "serve") {
      setPendingServeAction(action);
      setShowServeDetailsDialog(true);
      return;
    }

    // レシーブの場合、詳細ダイアログを表示
    if (action.playType === "receive") {
      setPendingReceiveAction(action);
      setShowReceiveDetailsDialog(true);
      return;
    }

    // 反則の場合、種別ダイアログを表示
    if (action.playType === "violation") {
      setPendingViolationAction(action);
      setShowViolationDialog(true);
      return;
    }

    // その他はそのまま記録
    createPlay.mutate({
      matchId: Number(matchId),
      setNumber: match.currentSet,
      rallyNumber: (recentPlays?.length || 0) + 1,
      playType: action.playType,
      playerId: selectedPlayer,
      playerNumber: player?.number || 0,
      playerName: player?.name || "",
      result: action.result,
      teamSide: currentTeamSide,
      positionX: 0,
      positionY: 0,
    });
  };

  // 攻撃詳細確認ハンドラー
  const handleAttackDetailsConfirm = (details: any) => {
    if (!selectedPlayer || !match || !pendingAttackAction) return;

    const players = currentTeamSide === "home" ? homePlayers : awayPlayers;
    const player = players?.find((p: any) => p.id === selectedPlayer);
    createPlay.mutate({
      matchId: Number(matchId),
      setNumber: match.currentSet,
      rallyNumber: (recentPlays?.length || 0) + 1,
      playType: "attack",
      playerId: selectedPlayer,
      playerNumber: player?.number || 0,
      playerName: player?.name || "",
      result: pendingAttackAction.result,
      teamSide: currentTeamSide,
      positionX: 0,
      positionY: 0,
      details: JSON.stringify(details),
    });

    setPendingAttackAction(null);
  };

  // サーブ詳細確認ハンドラー
  const handleServeDetailsConfirm = (details: any) => {
    if (!selectedPlayer || !match || !pendingServeAction) return;

    const players = currentTeamSide === "home" ? homePlayers : awayPlayers;
    const player = players?.find((p: any) => p.id === selectedPlayer);
    createPlay.mutate({
      matchId: Number(matchId),
      setNumber: match.currentSet,
      rallyNumber: (recentPlays?.length || 0) + 1,
      playType: "serve",
      playerId: selectedPlayer,
      playerNumber: player?.number || 0,
      playerName: player?.name || "",
      result: pendingServeAction.result,
      teamSide: currentTeamSide,
      positionX: 0,
      positionY: 0,
      details: JSON.stringify(details),
    });

    setPendingServeAction(null);
  };

  // レシーブ詳細確認ハンドラー
  const handleReceiveDetailsConfirm = (details: any) => {
    if (!selectedPlayer || !match || !pendingReceiveAction) return;

    const players = currentTeamSide === "home" ? homePlayers : awayPlayers;
    const player = players?.find((p: any) => p.id === selectedPlayer);
    createPlay.mutate({
      matchId: Number(matchId),
      setNumber: match.currentSet,
      rallyNumber: (recentPlays?.length || 0) + 1,
      playType: "receive",
      playerId: selectedPlayer,
      playerNumber: player?.number || 0,
      playerName: player?.name || "",
      result: pendingReceiveAction.result,
      teamSide: currentTeamSide,
      positionX: 0,
      positionY: 0,
      details: JSON.stringify(details),
    });

    setPendingReceiveAction(null);
  };

  // 反則確認ハンドラー
  const handleViolationConfirm = (violationType: ViolationType) => {
    if (!selectedPlayer || !match || !pendingViolationAction) return;
    const players = currentTeamSide === "home" ? homePlayers : awayPlayers;
    const player = players?.find((p: any) => p.id === selectedPlayer);
    createPlay.mutate({
      matchId: Number(matchId),
      setNumber: match.currentSet,
      rallyNumber: (recentPlays?.length || 0) + 1,
      playType: "violation",
      playerId: selectedPlayer,
      playerNumber: player?.number || 0,
      playerName: player?.name || "",
      result: "error",
      teamSide: currentTeamSide,
      positionX: 0,
      positionY: 0,
      details: JSON.stringify({ violationType }),
    });
    setPendingViolationAction(null);
  };

  // 現在のチームの選手
  const currentPlayers = currentTeamSide === "home" ? homePlayers : awayPlayers;

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ダイアログが開いている場合はスキップ
      if (showAttackDetailsDialog || showServeDetailsDialog || showReceiveDetailsDialog || showShortcutHelp) {
        if (e.key === "Escape") {
          setShowShortcutHelp(false);
        }
        return;
      }

      // 数字キー（1-9）で選手選択
      if (e.key >= "1" && e.key <= "9" && currentPlayers) {
        const index = parseInt(e.key) - 1;
        if (index < currentPlayers.length) {
          setSelectedPlayer(currentPlayers[index].id);
          toast.success(`選手 #${currentPlayers[index].number} ${currentPlayers[index].name} を選択`, { duration: 1000 });
        }
      }

      // ?キーでヘルプ表示
      if (e.key === "?") {
        setShowShortcutHelp(true);
      }

      // Escキーで選手選択を解除
      if (e.key === "Escape") {
        setSelectedPlayer(null);
        toast.info("選手選択を解除", { duration: 1000 });
      }

      // Tabキーでチーム切り替え
      if (e.key === "Tab") {
        e.preventDefault();
        setCurrentTeamSide(prev => prev === "home" ? "away" : "home");
        setSelectedPlayer(null);
        toast.info(`${currentTeamSide === "home" ? match?.awayTeamName : match?.homeTeamName}に切り替え`, { duration: 1000 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPlayers, currentTeamSide, showAttackDetailsDialog, showServeDetailsDialog, showReceiveDetailsDialog, showShortcutHelp, match]);

  // 選手別統計を計算
  const calculatePlayerStats = (playerId: number) => {
    if (!recentPlays) return null;
    
    const playerPlays = recentPlays.filter(p => p.playerId === playerId);
    const attacks = playerPlays.filter(p => p.playType === "attack");
    const attackSuccess = attacks.filter(p => p.result === "point").length;
    const serves = playerPlays.filter(p => p.playType === "serve");
    const serveSuccess = serves.filter(p => p.result === "point").length;
    
    return {
      attacks: attacks.length,
      attackSuccess,
      attackRate: attacks.length > 0 ? Math.round((attackSuccess / attacks.length) * 100) : 0,
      serves: serves.length,
      serveSuccess,
      serveRate: serves.length > 0 ? Math.round((serveSuccess / serves.length) * 100) : 0,
    };
  };

  // 最近のプレーから選手の調子を判定
  const getPlayerMomentum = (playerId: number): "hot" | "cold" | "normal" => {
    if (!recentPlays) return "normal";
    
    const recent5 = recentPlays.filter(p => p.playerId === playerId).slice(-5);
    if (recent5.length < 3) return "normal";
    
    const successCount = recent5.filter(p => p.result === "point").length;
    const errorCount = recent5.filter(p => p.result === "error").length;
    
    if (successCount >= 3) return "hot";
    if (errorCount >= 3) return "cold";
    return "normal";
  };

  if (!matchId || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">試合データを読み込んでいます...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-2 md:px-4 py-2 md:py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="p-2 md:p-3">
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">戻る</span>
              </Button>
              <div className="flex-1 md:flex-none">
                <h1 className="text-sm md:text-lg font-bold truncate">{match.homeTeamName} vs {match.awayTeamName}</h1>
                <p className="text-xs md:text-sm text-gray-500">セット {match.currentSet}</p>
              </div>
            </div>
            
            {/* スコア表示 */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-500 truncate max-w-[60px] md:max-w-none">{match.homeTeamName}</p>
                <p className="text-xl md:text-3xl font-bold">
                  {Array.isArray(match.scoreHome) ? match.scoreHome.reduce((a: number, b: number) => a + b, 0) : 0}
                </p>
              </div>
              <span className="text-lg md:text-2xl text-gray-400">-</span>
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-500 truncate max-w-[60px] md:max-w-none">{match.awayTeamName}</p>
                <p className="text-xl md:text-3xl font-bold">
                  {Array.isArray(match.scoreAway) ? match.scoreAway.reduce((a: number, b: number) => a + b, 0) : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTimeoutDialog(true)}
                className="flex-1 md:flex-none text-xs md:text-sm"
              >
                <Clock className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">タイムアウト</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const teamId = currentTeamSide === "home" ? match.homeTeamId : 0;
                  setSubstitutionTeamId(teamId);
                  setShowSubstitutionDialog(true);
                }}
                className="flex-1 md:flex-none text-xs md:text-sm"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">交代</span>
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  const currentSet = match.currentSet || 1;
                  const maxSets = match.sets || 5;
                  if (currentSet >= maxSets) {
                    toast.error("これが最終セットです");
                    return;
                  }
                  if (window.confirm(`セット${currentSet}を終了してセット${currentSet + 1}に進みますか？`)) {
                    nextSetMutation.mutate({ matchId: Number(matchId) });
                  }
                }}
                className="flex-1 md:flex-none text-xs md:text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Target className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">セット終了</span>
                <span className="md:hidden">セット終了</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
        {/* チーム切り替え */}
        <div className="flex gap-2 mb-3 md:mb-4">
          <Button
            size="default"
            variant={currentTeamSide === "home" ? "default" : "outline"}
            className="flex-1 h-12 md:h-14 text-sm md:text-lg"
            onClick={() => {
              setCurrentTeamSide("home");
              setSelectedPlayer(null);
            }}
          >
            {match.homeTeamName}
          </Button>
          <Button
            size="default"
            variant={currentTeamSide === "away" ? "default" : "outline"}
            className="flex-1 h-12 md:h-14 text-sm md:text-lg"
            onClick={() => {
              setCurrentTeamSide("away");
              setSelectedPlayer(null);
            }}
          >
            {match.awayTeamName}
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 md:gap-6">
          {/* 左側：選手選択 */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card className="p-4 md:p-6 soft-shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">1. 選手を選択</h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
                {currentPlayers?.map((player) => {
                  const stats = calculatePlayerStats(player.id);
                  const momentum = getPlayerMomentum(player.id);
                  const isSelected = selectedPlayer === player.id;
                  
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`
                        relative p-2 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 smooth-transition
                        ${isSelected 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 soft-shadow-lg" 
                          : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 hover:scale-102 soft-shadow"
                        }
                      `}
                    >
                      {/* 調子インジケーター */}
                      {momentum === "hot" && (
                        <div className="absolute top-1 right-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      {momentum === "cold" && (
                        <div className="absolute top-1 right-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <p className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">#{player.number}</p>
                        <p className={`text-xs md:text-sm font-semibold truncate ${isSelected ? "text-white" : "text-gray-700"}`}>
                          {player.name}
                        </p>
                        {stats && stats.attacks > 0 && (
                          <p className={`text-xs mt-1 ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                            {stats.attackSuccess}/{stats.attacks} ({stats.attackRate}%)
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* 中央：クイックアクション */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <Card className="p-4 md:p-6 soft-shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">
                2. プレーを選択
                {selectedPlayer && (
                  <span className="ml-2 text-blue-600 font-medium text-sm md:text-base">
                    (#{currentPlayers?.find(p => p.id === selectedPlayer)?.number} {currentPlayers?.find(p => p.id === selectedPlayer)?.name})
                  </span>
                )}
              </h3>
              
              <div className="space-y-3 md:space-y-6">
                {playGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {group.title}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {group.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => handleQuickAction(action)}
                          disabled={!selectedPlayer || createPlay.isPending}
                          className={`
                            h-14 md:h-16 rounded-xl md:rounded-2xl font-semibold text-white transition-all duration-200
                            ${action.color}
                            shadow-sm hover:shadow-md
                            ${!selectedPlayer ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
                            ${createPlay.isPending ? "opacity-50" : ""}
                          `}
                        >
                          <span className="text-xs md:text-sm">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* リアルタイム統計 */}
              {selectedPlayer && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm md:text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    リアルタイム統計
                  </h4>
                  {(() => {
                    const stats = calculatePlayerStats(selectedPlayer);
                    const player = currentPlayers?.find(p => p.id === selectedPlayer);
                    if (!stats || !player) return null;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        {stats.attacks > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">アタック成功率</span>
                            <Badge variant={stats.attackRate >= 50 ? "default" : "secondary"}>
                              {stats.attackSuccess}/{stats.attacks} ({stats.attackRate}%)
                            </Badge>
                          </div>
                        )}
                        {stats.serves > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">サーブ成功率</span>
                            <Badge variant={stats.serveRate >= 50 ? "default" : "secondary"}>
                              {stats.serveSuccess}/{stats.serves} ({stats.serveRate}%)
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </Card>

            {/* 最近のプレー */}
            <Card className="p-6 mt-6 soft-shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">最近のプレー</h3>
              <div className="space-y-2">
                {recentPlays && recentPlays.length > 0 ? (
                  recentPlays.slice(-5).reverse().map((play, index) => {
                    const player = [...(homePlayers || []), ...(awayPlayers || [])].find(
                      p => p.id === play.playerId
                    );
                    
                    const playTypeLabel = {
                      serve: "サーブ",
                      receive: "レシーブ",
                      set: "セット",
                      attack: "アタック",
                      block: "ブロック",
                      dig: "ディグ",
                    }[play.playType];
                    
                    const resultLabel = {
                      point: "得点",
                      error: "エラー",
                      continue: "継続",
                    }[play.result];
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">#{player?.number}</span>
                          <span className="text-gray-700">{player?.name}</span>
                          <span className="text-gray-500">{playTypeLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              play.result === "point" ? "default" :
                              play.result === "error" ? "destructive" :
                              "secondary"
                            }
                          >
                            {resultLabel}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeletePlay(play.id, player?.name || "不明", playTypeLabel || "不明")}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">まだプレーが記録されていません</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 攻撃詳細ダイアログ（3タップ目） */}
      {selectedPlayer && pendingAttackAction && (
        <AttackDetailsDialog
          open={showAttackDetailsDialog}
          onOpenChange={setShowAttackDetailsDialog}
          onConfirm={handleAttackDetailsConfirm}
          playerNumber={currentPlayers?.find(p => p.id === selectedPlayer)?.number || 0}
          initialResult={
            pendingAttackAction.result === "point" ? "kill" :
            pendingAttackAction.result === "error" ? "error" :
            "dug"
          }
        />
      )}

      {/* サーブ詳細ダイアログ */}
      {selectedPlayer && pendingServeAction && (
        <ServeDetailsDialog
          open={showServeDetailsDialog}
          onClose={() => {
            setShowServeDetailsDialog(false);
            setPendingServeAction(null);
          }}
          onConfirm={handleServeDetailsConfirm}
        />
      )}

      {/* レシーブ詳細ダイアログ */}
      {selectedPlayer && pendingReceiveAction && (
        <ReceiveDetailsDialog
          open={showReceiveDetailsDialog}
          onClose={() => {
            setShowReceiveDetailsDialog(false);
            setPendingReceiveAction(null);
          }}
          onConfirm={handleReceiveDetailsConfirm}
        />
      )}

      {/* タイムアウトダイアログ */}
      <TimeoutDialog
        matchId={parseInt(matchId || "0")}
        currentSet={match?.currentSet || 1}
        open={showTimeoutDialog}
        onOpenChange={setShowTimeoutDialog}
      />

      {/* 交代ダイアログ */}
      {substitutionTeamId && (
        <SubstitutionDialog
          matchId={parseInt(matchId || "0")}
          currentSet={match?.currentSet || 1}
          teamId={substitutionTeamId}
          open={showSubstitutionDialog}
          onOpenChange={setShowSubstitutionDialog}
        />
      )}

      <ViolationDialog
        open={showViolationDialog}
        onClose={() => { setShowViolationDialog(false); setPendingViolationAction(null); }}
        onConfirm={handleViolationConfirm}
      />

      {/* キーボードショートカットヘルプ */}
      {showShortcutHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowShortcutHelp(false)}>
          <Card className="max-w-2xl w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">⌨️ キーボードショートカット</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">1-9</span>
                <span className="text-gray-600">選手選択（上から1番目から9番目）</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">Tab</span>
                <span className="text-gray-600">チーム切り替え（ホーム ↔ アウェイ）</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">Esc</span>
                <span className="text-gray-600">選手選択を解除</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">?</span>
                <span className="text-gray-600">このヘルプを表示</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                💡 <strong>ヒント：</strong> 選手を選んだら、画面上のプレーボタンをクリックして記録しましょう！
              </p>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowShortcutHelp(false)}>
              閉じる
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
