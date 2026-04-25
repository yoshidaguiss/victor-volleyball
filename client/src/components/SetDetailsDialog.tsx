import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SetDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: {
    setType: string;
    setPosition: string;
    setQuality: string;
  }) => void;
}

export default function SetDetailsDialog({
  open,
  onClose,
  onConfirm,
}: SetDetailsDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [setType, setSetType] = useState<string | null>(null);
  const [setPosition, setSetPosition] = useState<string | null>(null);
  const [setQuality, setSetQuality] = useState<string | null>(null);

  const handleReset = () => {
    setStep(1);
    setSetType(null);
    setSetPosition(null);
    setSetQuality(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = () => {
    if (setType && setPosition && setQuality) {
      onConfirm({
        setType,
        setPosition,
        setQuality,
      });
      handleClose();
    }
  };

  const setTypes = [
    { value: "open", label: "オープン", description: "高いトス", color: "bg-blue-500" },
    { value: "quick", label: "クイック", description: "速攻", color: "bg-red-500" },
    { value: "back", label: "バック", description: "後ろへのトス", color: "bg-purple-500" },
    { value: "a_quick", label: "Aクイック", description: "レフト速攻", color: "bg-orange-500" },
    { value: "b_quick", label: "Bクイック", description: "センター速攻", color: "bg-yellow-500" },
    { value: "c_quick", label: "Cクイック", description: "ライト速攻", color: "bg-green-500" },
  ];

  const positions = [
    { value: "1", label: "1番", description: "レフト" },
    { value: "2", label: "2番", description: "レフト寄り" },
    { value: "3", label: "3番", description: "センター" },
    { value: "4", label: "4番", description: "ライト寄り" },
    { value: "5", label: "5番", description: "ライト" },
  ];

  const qualities = [
    { value: "A", label: "A", description: "完璧", color: "bg-green-500" },
    { value: "B", label: "B", description: "良好", color: "bg-yellow-500" },
    { value: "C", label: "C", description: "普通", color: "bg-orange-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>セット詳細入力</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
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

          {/* ステップ1: セット種類選択 */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">セット種類を選択</h3>
              <div className="grid grid-cols-3 gap-3">
                {setTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={setType === type.value ? "default" : "outline"}
                    className="h-24 flex-col gap-2"
                    onClick={() => {
                      setSetType(type.value);
                      setStep(2);
                    }}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                      {type.label.charAt(0)}
                    </div>
                    <span className="font-semibold">{type.label}</span>
                    <span className="text-xs text-gray-600">{type.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ステップ2: セット位置選択 */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">セット位置を選択</h3>
              <div className="grid grid-cols-5 gap-3">
                {positions.map((pos) => (
                  <Button
                    key={pos.value}
                    variant={setPosition === pos.value ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setSetPosition(pos.value);
                      setStep(3);
                    }}
                  >
                    <Badge className="text-lg">{pos.label}</Badge>
                    <span className="text-xs text-gray-600">{pos.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ステップ3: セット精度選択 */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">セット精度を選択</h3>
              <div className="grid grid-cols-3 gap-3">
                {qualities.map((quality) => (
                  <Button
                    key={quality.value}
                    variant={setQuality === quality.value ? "default" : "outline"}
                    className="h-24 flex-col gap-2"
                    onClick={() => setSetQuality(quality.value)}
                  >
                    <div className={`w-16 h-16 ${quality.color} rounded-full flex items-center justify-center text-white text-3xl font-bold`}>
                      {quality.label}
                    </div>
                    <span className="font-semibold">{quality.description}</span>
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
                  setStep((step - 1) as 1 | 2 | 3);
                  if (step === 2) setSetPosition(null);
                  if (step === 3) setSetQuality(null);
                }}
              >
                戻る
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={!setType || !setPosition || !setQuality}
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
