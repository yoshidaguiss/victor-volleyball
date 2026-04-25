import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Zap, MoveRight, MoveLeft } from "lucide-react";
import { predictNextPlay, type PredictionResult } from "@/lib/contextPredictor";
import type { Play, Player } from "@/lib/contextPredictor";

interface QuickPredictionInputProps {
  recentPlays: Play[];
  currentPlayers: Player[];
  currentTeamSide: "home" | "away";
  onAcceptPrediction: (prediction: PredictionResult) => void;
  onRejectPrediction: () => void;
}

const PLAY_TYPE_LABELS: Record<string, string> = {
  serve: "サーブ",
  receive: "レシーブ",
  set: "セット",
  attack: "アタック",
  block: "ブロック",
  dig: "ディグ",
};

export default function QuickPredictionInput({
  recentPlays,
  currentPlayers,
  currentTeamSide,
  onAcceptPrediction,
  onRejectPrediction,
}: QuickPredictionInputProps) {
  const prediction = predictNextPlay(recentPlays, currentPlayers, currentTeamSide);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) return;
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const offset = currentX - startXRef.current;
      setSwipeOffset(offset);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // 右スワイプ（承認）
      if (swipeOffset > 100 && prediction) {
        onAcceptPrediction(prediction);
      }
      // 左スワイプ（拒否）
      else if (swipeOffset < -100) {
        onRejectPrediction();
      }

      setSwipeOffset(0);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) return;
      setIsDragging(true);
      startXRef.current = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const offset = e.clientX - startXRef.current;
      setSwipeOffset(offset);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // 右スワイプ（承認）
      if (swipeOffset > 100 && prediction) {
        onAcceptPrediction(prediction);
      }
      // 左スワイプ（拒否）
      else if (swipeOffset < -100) {
        onRejectPrediction();
      }

      setSwipeOffset(0);
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, swipeOffset, prediction, onAcceptPrediction, onRejectPrediction]);

  if (!prediction) {
    return null;
  }

  const predictedPlayer = prediction.playerId
    ? currentPlayers.find(p => p.id === prediction.playerId)
    : null;

  const confidenceColor =
    prediction.confidence >= 0.8
      ? "bg-green-100 text-green-700 border-green-300"
      : prediction.confidence >= 0.6
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : "bg-orange-100 text-orange-700 border-orange-300";

  // スワイプ方向に応じた背景色
  const swipeBackgroundColor =
    swipeOffset > 50
      ? `rgba(34, 197, 94, ${Math.min(swipeOffset / 200, 0.3)})`
      : swipeOffset < -50
      ? `rgba(239, 68, 68, ${Math.min(Math.abs(swipeOffset) / 200, 0.3)})`
      : "transparent";

  return (
    <div className="relative">
      {/* 目立つアニメーション付きバッジ */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-bold shadow-lg animate-pulse">
          <Zap className="w-4 h-4 mr-1 inline" />
          {isDragging ? "スワイプして選択！" : "1タップで記録完了！"}
        </Badge>
      </div>

      {/* スワイプヒント */}
      {isDragging && (
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-20 flex justify-between px-4 pointer-events-none">
          <div
            className={`flex items-center gap-2 transition-opacity ${
              swipeOffset < -50 ? "opacity-100" : "opacity-30"
            }`}
          >
            <MoveLeft className="w-8 h-8 text-red-500" />
            <span className="text-red-500 font-bold">拒否</span>
          </div>
          <div
            className={`flex items-center gap-2 transition-opacity ${
              swipeOffset > 50 ? "opacity-100" : "opacity-30"
            }`}
          >
            <span className="text-green-500 font-bold">承認</span>
            <MoveRight className="w-8 h-8 text-green-500" />
          </div>
        </div>
      )}

      <div
        ref={cardRef}
        style={{
          transform: `translateX(${swipeOffset}px) rotate(${swipeOffset / 20}deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          backgroundColor: swipeBackgroundColor,
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="border-4 border-primary shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
          <CardContent className="p-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">AI予測</h3>
                  <p className="text-xs text-muted-foreground">次のプレーを自動予測</p>
                </div>
              </div>
              <Badge className={`${confidenceColor} border-2 px-3 py-1 font-bold text-sm`}>
                信頼度 {Math.round(prediction.confidence * 100)}%
              </Badge>
            </div>

            {/* 予測内容 - 大きく目立つ表示 */}
            <div className="bg-white rounded-xl p-6 shadow-inner mb-6 border-2 border-primary/20">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">次のプレー予測</p>
                  <div className="text-4xl font-black text-primary mb-2 tracking-tight">
                    {PLAY_TYPE_LABELS[prediction.playType]}
                  </div>
                </div>
                
                {predictedPlayer && (
                  <div className="pt-4 border-t-2 border-gray-200">
                    <p className="text-sm text-muted-foreground mb-2">予測選手</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                        {predictedPlayer.number}
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold">{predictedPlayer.name}</p>
                        <p className="text-sm text-muted-foreground">{predictedPlayer.position}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 大きなアクションボタン */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                onClick={() => onAcceptPrediction(prediction)}
              >
                <Check className="w-7 h-7 mr-3" />
                正解！1タップで記録
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 border-3 border-gray-400 hover:bg-gray-100 font-bold text-lg"
                onClick={onRejectPrediction}
              >
                <X className="w-6 h-6 mr-2" />
                違う（手動で選択）
              </Button>
            </div>

            {/* 説明テキスト */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-bold text-primary">右スワイプで承認</span> / <span className="font-bold text-red-500">左スワイプで拒否</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                またはボタンをタップして選択
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
