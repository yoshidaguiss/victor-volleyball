import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";

const PASSWORD = "meikei";
const STORAGE_KEY = "victor_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24時間

interface PasswordGateProps {
  children: ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // セッションの有効性を確認
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { timestamp } = JSON.parse(stored);
        const elapsed = Date.now() - timestamp;
        if (elapsed < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("パスワードが正しくありません");
      setPassword("");
    }
  };

  if (isChecking) {
    return null;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">VICTOR</CardTitle>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Sparkles className="w-4 h-4" />
            AI搭載バレーボール分析システム
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワードを入力してください
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="パスワード"
                className="text-center text-lg"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full text-lg py-5" disabled={!password}>
              <Lock className="w-4 h-4 mr-2" />
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
