import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, TrendingDown, Zap, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface InputSpeedStatsProps {
  playCount: number;
}

interface SpeedRecord {
  timestamp: number;
  duration: number; // ミリ秒
}

const STORAGE_KEY = "victor_input_speed_records";
const MAX_RECORDS = 100;

export default function InputSpeedStats({ playCount }: InputSpeedStatsProps) {
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [fastestSpeed, setFastestSpeed] = useState<number>(0);
  const [recentSpeed, setRecentSpeed] = useState<number>(0);
  const [lastRecordTime, setLastRecordTime] = useState<number>(Date.now());

  useEffect(() => {
    // プレー数が増えたら記録時間を計算
    if (playCount > 0) {
      const now = Date.now();
      const duration = now - lastRecordTime;

      // 最初のプレーはスキップ（基準時刻がないため）
      if (playCount > 1 && duration < 60000) {
        // 60秒以内の記録のみ有効
        recordInputSpeed(duration);
        updateStats();
      }

      setLastRecordTime(now);
    }
  }, [playCount]);

  useEffect(() => {
    updateStats();
  }, []);

  const recordInputSpeed = (duration: number) => {
    const records = getSpeedRecords();
    records.push({
      timestamp: Date.now(),
      duration,
    });

    // 最新100件のみ保持
    if (records.length > MAX_RECORDS) {
      records.shift();
    }

    saveSpeedRecords(records);
  };

  const updateStats = () => {
    const records = getSpeedRecords();

    if (records.length === 0) {
      return;
    }

    // 平均速度を計算
    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / records.length;
    setAverageSpeed(avgDuration / 1000); // 秒に変換

    // 最速記録を計算
    const fastestDuration = Math.min(...records.map(r => r.duration));
    setFastestSpeed(fastestDuration / 1000);

    // 最近5件の平均速度を計算
    const recentRecords = records.slice(-5);
    const recentTotalDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0);
    const recentAvgDuration = recentTotalDuration / recentRecords.length;
    setRecentSpeed(recentAvgDuration / 1000);
  };

  const getSpeedRecords = (): SpeedRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const saveSpeedRecords = (records: SpeedRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  };

  const getSpeedRating = (speed: number): { label: string; color: string } => {
    if (speed < 2) {
      return { label: "超高速", color: "bg-gradient-to-r from-purple-500 to-pink-500" };
    } else if (speed < 3) {
      return { label: "高速", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
    } else if (speed < 5) {
      return { label: "標準", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
    } else {
      return { label: "改善の余地あり", color: "bg-gradient-to-r from-orange-500 to-yellow-500" };
    }
  };

  const rating = getSpeedRating(averageSpeed);

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          入力速度統計
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 平均記録時間 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">平均記録時間</span>
            <Badge className={`${rating.color} text-white font-bold`}>{rating.label}</Badge>
          </div>
          <div className="text-4xl font-black text-primary">
            {averageSpeed > 0 ? averageSpeed.toFixed(1) : "--"}
            <span className="text-lg ml-1">秒/プレー</span>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 最速記録 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">最速記録</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {fastestSpeed > 0 ? fastestSpeed.toFixed(1) : "--"}
              <span className="text-sm ml-1">秒</span>
            </div>
          </div>

          {/* 最近の速度 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">最近5件</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {recentSpeed > 0 ? recentSpeed.toFixed(1) : "--"}
              <span className="text-sm ml-1">秒</span>
            </div>
          </div>
        </div>

        {/* パフォーマンスメッセージ */}
        {averageSpeed > 0 && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-purple-900">
                {averageSpeed < 2
                  ? "🎉 驚異的な速度です！プロレベルの入力効率を達成しています。"
                  : averageSpeed < 3
                  ? "✨ 素晴らしい！非常に高速な入力を維持しています。"
                  : averageSpeed < 5
                  ? "👍 良いペースです。予測入力を活用してさらに高速化できます。"
                  : "💡 予測入力機能を活用すると、記録時間を大幅に短縮できます！"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
