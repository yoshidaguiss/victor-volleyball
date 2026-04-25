import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TacticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
}

export default function TacticsDialog({ open, onOpenChange, matchId }: TacticsDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const generateAnalysis = trpc.analysis.generate.useMutation();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateAnalysis.mutateAsync({
        matchId,
        scope: "timeout",
      });
      setAnalysis(result.analysis);
    } catch (error) {
      console.error("AI分析エラー:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ダイアログが開かれたときに自動で分析を実行
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen && !analysis) {
      handleAnalyze();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            AI戦術提案
          </DialogTitle>
          <DialogDescription>
            試合データを分析し、相手の弱点と具体的な戦術を提案します
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">AI分析中...</p>
            <p className="text-sm text-muted-foreground mt-2">試合データを解析しています</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* 試合の流れ */}
            {analysis.summary && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  試合の流れ
                </h3>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
            )}

            {/* 相手の弱点 */}
            {analysis.opponentWeaknesses && analysis.opponentWeaknesses.length > 0 && (
              <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-red-900">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  相手の弱点（攻撃チャンス！）
                </h3>
                <div className="space-y-2">
                  {analysis.opponentWeaknesses.map((weakness: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="destructive" className="mt-0.5 flex-shrink-0">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-red-900 font-medium">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 具体的な戦術 */}
            {analysis.tactics && analysis.tactics.length > 0 && (
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-900">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                  具体的な戦術提案
                </h3>
                <div className="space-y-3">
                  {analysis.tactics.map((tactic: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-green-200">
                      <Badge variant="default" className="mt-0.5 flex-shrink-0 bg-green-600">
                        戦術{index + 1}
                      </Badge>
                      <p className="text-sm text-green-900 font-medium">{tactic}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 自チームの強み */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-base mb-2 text-blue-900">自チームの強み</h3>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 自チームの弱点 */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-bold text-base mb-2 text-orange-900">自チームの弱点</h3>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-600 font-bold">!</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 相手の攻撃パターン */}
            {analysis.opponentPatterns && analysis.opponentPatterns.length > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-bold text-base mb-2 text-purple-900">相手の攻撃パターン</h3>
                <ul className="space-y-1">
                  {analysis.opponentPatterns.map((pattern: string, index: number) => (
                    <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">→</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改善提案 */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-base mb-2 text-gray-900">その他の改善提案</h3>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-gray-600 font-bold">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handleAnalyze()}>
                再分析
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">分析結果がありません</p>
            <Button onClick={handleAnalyze}>
              分析を開始
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
