import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  { value: "net_touch",              label: "ネットタッチ",            desc: "ボールと関係なくネットに触れた" },
  { value: "double_contact",         label: "ダブルコンタクト",         desc: "同一選手が連続してボールに触れた（ドリブル）" },
  { value: "out_of_position",        label: "アウトオブポジション",     desc: "サーブ時のローテーション違反" },
  { value: "long_serve",             label: "ロングサーブ",             desc: "サーブがエンドラインを越えた" },
  { value: "passing",                label: "パッシング",               desc: "ボールが完全にネットを越えずに相手コートへ" },
  { value: "line_cross_serve",       label: "ラインクロス（サーブ）",   desc: "サーブ時にエンドラインを踏んだ" },
  { value: "line_cross_back_attack", label: "ラインクロス（バック）",   desc: "バックアタック時にアタックラインを踏んだ" },
  { value: "delay_in_service",       label: "ディレイインサービス",     desc: "8秒以内にサーブを打たなかった" },
  { value: "four_hit",               label: "フォアヒット",             desc: "チームが4回以上ボールに触れた" },
  { value: "holding",                label: "ホールディング",           desc: "ボールを持つ・投げる動作をした" },
  { value: "other",                  label: "その他反則",               desc: "上記以外の反則" },
];

export default function ViolationDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-base font-bold">反則の種類を選択</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            該当する反則をタップしてください。相手チームに1点が加算されます。
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VIOLATIONS.map(({ value, label, desc }) => (
              <button
                key={value}
                className="flex items-start gap-3 text-left px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-rose-300 hover:bg-rose-50 active:scale-[0.98] transition-all"
                onClick={() => {
                  onConfirm(value);
                  onClose();
                }}
              >
                <div className="shrink-0 w-2 h-2 rounded-full bg-rose-400 mt-[5px]" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900 leading-snug">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
