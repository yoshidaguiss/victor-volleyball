import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BlockDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: {
    blockType: string;
    blockPosition: string;
  }) => void;
}

export default function BlockDetailsDialog({
  open,
  onClose,
  onConfirm,
}: BlockDetailsDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [blockType, setBlockType] = useState<string | null>(null);
  const [blockPosition, setBlockPosition] = useState<string | null>(null);

  const handleReset = () => {
    setStep(1);
    setBlockType(null);
    setBlockPosition(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = () => {
    if (blockType === "miss") {
      onConfirm({ blockType, blockPosition: "none" });
      handleClose();
      return;
    }
    if (blockType && blockPosition) {
      onConfirm({ blockType, blockPosition });
      handleClose();
    }
  };

  const blockTypes = [
    { value: "shutout", label: "シャットアウト", description: "完全にブロック", color: "bg-green-500", skipPosition: false },
    { value: "one_touch", label: "ワンタッチ", description: "ボールに触れた", color: "bg-blue-500", skipPosition: false },
    { value: "two_touch", label: "ツータッチ", description: "2人でブロック", color: "bg-purple-500", skipPosition: false },
    { value: "miss", label: "ブロックミス", description: "ブロックに失敗", color: "bg-rose-500", skipPosition: true },
  ];

  const positions = [
    { value: "1", label: "1番", description: "レフト" },
    { value: "2", label: "2番", description: "レフト寄り" },
    { value: "3", label: "3番", description: "センター" },
    { value: "4", label: "4番", description: "ライト寄り" },
    { value: "5", label: "5番", description: "ライト" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>ブロック詳細入力</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2].filter(s => !(blockType === "miss" && s === 2)).map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === s
                    ? "bg-blue-500 text-white"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* ステップ1: ブロックタイプ選択 */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">ブロックタイプを選択</h3>
              <div className="grid grid-cols-2 gap-3">
                {blockTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={blockType === type.value ? "default" : "outline"}
                    className="h-24 flex-col gap-2"
                    onClick={() => {
                      setBlockType(type.value);
                      if (type.skipPosition) {
                        handleClose();
                        onConfirm({ blockType: type.value, blockPosition: "none" });
                      } else {
                        setStep(2);
                      }
                    }}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                      {type.value === "shutout" ? "🛡️" : type.value === "one_touch" ? "👆" : type.value === "two_touch" ? "✌️" : "❌"}
                    </div>
                    <span className="font-semibold">{type.label}</span>
                    <span className="text-xs text-gray-600">{type.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ステップ2: ブロック位置選択 */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">ブロック位置を選択</h3>
              <div className="grid grid-cols-5 gap-3">
                {positions.map((pos) => (
                  <Button
                    key={pos.value}
                    variant={blockPosition === pos.value ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => setBlockPosition(pos.value)}
                  >
                    <Badge className="text-lg">{pos.label}</Badge>
                    <span className="text-xs text-gray-600">{pos.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep((step - 1) as 1 | 2);
                  if (step === 2) setBlockPosition(null);
                }}
              >
                戻る
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={!blockType || !blockPosition}
              onClick={handleConfirm}
            >
              確定
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
