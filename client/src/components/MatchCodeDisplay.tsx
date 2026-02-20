import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Copy, QrCode, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface MatchCodeDisplayProps {
  matchCode: string;
  matchId: number;
  size?: "sm" | "md" | "lg";
}

export default function MatchCodeDisplay({ matchCode, matchId, size = "md" }: MatchCodeDisplayProps) {
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const matchUrl = `${window.location.origin}/coach/${matchId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(matchCode);
      setCopied(true);
      toast.success("試合コードをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "試合コード",
          text: `試合コード: ${matchCode}`,
          url: matchUrl,
        });
      } catch (error) {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      // Web Share API非対応の場合はQRコードを表示
      setIsQRDialogOpen(true);
    }
  };

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-600 dark:text-gray-400">試合コード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className={`font-mono font-bold ${sizeClasses[size]} text-blue-600 dark:text-blue-400 tracking-wider`}>
              {matchCode}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="bg-white dark:bg-gray-800"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQRDialogOpen(true)}
                className="bg-white dark:bg-gray-800"
              >
                <QrCode className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white dark:bg-gray-800"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            このコードを共有して、他の端末から試合データにアクセスできます
          </p>
        </CardContent>
      </Card>

      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QRコードで共有</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <QRCodeSVG value={matchUrl} size={256} level="H" />
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-3xl text-blue-600 mb-2">{matchCode}</div>
              <p className="text-sm text-gray-600">
                QRコードをスキャンするか、<br />
                上記のコードを入力してアクセス
              </p>
            </div>
            <Button onClick={handleCopy} className="w-full">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  コピーしました
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  コードをコピー
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
