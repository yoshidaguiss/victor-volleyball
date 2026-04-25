import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Sparkles,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  ArrowRight,
  Users,
  Settings,
  BookOpen,
  History,
} from "lucide-react";

export default function Home() {
  const [matchCode, setMatchCode] = useState("");
  const [, setLocation] = useLocation();

  const getByCodeQuery = trpc.matches.getByCode.useQuery(
    { matchCode: matchCode.toUpperCase() },
    { enabled: false }
  );

  const handleJoinMatch = async () => {
    if (!matchCode || matchCode.length !== 8) {
      toast.error("8桁の試合コードを入力してください");
      return;
    }
    try {
      const result = await getByCodeQuery.refetch();
      if (result.data) {
        setLocation(`/coach/${result.data.id}`);
      } else {
        toast.error("試合が見つかりません。コードを確認してください。");
      }
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* orange glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

        <div className="relative container max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-medium mb-8 fade-in">
              <Sparkles className="w-3 h-3" />
              Gemini 2.5 Flash 搭載 · リアルタイム分析
            </div>

            {/* headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 fade-in" style={{ animationDelay: "0.05s" }}>
              <span className="text-white">AID ANALYTICS</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                for Volleyball
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 fade-in max-w-xl" style={{ animationDelay: "0.1s" }}>
              試合中の全プレーをリアルタイムで記録・可視化。
              AIが戦況を読み解き、コーチングを支援する次世代の分析プラットフォーム。
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12 fade-in" style={{ animationDelay: "0.15s" }}>
              <Link href="/setup">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40 transition-all"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  試合を開始する
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-8 py-6 text-base transition-all bg-transparent"
                >
                  <History className="w-5 h-5 mr-2" />
                  試合履歴
                </Button>
              </Link>
            </div>

            {/* match code join */}
            <div className="flex gap-2 fade-in" style={{ animationDelay: "0.2s" }}>
              <Input
                className="w-48 bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-center font-mono text-sm focus:border-orange-500/60"
                placeholder="試合コード（8桁）"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMatch()}
                maxLength={8}
              />
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                disabled={!matchCode || getByCodeQuery.isFetching}
                onClick={handleJoinMatch}
              >
                {getByCodeQuery.isFetching ? "..." : "参加"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6 divide-x divide-gray-200">
            {[
              { value: "3秒", label: "平均記録時間 / プレー" },
              { value: "9 タブ", label: "コーチ画面の分析ビュー" },
              { value: "AI", label: "Gemini 2.5 Flash 搭載" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4">
                <div className="text-2xl md:text-3xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="container max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            試合の全データを、ひとつの画面で
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            スタッフひとりで入力・分析・AI提案まで完結。チームのポテンシャルを最大化します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              color: "bg-orange-100 text-orange-600",
              title: "高速タップ入力",
              desc: "1プレー3〜4タップで記録完了。コート図タップで着弾点も即座に入力できます。",
              metric: "平均 3秒 / プレー",
            },
            {
              icon: BarChart3,
              color: "bg-purple-100 text-purple-600",
              title: "リアルタイム統計",
              desc: "試合コードで複数端末から同時閲覧。スコア推移グラフ・ヒートマップを即座に確認。",
              metric: "9種類のグラフビュー",
            },
            {
              icon: Sparkles,
              color: "bg-amber-100 text-amber-600",
              title: "AI戦術分析",
              desc: "Gemini 2.5 Flashがリアルタイムで試合を解析。タイムアウト時に具体的な提案を生成。",
              metric: "Gemini 2.5 Flash",
            },
            {
              icon: Activity,
              color: "bg-green-100 text-green-600",
              title: "選手別パフォーマンス",
              desc: "アタック決定率・サーブ効果率・レシーブ成功率を選手ごとにリアルタイム集計。",
              metric: "全ポジション対応",
            },
            {
              icon: Target,
              color: "bg-blue-100 text-blue-600",
              title: "点数推移グラフ",
              desc: "セットごとのラリー別スコア推移をラインチャートで可視化。ターニングポイントを特定。",
              metric: "セット別詳細分析",
            },
            {
              icon: Users,
              color: "bg-rose-100 text-rose-600",
              title: "チーム管理",
              desc: "選手情報・スタメン管理・相手チーム登録に対応。試合ごとのメンバー設定も簡単。",
              metric: "相手チーム選択対応",
            },
          ].map(({ icon: Icon, color, title, desc, metric }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all bg-white"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                <ArrowRight className="w-3 h-3" />
                {metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section className="bg-gray-950 text-white">
        <div className="container max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">今すぐ始める</h2>
              <p className="text-gray-400 text-sm">チームを登録して最初の試合を作成してください</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/teams">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  チーム管理
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Button>
              </Link>
              <Link href="/guide">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <BookOpen className="w-4 h-4 mr-2" />
                  使い方ガイド
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
