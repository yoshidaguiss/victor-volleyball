import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type ViolationType =
  | "net_touch"
  | "double_contact"
  | "out_of_position"
  | "long_serve"
  | "passing"
  | "line_cross_serve"
  | "line_cross_back_attack"
  | "delay_in_service"
  | "four_hit"
  | "holding"
  | "other";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (violationType: ViolationType) => void;
}

const VIOLATIONS: { value: ViolationType; label: string; desc: string }[] = [
  { value: "net_touch",             label: "ネットタッチ",           desc: "ボールの扱いと関係なくネットに触れた" },
  { value: "double_contact",        label: "ダブルコンタクト",        desc: "同一選手が連続してボールに触れた（ドリブル）" },
  { value: "out_of_position",       label: "アウトオブポジション",    desc: "サーブ時にローテーション違反" },
  { value: "long_serve",            label: "ロングサーブ",            desc: "サーブがエンドラインを越えた" },
  { value: "passing",               label: "パッシング",              desc: "ボールが完全にネットを越えずに相手コートへ" },
  { value: "line_cross_serve",      label: "ラインクロス（サーブ）",  desc: "サーブ時にエンドラインを踏んだ" },
  { value: "line_cross_back_attack",label: "ラインクロス（バック）",  desc: "バックアタック時にアタックラインを踏んだ" },
  { value: "delay_in_service",      label: "ディレイインサービス",    desc: "8秒以内にサーブを打たなかった" },
  { value: "four_hit",              label: "フォアヒット",            desc: "チームが4回以上ボールに触れた" },
  { value: "holding",               label: "ホールディング",          desc: "ボールを持つ・投げる動作をした" },
  { value: "other",                 label: "その他反則",              desc: "上記以外の反則" },
];

export default function ViolationDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>反則の種類を選択</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 max-h-[70vh] overflow-y-auto pr-1">
          {VIOLATIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              className="flex items-start gap-3 text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
              onClick={() => {
                onConfirm(value);
                onClose();
              }}
            >
              <div className="shrink-0 w-2 h-2 rounded-full bg-rose-400 mt-1.5" />
              <div>
                <div className="font-semibold text-sm text-gray-900">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
