import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
}

interface ShortcutHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutHelp({ open, onOpenChange }: ShortcutHelpProps) {
  const shortcuts: Shortcut[] = [
    { key: "1-9", description: "選手を番号で選択" },
    { key: "Space", description: "プレーを記録" },
    { key: "↑↓", description: "プレー種別を選択" },
    { key: "←→", description: "チームを切り替え" },
    { key: "Ctrl+Z", description: "元に戻す" },
    { key: "Ctrl+Y", description: "やり直す" },
    { key: "?", description: "このヘルプを表示" },
    { key: "Esc", description: "ダイアログを閉じる" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            キーボードショートカット
          </DialogTitle>
          <DialogDescription>
            データ入力を高速化するためのショートカット一覧
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-3 py-1.5 text-sm font-semibold bg-background border border-border rounded-md shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 ヒント: 入力フィールドにフォーカスがある場合、ショートカットは無効になります。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
