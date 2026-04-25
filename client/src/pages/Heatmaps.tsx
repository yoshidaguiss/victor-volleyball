import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";
import Heatmap from "@/components/Heatmap";

export default function Heatmaps() {
  const params = useParams();
  const matchId = parseInt(params.matchId || "0");
  const [selectedPlayType, setSelectedPlayType] = useState<"serve" | "receive" | "attack" | "block">("attack");

  const { data: match, isLoading: matchLoading } = trpc.matches.getById.useQuery({ matchId });
  const { data: rallies } = trpc.rallies.listByMatch.useQuery({ matchId });

  // サンプルデータ（実際のプレーデータから生成する必要がある）
  const generateSampleHeatmapData = (playType: string) => {
    const points = [];
    const count = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        value: Math.random(),
        result: ["point", "continue", "error"][Math.floor(Math.random() * 3)] as "point" | "continue" | "error",
      });
    }
    
    return points;
  };

  const heatmapData = generateSampleHeatmapData(selectedPlayType);

  if (matchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link href={`/coach/${matchId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              コーチ画面に戻る
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {match.homeTeamName} vs {match.awayTeamName} - ヒートマップ分析
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {selectedPlayType === "serve" && "サーブ位置ヒートマップ"}
                    {selectedPlayType === "receive" && "レシーブ位置ヒートマップ"}
                    {selectedPlayType === "attack" && "攻撃位置ヒートマップ"}
                    {selectedPlayType === "block" && "ブロック位置ヒートマップ"}
                  </CardTitle>
                  <Select value={selectedPlayType} onValueChange={(value: any) => setSelectedPlayType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serve">サーブ</SelectItem>
                      <SelectItem value="receive">レシーブ</SelectItem>
                      <SelectItem value="attack">アタック</SelectItem>
                      <SelectItem value="block">ブロック</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Heatmap data={heatmapData} width={400} height={600} radius={50} intensity={0.5} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>凡例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  <span>得点（成功）</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span>継続</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  <span>エラー（失敗）</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>統計サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総プレー数</span>
                  <span className="font-semibold">{heatmapData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">成功数</span>
                  <span className="font-semibold text-green-600">
                    {heatmapData.filter(p => p.result === "point").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">継続数</span>
                  <span className="font-semibold text-blue-600">
                    {heatmapData.filter(p => p.result === "continue").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">エラー数</span>
                  <span className="font-semibold text-red-600">
                    {heatmapData.filter(p => p.result === "error").length}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">成功率</span>
                    <span className="font-bold text-lg">
                      {heatmapData.length > 0
                        ? ((heatmapData.filter(p => p.result === "point").length / heatmapData.length) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">分析のヒント</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <p>• 濃い色の領域は頻繁にプレーが発生している位置です</p>
                <p>• 緑色の集中エリアは得点につながりやすい位置を示します</p>
                <p>• 赤色の集中エリアはエラーが多発している位置を示します</p>
                <p>• 相手チームのヒートマップと比較して戦術を立てましょう</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
