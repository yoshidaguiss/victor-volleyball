import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  id: number;
  number: number;
  name: string;
  position: string | number;
}

interface RotationDisplayProps {
  players: Player[];
  currentServer?: number; // 現在のサーバーの選手ID
}

export default function RotationDisplay({ players, currentServer }: RotationDisplayProps) {
  // コート上の6つのポジション（時計回り）
  // 1: 右後ろ（サーブ位置）
  // 2: 右前
  // 3: 中央前
  // 4: 左前
  // 5: 左後ろ
  // 6: 中央後ろ
  
  const positions = [
    { id: 1, label: "P1", x: "75%", y: "75%", name: "右後" },
    { id: 2, label: "P2", x: "75%", y: "25%", name: "右前" },
    { id: 3, label: "P3", x: "50%", y: "25%", name: "中前" },
    { id: 4, label: "P4", x: "25%", y: "25%", name: "左前" },
    { id: 5, label: "P5", x: "25%", y: "75%", name: "左後" },
    { id: 6, label: "P6", x: "50%", y: "75%", name: "中後" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">現在のローテーション</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border-2 border-green-300 dark:border-green-700">
          {/* ネット */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black opacity-30" />
          
          {/* アタックライン */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white opacity-50" />
          
          {/* センターライン */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white opacity-30" />
          
          {/* 選手配置 */}
          {positions.map((pos, index) => {
            const player = players[index];
            const isServer = player && currentServer === player.id;
            
            return (
              <div
                key={pos.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: pos.x, top: pos.y }}
              >
                {player ? (
                  <div className={`flex flex-col items-center ${isServer ? "animate-pulse" : ""}`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                        isServer
                          ? "bg-yellow-400 text-yellow-900 ring-4 ring-yellow-300"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {player.number}
                    </div>
                    <div className="mt-1 text-xs font-medium text-center bg-white/90 dark:bg-gray-800/90 px-2 py-0.5 rounded shadow">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {pos.name}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs text-gray-400">{pos.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{pos.name}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {currentServer && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              現在のサーバー
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
