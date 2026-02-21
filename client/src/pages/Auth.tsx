import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "victor_team_session";

export default function Auth() {
  const [, setLocation] = useLocation();
  
  // ログインフォーム
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  // 登録フォーム
  const [registerTeamName, setRegisterTeamName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const loginMutation = trpc.teams.login.useMutation();
  const registerMutation = trpc.teams.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginUsername || !loginPassword) {
      toast.error("ユーザーIDとパスワードを入力してください");
      return;
    }

    setLoginLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ 
        username: loginUsername, 
        password: loginPassword 
      });
      
      if (result.teamId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          teamId: result.teamId,
          teamName: result.teamName,
          username: result.username
        }));
        toast.success("ログインしました");
        setLocation("/");
      }
    } catch (error: any) {
      toast.error(error.message || "ログインに失敗しました");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerTeamName || !registerUsername || !registerPassword) {
      toast.error("全ての項目を入力してください");
      return;
    }

    if (registerPassword.length < 4) {
      toast.error("パスワードは4文字以上にしてください");
      return;
    }

    setRegisterLoading(true);
    try {
      const result = await registerMutation.mutateAsync({ 
        teamName: registerTeamName,
        username: registerUsername, 
        password: registerPassword 
      });
      
      if (result.teamId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          teamId: result.teamId,
          teamName: result.teamName,
          username: result.username
        }));
        toast.success("チーム登録が完了しました");
        setLocation("/");
      }
    } catch (error: any) {
      toast.error(error.message || "登録に失敗しました");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
          <div className="mb-2 flex justify-center">
            <img 
              src="/victor-logo.jpeg" 
              alt="VICTOR" 
              className="h-24 object-contain"
            />
          </div>
          <p className="text-gray-600">バレーボール分析システム</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="register">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>ログイン</CardTitle>
                <CardDescription>
                  ユーザーIDとパスワードを入力してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">ユーザーID</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="ユーザーID"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      disabled={loginLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">パスワード</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="パスワード"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? "ログイン中..." : "ログイン"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>新規登録</CardTitle>
                <CardDescription>
                  チーム情報を入力して登録してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-teamname">チーム名</Label>
                    <Input
                      id="register-teamname"
                      type="text"
                      placeholder="チーム名"
                      value={registerTeamName}
                      onChange={(e) => setRegisterTeamName(e.target.value)}
                      disabled={registerLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">ユーザーID</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="ユーザーID"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      disabled={registerLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">パスワード</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="パスワード（4文字以上）"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerLoading}>
                    {registerLoading ? "登録中..." : "チーム登録"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
