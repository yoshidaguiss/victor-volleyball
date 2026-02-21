import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Key, Save, Trash2, Eye, EyeOff, LogOut } from "lucide-react";
const STORAGE_KEY = "victor_team_session";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [teamSession, setTeamSession] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (session) {
      setTeamSession(JSON.parse(session));
    }
  }, []);

  // APIキーを取得
  const { data: existingKey, refetch } = trpc.apiKeys.get.useQuery({ provider: "gemini" });

  // APIキーを保存
  const saveApiKey = trpc.apiKeys.save.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setGeminiApiKey("");
      refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  // APIキーを削除
  const deleteApiKey = trpc.apiKeys.delete.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      toast.error("有効なAPIキーを入力してください");
      return;
    }

    saveApiKey.mutate({
      provider: "gemini",
      apiKey: geminiApiKey,
    });
  };

  const handleDelete = () => {
    if (confirm("本当にAPIキーを削除しますか？AI分析機能が使用できなくなります。")) {
      deleteApiKey.mutate({ provider: "gemini" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTeamSession(null);
    toast.success("ログアウトしました");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* APIキー管理カード */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Gemini APIキー管理
            </CardTitle>
            <CardDescription>
              AI分析機能を使用するには、Google Gemini APIキーが必要です。
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                こちら
              </a>
              から取得できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 現在のAPIキー */}
            {existingKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">APIキーが登録されています</p>
                    <p className="text-xs text-green-700 mt-1 font-mono">{existingKey.maskedKey}</p>
                    <p className="text-xs text-green-600 mt-2">
                      使用回数: {existingKey.usageCount}回
                      {existingKey.lastUsedAt && (
                        <span className="ml-2">
                          最終使用: {new Date(existingKey.lastUsedAt).toLocaleString("ja-JP")}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteApiKey.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </Button>
                </div>
              </div>
            )}

            {/* APIキー入力 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {existingKey ? "新しいAPIキー（更新する場合）" : "Gemini APIキー"}
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  APIキーは暗号化されてデータベースに保存されます。
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={saveApiKey.isPending || !geminiApiKey}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {existingKey ? "APIキーを更新" : "APIキーを保存"}
              </Button>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ 注意事項</h4>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>APIキーは他人と共有しないでください</li>
                <li>Google Cloud Consoleで使用量を定期的に確認してください</li>
                <li>不正な使用を防ぐため、APIキーの使用制限を設定することを推奨します</li>
                <li>APIキーを削除すると、AI分析機能が使用できなくなります</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ログアウト */}
        {teamSession && (
          <Card className="mt-6 border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                アカウント
              </CardTitle>
              <CardDescription>
                {teamSession.teamName}でログイン中です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 今後の機能 */}
        <Card className="mt-6 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">今後の機能</CardTitle>
            <CardDescription>以下の設定機能を追加予定です</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• プロフィール設定（名前、メールアドレス）</li>
              <li>• 通知設定（試合開始リマインダー、分析完了通知）</li>
              <li>• テーマ設定（ダーク/ライトモード）</li>
              <li>• データエクスポート設定（CSV、PDF形式）</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
