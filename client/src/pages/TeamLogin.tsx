import { useState } from "react";
import { useLocation } from "wouter";
import { useTeamAuth } from "@/contexts/TeamAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TeamLogin() {
  const [, setLocation] = useLocation();
  const { login, register } = useTeamAuth();
  
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [registerTeamName, setRegisterTeamName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("ユーザーIDとパスワードを入力してください");
      return;
    }
    
    setLoginLoading(true);
    try {
      await login(loginUsername, loginPassword);
      toast.success("ログインしました");
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "ログインに失敗しました");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerTeamName || !registerUsername || !registerPassword) {
      toast.error("すべての項目を入力してください");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }
    if (registerUsername.length < 3) {
      toast.error("ユーザーIDは3文字以上で入力してください");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("パスワードは6文字以上で入力してください");
      return;
    }
    
    setRegisterLoading(true);
    try {
      await register(registerTeamName, registerUsername, registerPassword);
      toast.success(`チーム「${registerTeamName}」を登録しました`);
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "登録に失敗しました");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-2 flex justify-center">
            <img src="/victor-logo.jpeg" alt="VICTOR" className="w-full max-w-md h-auto" />
          </div>
          <p className="text-gray-600">AI搭載バレーボール分析システム</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="register">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>チームログイン</CardTitle>
                <CardDescription>
                  ユーザーIDとパスワードでログインしてください
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">ユーザーID</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="team_username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">パスワード</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "ログイン中..." : "ログイン"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>チーム新規登録</CardTitle>
                <CardDescription>
                  新しいチームアカウントを作成してください
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-team-name">チーム名</Label>
                    <Input
                      id="register-team-name"
                      type="text"
                      placeholder="〇〇高校バレーボール部"
                      value={registerTeamName}
                      onChange={(e) => setRegisterTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">ユーザーID</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="team_username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">3文字以上の英数字</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">パスワード</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">6文字以上</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      パスワード（確認）
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerLoading}
                  >
                    {registerLoading ? "登録中..." : "チーム登録"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
