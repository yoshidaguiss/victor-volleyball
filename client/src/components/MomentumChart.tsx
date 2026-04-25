import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface MomentumDataPoint {
  point: number;
  homeScore: number;
  awayScore: number;
  momentum: number; // -100 to 100 (negative = away advantage, positive = home advantage)
}

interface MomentumChartProps {
  data: MomentumDataPoint[];
}

export function MomentumChart({ data }: MomentumChartProps) {
  const currentMomentum = data.length > 0 ? data[data.length - 1].momentum : 0;
  
  const getMomentumColor = (momentum: number) => {
    if (momentum > 30) return "text-green-500";
    if (momentum < -30) return "text-red-500";
    return "text-yellow-500";
  };

  const getMomentumLabel = (momentum: number) => {
    if (momentum > 50) return "ホーム圧倒";
    if (momentum > 30) return "ホーム優勢";
    if (momentum > 10) return "ホームやや優勢";
    if (momentum > -10) return "互角";
    if (momentum > -30) return "アウェイやや優勢";
    if (momentum > -50) return "アウェイ優勢";
    return "アウェイ圧倒";
  };

  return (
    <Card className="p-6 data-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">試合の流れ（モメンタム分析）</h3>
        </div>
        <div className={`flex items-center gap-2 ${getMomentumColor(currentMomentum)}`}>
          {currentMomentum > 10 ? (
            <TrendingUp className="w-5 h-5" />
          ) : currentMomentum < -10 ? (
            <TrendingDown className="w-5 h-5" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          <span className="font-semibold">{getMomentumLabel(currentMomentum)}</span>
        </div>
      </div>

      {/* モメンタムゲージ */}
      <div className="mb-6">
        <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
          {/* アウェイ側（左） */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
            style={{
              width: `${Math.max(0, -currentMomentum) / 2}%`,
            }}
          />
          {/* ホーム側（右） */}
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-green-500 to-green-400 transition-all duration-500"
            style={{
              width: `${Math.max(0, currentMomentum) / 2}%`,
            }}
          />
          {/* 中央線 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 transform -translate-x-1/2" />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>アウェイ優勢</span>
          <span>互角</span>
          <span>ホーム優勢</span>
        </div>
      </div>

      {/* モメンタム推移グラフ */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 265 / 0.3)" />
          <XAxis
            dataKey="point"
            stroke="oklch(0.65 0.01 265)"
            label={{ value: "ポイント", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            stroke="oklch(0.65 0.01 265)"
            domain={[-100, 100]}
            ticks={[-100, -50, 0, 50, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.16 0.02 265)",
              border: "1px solid oklch(0.25 0.02 265 / 0.3)",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [getMomentumLabel(value), "モメンタム"]}
          />
          <ReferenceLine y={0} stroke="oklch(0.65 0.01 265 / 0.5)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="momentum"
            stroke="oklch(0.7 0.25 265)"
            strokeWidth={3}
            dot={{ fill: "oklch(0.7 0.25 265)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 説明 */}
      <div className="mt-4 p-3 rounded-lg bg-muted/20">
        <p className="text-xs text-muted-foreground">
          💡 モメンタム: 連続得点、サーブエース、ブロックなどで変動します。試合の流れを把握し、タイムアウトのタイミングを判断できます。
        </p>
      </div>
    </Card>
  );
}
