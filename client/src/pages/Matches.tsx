import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trophy,
  ClipboardEdit,
  Monitor,
  Search,
  Trash2,
  Plus,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  preparing: "準備中",
  inProgress: "試合中",
  completed: "終了",
};

const STATUS_VARIANTS: Record<string, "secondary" | "destructive" | "default"> = {
  preparing: "secondary",
  inProgress: "destructive",
  completed: "default",
};

export default function Matches() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: matches, refetch } = trpc.matches.list.useQuery();

  const deleteMutation = trpc.matches.delete.useMutation({
    onSuccess: () => {
      toast.success("試合を削除しました");
      setDeletingId(null);
      refetch();
    },
    onError: (err) => {
      toast.error(`削除に失敗しました: ${err.message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (matchId: number, label: string) => {
    if (!window.confirm(`「${label}」を削除しますか？\n関連するプレーデータもすべて削除されます。`)) return;
    setDeletingId(matchId);
    deleteMutation.mutate({ matchId });
  };

  const filtered = (matches ?? []).filter((m) => {
    const matchesSearch =
      !search ||
      m.homeTeamName?.toLowerCase().includes(search.toLowerCase()) ||
      m.awayTeamName?.toLowerCase().includes(search.toLowerCase()) ||
      m.venue?.toLowerCase().includes(search.toLowerCase()) ||
      m.matchCode?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              ホーム
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex-1">試合履歴</h1>
          <Link href="/setup">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              新規試合
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="チーム名・会場・コードで検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="preparing">準備中</SelectItem>
                  <SelectItem value="inProgress">試合中</SelectItem>
                  <SelectItem value="completed">終了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Match list */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">試合が見つかりません</p>
              <p className="text-sm">
                {matches?.length === 0
                  ? "まだ試合が作成されていません"
                  : "検索条件を変えてみてください"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground px-1">{filtered.length}件</p>
            {filtered.map((match) => {
              const label = `${match.homeTeamName ?? "?"} vs ${match.awayTeamName ?? "?"}`;
              const homeTotal = Array.isArray(match.scoreHome)
                ? (match.scoreHome as number[]).reduce((a, b) => a + b, 0)
                : 0;
              const awayTotal = Array.isArray(match.scoreAway)
                ? (match.scoreAway as number[]).reduce((a, b) => a + b, 0)
                : 0;

              return (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-base truncate">{label}</span>
                          <Badge variant={STATUS_VARIANTS[match.status] ?? "secondary"}>
                            {STATUS_LABELS[match.status] ?? match.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          {match.date
                            ? new Date(match.date).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "日付不明"}
                          {match.venue ? `　${match.venue}` : ""}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {match.matchCode}
                          </Badge>
                          {(homeTotal > 0 || awayTotal > 0) && (
                            <span className="text-sm font-mono font-semibold">
                              {homeTotal} - {awayTotal}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {match.sets}セット制
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Link href={`/input/${match.id}`}>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                            <ClipboardEdit className="w-3 h-3 mr-1" />
                            入力
                          </Button>
                        </Link>
                        <Link href={`/coach/${match.id}`}>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                            <Monitor className="w-3 h-3 mr-1" />
                            分析
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === match.id}
                          onClick={() => handleDelete(match.id, label)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {deletingId === match.id ? "削除中..." : "削除"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
