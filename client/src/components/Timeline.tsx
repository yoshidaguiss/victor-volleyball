import { Card } from "@/components/ui/card";
import { Clock, Target, Shield, Zap, AlertCircle } from "lucide-react";

interface TimelineEvent {
  id: number;
  timestamp: Date;
  type: "serve" | "attack" | "block" | "dig" | "error";
  player: string;
  team: "home" | "away";
  result: "point" | "error" | "continue";
  description: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "serve":
        return <Target className="w-4 h-4" />;
      case "attack":
        return <Zap className="w-4 h-4" />;
      case "block":
        return <Shield className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (team: string, result: string) => {
    if (result === "error") return "bg-red-500/20 border-red-500/50 text-red-300";
    if (result === "point") {
      return team === "home"
        ? "bg-green-500/20 border-green-500/50 text-green-300"
        : "bg-blue-500/20 border-blue-500/50 text-blue-300";
    }
    return "bg-muted/20 border-muted/50 text-muted-foreground";
  };

  return (
    <Card className="p-6 data-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">プレータイムライン</h3>
      </div>

      <div className="relative">
        {/* タイムライン線 */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        {/* イベントリスト */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* アイコン */}
              <div
                className={`
                  relative z-10 flex items-center justify-center
                  w-12 h-12 rounded-full border-2
                  ${getEventColor(event.team, event.result)}
                `}
              >
                {getEventIcon(event.type)}
              </div>

              {/* イベント詳細 */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    {event.team === "home" ? "ホーム" : "アウェイ"} - {event.player}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event.result === "point" && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded">
                    得点
                  </span>
                )}
                {event.result === "error" && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-300 rounded">
                    エラー
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            プレーデータがありません
          </div>
        )}
      </div>
    </Card>
  );
}
