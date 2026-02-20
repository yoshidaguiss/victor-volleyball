import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
}

interface RotationPosition {
  position: number; // 1-6 (1=右前, 2=右後, 3=中後, 4=左後, 5=左前, 6=中前)
  player: Player | null;
}

interface RotationManagerProps {
  players: Player[];
  onRotationChange?: (rotation: RotationPosition[]) => void;
}

export function RotationManager({ players, onRotationChange }: RotationManagerProps) {
  const [rotation, setRotation] = useState<RotationPosition[]>([
    { position: 1, player: null }, // 右前（セッター位置）
    { position: 2, player: null }, // 右後
    { position: 3, player: null }, // 中後
    { position: 4, player: null }, // 左後
    { position: 5, player: null }, // 左前
    { position: 6, player: null }, // 中前
  ]);

  const [isServing, setIsServing] = useState(true);

  useEffect(() => {
    // 初期ローテーション設定（最初の6人を配置）
    if (players.length >= 6) {
      const initialRotation = rotation.map((pos, index) => ({
        ...pos,
        player: players[index] || null,
      }));
      setRotation(initialRotation);
    }
  }, [players]);

  const handleRotate = () => {
    // 時計回りにローテーション（position 1 → 6 → 5 → 4 → 3 → 2 → 1）
    const newRotation = rotation.map((pos) => {
      const newPosition = pos.position === 1 ? 6 : pos.position - 1;
      return { ...pos, position: newPosition };
    });
    
    // position順にソート
    newRotation.sort((a, b) => a.position - b.position);
    
    setRotation(newRotation);
    onRotationChange?.(newRotation);
  };

  const getPositionCoordinates = (position: number): { x: number; y: number } => {
    // コート上の位置座標（%）
    const positions: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 25 },  // 右前
      2: { x: 75, y: 75 },  // 右後
      3: { x: 50, y: 75 },  // 中後
      4: { x: 25, y: 75 },  // 左後
      5: { x: 25, y: 25 },  // 左前
      6: { x: 50, y: 25 },  // 中前
    };
    return positions[position] || { x: 50, y: 50 };
  };

  const getPositionLabel = (position: number): string => {
    const labels: Record<number, string> = {
      1: "右前",
      2: "右後",
      3: "中後",
      4: "左後",
      5: "左前",
      6: "中前",
    };
    return labels[position] || "";
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">ローテーション管理</h3>
        </div>
        <Button
          onClick={handleRotate}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          ローテーション
        </Button>
      </div>

      {/* コート表示 */}
      <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg border-2 border-green-700/30 overflow-hidden">
        {/* ネット */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/40 transform -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 transform -translate-x-1/2" />

        {/* 選手配置 */}
        {rotation.map((pos) => {
          const coords = getPositionCoordinates(pos.position);
          const isServingPosition = pos.position === 1 && isServing;

          return (
            <div
              key={pos.position}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
            >
              {pos.player ? (
                <div className={`flex flex-col items-center gap-1 ${isServingPosition ? 'animate-pulse-glow' : ''}`}>
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-lg
                      ${isServingPosition 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white neon-glow' 
                        : 'bg-primary text-primary-foreground'
                      }
                      shadow-lg
                    `}
                  >
                    {pos.player.number}
                  </div>
                  <div className="text-xs font-medium text-center bg-background/80 px-2 py-0.5 rounded">
                    {pos.player.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {getPositionLabel(pos.position)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">{pos.position}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {getPositionLabel(pos.position)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* サーブ表示 */}
        {isServing && (
          <div className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full text-xs font-semibold text-yellow-300">
            サーブ権
          </div>
        )}
      </div>

      {/* ローテーション順序表示 */}
      <div className="mt-4 grid grid-cols-6 gap-2">
        {rotation.map((pos) => (
          <div
            key={pos.position}
            className="text-center p-2 rounded bg-muted/30"
          >
            <div className="text-xs text-muted-foreground mb-1">
              P{pos.position}
            </div>
            <div className="font-semibold text-sm">
              {pos.player ? `#${pos.player.number}` : "-"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
