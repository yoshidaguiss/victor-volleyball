import { useMemo } from "react";

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  result?: "point" | "continue" | "error";
}

interface HeatmapProps {
  data: HeatmapPoint[];
  width?: number;
  height?: number;
  radius?: number;
  intensity?: number;
}

export default function Heatmap({ data, width = 400, height = 600, radius = 40, intensity = 0.6 }: HeatmapProps) {
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return null;

    // 背景を描画
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    // コートラインを描画
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    
    // 外枠
    ctx.strokeRect(0, 0, width, height);
    
    // センターライン
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // グリッド線
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo((width / 3) * i, 0);
      ctx.lineTo((width / 3) * i, height);
      ctx.stroke();
    }
    
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (height / 6) * i);
      ctx.lineTo(width, (height / 6) * i);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // ヒートマップポイントを描画
    data.forEach((point) => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;

      // 結果に基づいて色を決定
      let color: string;
      if (point.result === "point") {
        color = "#10b981"; // 緑（成功）
      } else if (point.result === "error") {
        color = "#ef4444"; // 赤（失敗）
      } else {
        color = "#3b82f6"; // 青（継続）
      }

      // グラデーション円を描画
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      // ポイントマーカーを描画
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    return canvas;
  }, [data, width, height, radius, intensity]);

  if (!canvas) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">ヒートマップを読み込み中...</div>;
  }

  return (
    <div className="relative w-full">
      <img
        src={canvas.toDataURL()}
        alt="Heatmap"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
}
