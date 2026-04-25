import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServeDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: {
    serveType: string;
    serveCourse: string;
    serveEffect: string;
  }) => void;
}

export default function ServeDetailsDialog({
  open,
  onClose,
  onConfirm,
}: ServeDetailsDialogProps) {
  const [serveType, setServeType] = useState<string>("");
  const [serveCourse, setServeCourse] = useState<string>("");
  const [serveEffect, setServeEffect] = useState<string>("");

  const handleConfirm = () => {
    if (!serveType || !serveCourse || !serveEffect) {
      return;
    }
    onConfirm({ serveType, serveCourse, serveEffect });
    // リセット
    setServeType("");
    setServeCourse("");
    setServeEffect("");
  };

  const handleSkip = () => {
    onConfirm({ serveType: "不明", serveCourse: "不明", serveEffect: "不明" });
    // リセット
    setServeType("");
    setServeCourse("");
    setServeEffect("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">サーブ詳細入力</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* サーブタイプ選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">サーブタイプ</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={serveType === "ジャンプサーブ" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeType("ジャンプサーブ")}
              >
                🏐 ジャンプサーブ
              </Button>
              <Button
                variant={serveType === "フローター" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeType("フローター")}
              >
                🌊 フローター
              </Button>
              <Button
                variant={serveType === "サイドハンド" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeType("サイドハンド")}
              >
                👋 サイドハンド
              </Button>
            </div>
          </div>

          {/* サーブコース選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">サーブコース</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={serveCourse === "ストレート" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeCourse("ストレート")}
              >
                ↑ ストレート
              </Button>
              <Button
                variant={serveCourse === "クロス" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeCourse("クロス")}
              >
                ↗️ クロス
              </Button>
              <Button
                variant={serveCourse === "センター" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setServeCourse("センター")}
              >
                ⬆️ センター
              </Button>
            </div>
          </div>

          {/* サーブ効果選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">サーブ効果</h3>
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant={serveEffect === "エース" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={() => setServeEffect("エース")}
              >
                ⭐ エース
              </Button>
              <Button
                variant={serveEffect === "ミス誘発" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => setServeEffect("ミス誘発")}
              >
                💪 ミス誘発
              </Button>
              <Button
                variant={serveEffect === "普通" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                onClick={() => setServeEffect("普通")}
              >
                👌 普通
              </Button>
              <Button
                variant={serveEffect === "ミス" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                onClick={() => setServeEffect("ミス")}
              >
                ❌ ミス
              </Button>
            </div>
          </div>

          {/* プレビュー */}
          {serveType && serveCourse && serveEffect && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">プレビュー</p>
              <p className="text-base font-semibold">
                {serveType} / {serveCourse} / {serveEffect}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSkip}>
            スキップ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!serveType || !serveCourse || !serveEffect}
          >
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
