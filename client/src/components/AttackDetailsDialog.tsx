import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AttackPosition = "1" | "2" | "3" | "4" | "5";
type AttackType = "open" | "quickA" | "quickB" | "quickC" | "quickD" | "back" | "pipe" | "slide" | "parallel";
type AttackCourse = "straight" | "cross";
type AttackResult = "kill" | "blocked" | "dug" | "error" | "out";

interface AttackDetails {
  attackPosition: AttackPosition;
  attackType: AttackType;
  attackCourse: AttackCourse;
  blockCount: number;
  attackResult: AttackResult;
  landingX: number;
  landingY: number;
}

interface AttackDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (details: AttackDetails) => void;
  playerNumber: number;
  initialResult: AttackResult; // 結果は既に決まっている（2タップ目で選択済み）
}

export default function AttackDetailsDialog({
  open,
  onOpenChange,
  onConfirm,
  playerNumber,
  initialResult,
}: AttackDetailsDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [attackPosition, setAttackPosition] = useState<AttackPosition>("1");
  const [attackType, setAttackType] = useState<AttackType>("open");
  const [attackCourse, setAttackCourse] = useState<AttackCourse>("cross");
  const [blockCount, setBlockCount] = useState<number>(0);
  const [landingX, setLandingX] = useState<number>(0);
  const [landingY, setLandingY] = useState<number>(0);

  const handleConfirm = () => {
    onConfirm({
      attackPosition,
      attackType,
      attackCourse,
      blockCount,
      attackResult: initialResult, // 結果は既に決まっている
      landingX,
      landingY,
    });
    onOpenChange(false);
    // リセット
    setStep(1);
    setAttackPosition("1");
    setAttackType("open");
    setAttackCourse("cross");
    setBlockCount(0);
    setLandingX(0);
    setLandingY(0);
  };

  // スキップボタン（詳細を記録せずに進む）
  const handleSkip = () => {
    onConfirm({
      attackPosition: "1", // デフォルト値
      attackType: "open",
      attackCourse: "cross",
      blockCount: 0,
      attackResult: initialResult,
      landingX: 0,
      landingY: 0,
    });
    onOpenChange(false);
    // リセット
    setStep(1);
    setAttackPosition("1");
    setAttackType("open");
    setAttackCourse("cross");
    setBlockCount(0);
    setLandingX(0);
    setLandingY(0);
  };

  // コート図クリックハンドラー
  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // コート図のサイズ（ピクセル）
    const courtWidth = rect.width;
    const courtHeight = rect.height;
    
    // 実際のコートサイズ（メートル）: 9m × 6m
    const realCourtWidth = 9;
    const realCourtHeight = 6;
    
    // ピクセル座標を実座標に変換（メートル単位）
    const realX = (x / courtWidth) * realCourtWidth;
    const realY = (y / courtHeight) * realCourtHeight;
    
    setLandingX(Math.round(realX * 100) / 100); // 小数点2桁
    setLandingY(Math.round(realY * 100) / 100);
  };

  const attackPositions: Array<{ value: AttackPosition; label: string; description: string }> = [
    { value: "1", label: "1番", description: "レフト（前衛左）" },
    { value: "2", label: "2番", description: "レフト寄りセンター" },
    { value: "3", label: "3番", description: "センター" },
    { value: "4", label: "4番", description: "ライト寄りセンター" },
    { value: "5", label: "5番", description: "ライト（前衛右）" },
  ];

  const attackTypes: Array<{ value: AttackType; label: string; description: string }> = [
    { value: "open", label: "オープン", description: "レフト/ライトからの通常攻撃" },
    { value: "parallel", label: "並行", description: "セッターと並行に打つ速攻" },
    { value: "quickA", label: "クイックA", description: "セッターの前" },
    { value: "quickB", label: "クイックB", description: "セッターの後ろ" },
    { value: "quickC", label: "クイックC", description: "レフト寄り" },
    { value: "quickD", label: "クイックD", description: "ライト寄り" },
    { value: "back", label: "バックアタック", description: "後衛からの攻撃" },
    { value: "pipe", label: "パイプ", description: "センター後衛" },
    { value: "slide", label: "スライド", description: "移動しながらの速攻" },
  ];

  const attackCourses: Array<{ value: AttackCourse; label: string }> = [
    { value: "straight", label: "ストレート" },
    { value: "cross", label: "クロス" },
  ];

  const resultLabel = {
    kill: "決まった",
    blocked: "ブロックされた",
    dug: "拾われた",
    error: "エラー",
    out: "アウト",
  }[initialResult];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">攻撃詳細入力（3タップ目）</DialogTitle>
          <DialogDescription>
            #{playerNumber} のアタック（{resultLabel}）の詳細を入力してください
          </DialogDescription>
        </DialogHeader>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-blue-500" : s < step ? "w-2 bg-blue-300" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="space-y-6 py-4">
          {/* ステップ1: 攻撃位置 */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">1. 攻撃位置（レフトからライトまで）</h3>
              <div className="grid grid-cols-5 gap-2">
                {attackPositions.map(({ value, label, description }) => (
                  <button
                    key={value}
                    className={`
                      h-24 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                      ${attackPosition === value 
                        ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-lg" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      setAttackPosition(value);
                      setStep(2);
                    }}
                  >
                    <span className="font-bold text-xl">{label}</span>
                    <span className={`text-xs text-center px-1 ${attackPosition === value ? "text-blue-100" : "text-gray-500"}`}>
                      {description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleSkip}
                >
                  スキップ（詳細なし）
                </Button>
              </div>
            </div>
          )}

          {/* ステップ2: 攻撃タイプ */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">2. 攻撃タイプ</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {attackTypes.map(({ value, label, description }) => (
                  <button
                    key={value}
                    className={`
                      h-20 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                      ${attackType === value 
                        ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-lg" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      setAttackType(value);
                      setStep(3);
                    }}
                  >
                    <span className="font-bold text-base">{label}</span>
                    <span className={`text-xs ${attackType === value ? "text-blue-100" : "text-gray-500"}`}>
                      {description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                >
                  ← 戻る
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleSkip}
                >
                  スキップ（詳細なし）
                </Button>
              </div>
            </div>
          )}

          {/* ステップ3: 攻撃コース */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">3. 攻撃コース</h3>
              <div className="grid grid-cols-2 gap-3">
                {attackCourses.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`
                      h-16 rounded-xl border-2 transition-all duration-200 font-semibold text-lg
                      ${attackCourse === value 
                        ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-lg" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      setAttackCourse(value);
                      setStep(4);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(2)}
                >
                  ← 戻る
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleSkip}
                >
                  スキップ（詳細なし）
                </Button>
              </div>
            </div>
          )}

          {/* ステップ4: ブロック枚数 */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">4. ブロック枚数</h3>
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((count) => (
                  <button
                    key={count}
                    className={`
                      h-16 rounded-xl border-2 transition-all duration-200 font-bold text-xl
                      ${blockCount === count 
                        ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-lg" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      setBlockCount(count);
                      setStep(5);
                    }}
                  >
                    {count}枚
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(3)}
                >
                  ← 戻る
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleSkip}
                >
                  スキップ（詳細なし）
                </Button>
              </div>
            </div>
          )}

          {/* ステップ5: 着弾点選択 */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">5. ボール着弾点</h3>
              <p className="text-sm text-gray-600 mb-3">コート図をタップして着弾点を選択してください</p>
              
              {/* コート図 */}
              <div className="relative">
                <div
                  className="relative w-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg border-4 border-gray-800 cursor-crosshair"
                  style={{ aspectRatio: "3/2" }} // 9m×6mの比率
                  onClick={handleCourtClick}
                >
                  {/* ネット */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-800 -translate-x-1/2" />
                  
                  {/* アタックライン（3mライン） */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-600 opacity-50" />
                  <div className="absolute top-0 bottom-0 right-1/3 w-0.5 bg-gray-600 opacity-50" />
                  
                  {/* 着弾点マーカー */}
                  {landingX > 0 && landingY > 0 && (
                    <div
                      className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${(landingX / 9) * 100}%`,
                        top: `${(landingY / 6) * 100}%`,
                      }}
                    />
                  )}
                  
                  {/* ラベル */}
                  <div className="absolute top-2 left-2 text-xs font-bold text-gray-700 bg-white/70 px-2 py-1 rounded">
                    相手コート
                  </div>
                  <div className="absolute top-2 right-2 text-xs font-bold text-gray-700 bg-white/70 px-2 py-1 rounded">
                    自コート
                  </div>
                </div>
                
                {/* 座標表示 */}
                {landingX > 0 && landingY > 0 && (
                  <div className="mt-2 text-center text-sm text-gray-600">
                    選択位置: X={landingX}m, Y={landingY}m
                  </div>
                )}
              </div>

              {/* 確認ボタン */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-base"
                  onClick={() => setStep(4)}
                >
                  ← 戻る
                </Button>
                <Button
                  className="flex-1 h-14 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  onClick={handleConfirm}
                  disabled={landingX === 0 || landingY === 0}
                >
                  記録する
                </Button>
              </div>

              {/* プレビュー */}
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">入力内容プレビュー：</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500">
                    {attackPositions.find((p) => p.value === attackPosition)?.label}
                  </Badge>
                  <Badge className="bg-blue-500">
                    {attackTypes.find((t) => t.value === attackType)?.label}
                  </Badge>
                  <Badge className="bg-blue-500">
                    {attackCourses.find((c) => c.value === attackCourse)?.label}
                  </Badge>
                  <Badge className="bg-blue-500">{blockCount}枚ブロック</Badge>
                  <Badge className="bg-blue-500">
                    着弾点: ({landingX}m, {landingY}m)
                  </Badge>
                  <Badge className="bg-blue-500">{resultLabel}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
