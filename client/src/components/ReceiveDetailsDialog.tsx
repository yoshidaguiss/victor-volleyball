import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReceiveDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: {
    receiveGrade: string;
    receiveCourse: string;
    setterAccuracy: string;
  }) => void;
}

export default function ReceiveDetailsDialog({
  open,
  onClose,
  onConfirm,
}: ReceiveDetailsDialogProps) {
  const [receiveGrade, setReceiveGrade] = useState<string>("");
  const [receiveCourse, setReceiveCourse] = useState<string>("");
  const [setterAccuracy, setSetterAccuracy] = useState<string>("");

  const handleConfirm = () => {
    if (!receiveGrade || !receiveCourse || !setterAccuracy) {
      return;
    }
    onConfirm({ receiveGrade, receiveCourse, setterAccuracy });
    // リセット
    setReceiveGrade("");
    setReceiveCourse("");
    setSetterAccuracy("");
  };

  const handleSkip = () => {
    onConfirm({ receiveGrade: "不明", receiveCourse: "不明", setterAccuracy: "不明" });
    // リセット
    setReceiveGrade("");
    setReceiveCourse("");
    setSetterAccuracy("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">レシーブ詳細入力</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* レシーブ評価選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">レシーブ評価</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={receiveGrade === "A" ? "default" : "outline"}
                className="h-20 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={() => setReceiveGrade("A")}
              >
                A
                <div className="text-xs font-normal mt-1">完璧</div>
              </Button>
              <Button
                variant={receiveGrade === "B" ? "default" : "outline"}
                className="h-20 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => setReceiveGrade("B")}
              >
                B
                <div className="text-xs font-normal mt-1">良好</div>
              </Button>
              <Button
                variant={receiveGrade === "C" ? "default" : "outline"}
                className="h-20 text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                onClick={() => setReceiveGrade("C")}
              >
                C
                <div className="text-xs font-normal mt-1">返球のみ</div>
              </Button>
            </div>
          </div>

          {/* レシーブコース選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">レシーブコース</h3>
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant={receiveCourse === "前" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setReceiveCourse("前")}
              >
                ⬆️ 前
              </Button>
              <Button
                variant={receiveCourse === "後ろ" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setReceiveCourse("後ろ")}
              >
                ⬇️ 後ろ
              </Button>
              <Button
                variant={receiveCourse === "左" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setReceiveCourse("左")}
              >
                ⬅️ 左
              </Button>
              <Button
                variant={receiveCourse === "右" ? "default" : "outline"}
                className="h-16 text-base"
                onClick={() => setReceiveCourse("右")}
              >
                ➡️ 右
              </Button>
            </div>
          </div>

          {/* セッターへの返球精度選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">セッターへの返球精度</h3>
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant={setterAccuracy === "完璧" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={() => setSetterAccuracy("完璧")}
              >
                ⭐ 完璧
              </Button>
              <Button
                variant={setterAccuracy === "良好" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => setSetterAccuracy("良好")}
              >
                👍 良好
              </Button>
              <Button
                variant={setterAccuracy === "普通" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                onClick={() => setSetterAccuracy("普通")}
              >
                👌 普通
              </Button>
              <Button
                variant={setterAccuracy === "悪い" ? "default" : "outline"}
                className="h-16 text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                onClick={() => setSetterAccuracy("悪い")}
              >
                ❌ 悪い
              </Button>
            </div>
          </div>

          {/* プレビュー */}
          {receiveGrade && receiveCourse && setterAccuracy && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">プレビュー</p>
              <p className="text-base font-semibold">
                評価{receiveGrade} / {receiveCourse} / 返球精度: {setterAccuracy}
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
            disabled={!receiveGrade || !receiveCourse || !setterAccuracy}
          >
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
