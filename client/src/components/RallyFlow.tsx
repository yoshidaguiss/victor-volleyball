import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Shield, Activity } from "lucide-react";

interface RallyFlowProps {
  playSequence: string[];
  isActive: boolean;
  rallyNumber?: number;
}

const PLAY_TYPE_LABELS: Record<string, string> = {
  serve: "サーブ",
  receive: "レシーブ",
  set: "セット",
  attack: "アタック",
  block: "ブロック",
  dig: "ディグ",
};

const PLAY_TYPE_COLORS: Record<string, string> = {
  serve: "bg-blue-500",
  receive: "bg-green-500",
  set: "bg-yellow-500",
  attack: "bg-red-500",
  block: "bg-purple-500",
  dig: "bg-orange-500",
};

const PLAY_TYPE_ICONS: Record<string, React.ReactNode> = {
  serve: <Target className="w-3 h-3" />,
  receive: <Shield className="w-3 h-3" />,
  set: <Activity className="w-3 h-3" />,
  attack: <Target className="w-3 h-3" />,
  block: <Shield className="w-3 h-3" />,
  dig: <Activity className="w-3 h-3" />,
};

export default function RallyFlow({ playSequence, isActive, rallyNumber }: RallyFlowProps) {
  if (playSequence.length === 0 && !isActive) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {isActive ? (
            <>
              <span>現在のラリー</span>
              <Badge variant="default" className="ml-auto animate-pulse">
                進行中
              </Badge>
            </>
          ) : (
            <>
              <span>ラリー #{rallyNumber}</span>
              <Badge variant="secondary" className="ml-auto">
                完了
              </Badge>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {playSequence.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            プレーを記録してください
          </p>
        ) : (
          <div className="space-y-3">
            {/* プレーシーケンスの視覚化 */}
            <div className="flex flex-wrap items-center gap-2">
              {playSequence.map((playType, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${PLAY_TYPE_COLORS[playType]} text-white border-none flex items-center gap-1`}
                  >
                    {PLAY_TYPE_ICONS[playType]}
                    <span className="text-xs">{PLAY_TYPE_LABELS[playType]}</span>
                  </Badge>
                  {index < playSequence.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* プレー数の表示 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>プレー数: {playSequence.length}</span>
              {isActive && (
                <span className="text-primary font-medium">ラリー継続中...</span>
              )}
            </div>

            {/* プレータイプの内訳 */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {Object.entries(
                playSequence.reduce((acc, playType) => {
                  acc[playType] = (acc[playType] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([playType, count]) => (
                <div
                  key={playType}
                  className="text-xs flex items-center gap-1 bg-muted px-2 py-1 rounded"
                >
                  <span className={`w-2 h-2 rounded-full ${PLAY_TYPE_COLORS[playType]}`} />
                  <span className="font-medium">{PLAY_TYPE_LABELS[playType]}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
