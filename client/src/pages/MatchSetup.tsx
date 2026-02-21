import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import MatchCodeDisplay from "@/components/MatchCodeDisplay";

export default function MatchSetup() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("create");
  const [step, setStep] = useState(1);
  
  const [venue, setVenue] = useState("");
  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [sets, setSets] = useState(5);
  const [matchCode, setMatchCode] = useState("");
  const [createdMatch, setCreatedMatch] = useState<{ matchId: number; matchCode: string } | null>(null);
  
  const { data: teams } = trpc.teams.list.useQuery();

  const createMatchMutation = trpc.matches.create.useMutation({
    onSuccess: (data) => {
      setCreatedMatch(data);
      toast.success("試合を作成しました！");
      setStep(2);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleCreateMatch = () => {
    if (!homeTeamName || !awayTeamName) {
      toast.error("チーム名を入力してください");
      return;
    }

    createMatchMutation.mutate({
      date: new Date(),
      venue,
      homeTeamId: homeTeamId || 0,
      homeTeamName,
      awayTeamName,
      sets,
      isPracticeMatch: false,
    });
  };
  
  const handleTeamSelect = (teamId: string) => {
    const team = teams?.find(t => t.id === parseInt(teamId));
    if (team) {
      setHomeTeamId(team.id);
      setHomeTeamName(team.teamName);
    }
  };

  const handleJoinMatch = () => {
    if (!matchCode || matchCode.length !== 8) {
      toast.error("8桁の試合コードを入力してください");
      return;
    }
    setLocation(`/coach/${matchCode}`);
  };

  if (step === 2 && createdMatch) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">試合が作成されました！</CardTitle>
              <CardDescription>
                以下の試合コードを共有して、他の端末からアクセスできます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MatchCodeDisplay matchCode={createdMatch.matchCode} matchId={createdMatch.matchId} size="lg" />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2">次のステップ</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>試合コードをコーチや記録担当者に共有</li>
                  <li>データ入力画面でプレーを記録</li>
                  <li>コーチ閲覧画面でリアルタイム統計を確認</li>
                </ol>
              </div>

              <div className="space-y-4">
                <Link href={`/lineup/${createdMatch.matchId}`}>
                  <Button className="w-full" size="lg">
                    スターティングメンバーを設定
                  </Button>
                </Link>
                
                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/input/${createdMatch.matchId}`}>
                    <Button variant="outline" className="w-full" size="lg">
                      メンバー設定をスキップ
                    </Button>
                  </Link>
                  <Link href={`/coach/${createdMatch.matchId}`}>
                    <Button variant="outline" className="w-full" size="lg">
                      コーチ画面を開く
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ホームに戻る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
      <div className="container max-w-4xl mx-auto px-2 md:px-4">
        <div className="mb-4 md:mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2 md:p-3">
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">ホームに戻る</span>
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>試合セットアップ</CardTitle>
            <CardDescription>
              新しい試合を作成するか、既存の試合に参加してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">新規作成</TabsTrigger>
                <TabsTrigger value="join">試合に参加</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6 mt-6">
                <div className="space-y-4">
                  {teams && teams.length > 0 && (
                    <div>
                      <Label htmlFor="teamSelect">登録済みチームから選択（任意）</Label>
                      <Select onValueChange={handleTeamSelect}>
                        <SelectTrigger id="teamSelect">
                          <SelectValue placeholder="チームを選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map(team => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.teamName} {team.season && `(${team.season})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        選択するとチーム名が自動入力されます
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="homeTeamName">自チーム名</Label>
                    <Input
                      id="homeTeamName"
                      value={homeTeamName}
                      onChange={(e) => setHomeTeamName(e.target.value)}
                      placeholder="例: 〇〇高校"
                    />
                  </div>

                  <div>
                    <Label htmlFor="awayTeamName">相手チーム名</Label>
                    <Input
                      id="awayTeamName"
                      value={awayTeamName}
                      onChange={(e) => setAwayTeamName(e.target.value)}
                      placeholder="例: △△高校"
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue">会場（任意）</Label>
                    <Input
                      id="venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="例: 〇〇体育館"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sets">セット数</Label>
                    <Select value={sets.toString()} onValueChange={(v) => setSets(parseInt(v))}>
                      <SelectTrigger id="sets">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3セット</SelectItem>
                        <SelectItem value="5">5セット</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreateMatch}
                  disabled={createMatchMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createMatchMutation.isPending ? "作成中..." : "試合を作成"}
                </Button>
              </TabsContent>

              <TabsContent value="join" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="matchCode">試合コード（8桁）</Label>
                    <Input
                      id="matchCode"
                      value={matchCode}
                      onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                      placeholder="例: ABC12345"
                      maxLength={8}
                      className="text-2xl font-mono text-center"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      データ入力担当者から共有された8桁のコードを入力してください
                    </p>
                  </div>

                  <Button
                    onClick={handleJoinMatch}
                    className="w-full"
                    size="lg"
                  >
                    試合に参加
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
