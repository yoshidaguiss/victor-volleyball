import { AlertTriangle, Lightbulb, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Play {
  id: number;
  playType: string;
  result: string;
  playerId: number | null;
  teamSide: string;
}

interface Player {
  id: number;
  name: string;
  number: number;
}

interface IntelligentSuggestionsProps {
  recentPlays: Play[];
  currentPlayers: Player[];
  currentTeam: string;
}

export function IntelligentSuggestions({ recentPlays, currentPlayers, currentTeam }: IntelligentSuggestionsProps) {
  // 連続失点の検出
  const detectConsecutiveLosses = () => {
    if (!recentPlays || recentPlays.length < 3) return null;
    
    const last5Plays = recentPlays.slice(-5);
    const losses = last5Plays.filter(p => 
      (p.teamSide === currentTeam && p.result === "error") ||
      (p.teamSide !== currentTeam && p.result === "point")
    );
    
    if (losses.length >= 3) {
      return {
        count: losses.length,
        message: `${losses.length}連続失点中です。タイムアウトを検討してください。`
      };
    }
    return null;
  };

  // 最適な攻撃パターンの提案
  const suggestAttackPattern = () => {
    if (!recentPlays || recentPlays.length < 10) return null;
    
    const attackPlays = recentPlays.filter(p => p.playType === "attack" && p.teamSide === currentTeam);
    if (attackPlays.length < 5) return null;
    
    const successfulAttacks = attackPlays.filter(p => p.result === "point");
    const successRate = (successfulAttacks.length / attackPlays.length) * 100;
    
    if (successRate < 40) {
      return {
        type: "warning",
        message: `攻撃成功率が${Math.round(successRate)}%と低下しています。コンビネーション攻撃を試してみましょう。`
      };
    } else if (successRate > 60) {
      return {
        type: "success",
        message: `攻撃成功率${Math.round(successRate)}%！この調子で攻め続けましょう。`
      };
    }
    return null;
  };

  // 選手パフォーマンス分析
  const analyzePlayerPerformance = () => {
    if (!recentPlays || !currentPlayers || recentPlays.length < 10) return null;
    
    const playerStats = currentPlayers.map(player => {
      const playerPlays = recentPlays.filter(p => p.playerId === player.id && p.teamSide === currentTeam);
      const successfulPlays = playerPlays.filter(p => p.result === "point");
      const successRate = playerPlays.length > 0 ? (successfulPlays.length / playerPlays.length) * 100 : 0;
      
      return {
        player,
        playsCount: playerPlays.length,
        successRate: Math.round(successRate)
      };
    });
    
    // 最も活躍している選手
    const topPerformer = playerStats
      .filter(s => s.playsCount >= 3)
      .sort((a, b) => b.successRate - a.successRate)[0];
    
    // 調子が悪い選手
    const underPerformer = playerStats
      .filter(s => s.playsCount >= 3)
      .sort((a, b) => a.successRate - b.successRate)[0];
    
    return { topPerformer, underPerformer };
  };

  const consecutiveLosses = detectConsecutiveLosses();
  const attackSuggestion = suggestAttackPattern();
  const playerAnalysis = analyzePlayerPerformance();

  // 表示する示唆がない場合は何も表示しない
  if (!consecutiveLosses && !attackSuggestion && !playerAnalysis) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          インテリジェント示唆
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 連続失点アラート */}
        {consecutiveLosses && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">連続失点アラート</p>
              <p className="text-xs text-red-700 mt-1">{consecutiveLosses.message}</p>
            </div>
          </div>
        )}

        {/* 攻撃パターン提案 */}
        {attackSuggestion && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border ${
            attackSuggestion.type === "warning" 
              ? "bg-yellow-50 border-yellow-200" 
              : "bg-green-50 border-green-200"
          }`}>
            <TrendingUp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              attackSuggestion.type === "warning" ? "text-yellow-600" : "text-green-600"
            }`} />
            <div>
              <p className="text-sm font-bold text-foreground">攻撃パターン分析</p>
              <p className="text-xs text-muted-foreground mt-1">{attackSuggestion.message}</p>
            </div>
          </div>
        )}

        {/* 選手パフォーマンス */}
        {playerAnalysis && (
          <div className="space-y-2">
            {playerAnalysis.topPerformer && playerAnalysis.topPerformer.successRate > 50 && (
              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium">
                    #{playerAnalysis.topPerformer.player.number} {playerAnalysis.topPerformer.player.name}
                  </span>
                </div>
                <Badge variant="default" className="bg-green-600 text-white text-xs">
                  好調 {playerAnalysis.topPerformer.successRate}%
                </Badge>
              </div>
            )}
            
            {playerAnalysis.underPerformer && playerAnalysis.underPerformer.successRate < 30 && (
              <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium">
                    #{playerAnalysis.underPerformer.player.number} {playerAnalysis.underPerformer.player.name}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  要注意 {playerAnalysis.underPerformer.successRate}%
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
