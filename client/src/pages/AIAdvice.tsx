import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Settings } from "lucide-react";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";

export default function AIAdvice() {
  const params = useParams();
  const matchId = parseInt(params.matchId || "0");
  const [advice, setAdvice] = useState<string | null>(null);

  const { data: match } = trpc.matches.getById.useQuery({ matchId });
  const generateAdviceMutation = trpc.aiAnalysis.generateTacticalAdvice.useMutation({
    onSuccess: (data) => {
      setAdvice(data.advice);
      toast.success("AI戦術提案を生成しました");
    },
    onError: (error) => {
      if (error.message.includes("APIキーが設定されていません")) {
        toast.error("Gemini APIキーが設定されていません", {
          description: "設定画面からAPIキーを登録してください",
          action: {
            label: "設定画面を開く",
            onClick: () => window.location.href = "/settings",
          },
        });
      } else {
        toast.error(`エラー: ${error.message}`);
      }
    },
  });

  const handleGenerateAdvice = () => {
    setAdvice(null);
    generateAdviceMutation.mutate({ matchId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/coach/${matchId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                コーチ画面に戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI戦術提案
            </h1>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                設定
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 試合情報 */}
        {match && (
          <Card className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 soft-shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-sm opacity-90 mb-1">{match.homeTeamName}</p>
                  <p className="text-4xl font-bold">{match.homeScore || 0}</p>
                </div>
                <div className="text-2xl font-bold px-8">VS</div>
                <div className="text-center flex-1">
                  <p className="text-sm opacity-90 mb-1">{match.awayTeamName}</p>
                  <p className="text-4xl font-bold">{match.awayScore || 0}</p>
                </div>
              </div>
              <div className="text-center mt-4 text-sm opacity-90">
                セット {match.currentSet} | {match.matchCode}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI戦術提案生成ボタン */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">試合状況をAIが分析します</h2>
              <p className="text-gray-600 mb-6">
                現在の試合状況、選手のパフォーマンス、チーム統計を分析し、具体的な戦術提案を生成します。
              </p>
              <Button
                onClick={handleGenerateAdvice}
                disabled={generateAdviceMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {generateAdviceMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI戦術提案を生成
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI戦術提案表示 */}
        {advice && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI戦術提案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <Streamdown>{advice}</Streamdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 注意事項 */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">⚠️ 注意事項</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI提案は参考情報です。最終判断はコーチが行ってください</li>
                  <li>試合状況が変化した場合は、再度生成してください</li>
                  <li>Gemini APIの使用量に応じて料金が発生する場合があります</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
