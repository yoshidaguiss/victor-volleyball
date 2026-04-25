import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Sparkles,
  Trophy,
  ChevronRight,
  Users,
  Settings,
  BookOpen,
  History,
  BarChart2,
  Cpu,
  Zap,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

/* ── mock dashboard card ─────────────────────────────────────── */
function DashboardMock() {
  const bars = [14, 21, 18, 25, 22, 19, 25, 17, 23];
  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute -inset-4 bg-orange-300/30 rounded-3xl blur-2xl" />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/12 border border-gray-100 overflow-hidden">
        {/* traffic lights */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-gray-400 font-medium">コーチビュー · 第2セット</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="p-5 space-y-4">
          {/* score */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-400 mb-1">○○高校</div>
              <div className="text-4xl font-black text-gray-900 tabular-nums leading-none">21</div>
            </div>
            <div className="text-gray-200 font-black text-2xl">—</div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-400 mb-1">△△高校</div>
              <div className="text-4xl font-black text-gray-900 tabular-nums leading-none">18</div>
            </div>
          </div>
          {/* mini bar chart */}
          <div>
            <div className="text-[10px] text-gray-400 font-medium mb-2">点数推移（第2セット）</div>
            <div className="flex items-end gap-1 h-10">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${(h / 25) * 100}%`,
                    background: h >= 24 ? "linear-gradient(to top,#f97316,#fbbf24)" : i % 2 === 0 ? "#e2e8f0" : "#cbd5e1",
                  }}
                />
              ))}
            </div>
          </div>
          {/* stat row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "攻撃決定率", value: "63%", up: true },
              { label: "サーブ効果", value: "41%", up: false },
              { label: "ブロック", value: "5本", up: true },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-gray-400 mb-0.5">{s.label}</div>
                <div className="text-sm font-black text-gray-900">{s.value}</div>
                <div className={`text-[10px] font-semibold ${s.up ? "text-emerald-500" : "text-red-400"}`}>
                  {s.up ? "↑" : "↓"}
                </div>
              </div>
            ))}
          </div>
          {/* AI chip */}
          <div className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800 leading-relaxed">
              <span className="font-semibold">AI提案: </span>
              相手の#7はクロス攻撃が多い。レシーブポジションの右寄りを推奨。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* decorative rings */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-orange-100/80 pointer-events-none" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full border border-orange-100/60 pointer-events-none" />

        <div className="relative container max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* ── Left ── */}
            <div>
              {/* product badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200/70 text-orange-600 text-xs font-semibold mb-6 tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini 2.5 Flash 搭載 · AI分析プラットフォーム
              </div>

              {/* product name */}
              <div className="mb-3">
                <span className="text-sm font-bold tracking-[0.15em] text-gray-400 uppercase">
                  AID ANALYTICS
                </span>
                <span className="ml-2 text-sm font-semibold text-orange-500">for Volleyball</span>
              </div>

              {/* headline */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1] mb-5">
                試合データで、
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                  チームを強くする。
                </span>
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-7 max-w-md">
                全プレーを3秒で記録し、AIがリアルタイムで戦況を分析。
                タイムアウト時に具体的な戦術提案を届けます。
              </p>

              {/* trust pills */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-8">
                {["無料で利用可能", "複数端末で同時閲覧", "セット間に自動分析"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/setup">
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-6 text-base rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    試合を開始する
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 px-7 py-6 text-base rounded-xl transition-all duration-200"
                  >
                    <History className="w-4 h-4 mr-2" />
                    試合履歴
                  </Button>
                </Link>
              </div>

              {/* match code join */}
              <div className="flex gap-2">
                <Input
                  className="w-44 border-gray-200 text-center font-mono text-sm rounded-xl placeholder:text-gray-400 focus:border-orange-400"
                  placeholder="試合コード（8桁）"
                  value={matchCode}
                  onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinMatch()}
                  maxLength={8}
                />
                <Button
                  variant="outline"
                  className="border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50"
                  disabled={!matchCode || getByCodeQuery.isFetching}
                  onClick={handleJoinMatch}
                >
                  {getByCodeQuery.isFetching ? "..." : "参加"}
                </Button>
              </div>
            </div>

            {/* ── Right: dashboard mock ── */}
            <div className="hidden lg:flex justify-center items-center">
              <DashboardMock />
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { value: "3秒", sub: "平均記録時間 / プレー", icon: Zap },
              { value: "9 ビュー", sub: "コーチ画面の分析タブ数", icon: BarChart2 },
              { value: "AI", sub: "Gemini 2.5 Flash 搭載", icon: Cpu },
            ].map(({ value, sub, icon: Icon }) => (
              <div key={sub} className="flex flex-col sm:flex-row items-center gap-3 py-6 px-4 sm:px-8">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900 leading-none">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════ */}
      <section className="bg-gray-50/60 py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-3">機能</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              入力から分析まで、すべてここで
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              スタッフひとりで完結する設計。試合中も試合後も、必要な情報がすぐに手に入ります。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                bg: "bg-orange-500",
                title: "高速タップ入力",
                desc: "1プレー3〜4タップで完結。コート図タップで着弾点・アウト・ブロックアウトも即記録。",
                badge: "3秒 / プレー",
              },
              {
                icon: TrendingUp,
                bg: "bg-blue-500",
                title: "点数推移グラフ",
                desc: "ラリーごとのスコア変化をリアルタイムでラインチャート表示。ターニングポイントを一目で把握。",
                badge: "コーチ画面 概要タブ",
              },
              {
                icon: Sparkles,
                bg: "bg-amber-500",
                title: "AI戦術提案",
                desc: "試合状況をGemini 2.5 Flashが解析。タイムアウト・セット間に具体的な改善案を日本語で提示。",
                badge: "Gemini 2.5 Flash",
              },
              {
                icon: BarChart2,
                bg: "bg-purple-500",
                title: "9種類の分析ビュー",
                desc: "概要・選手別・チーム比較・ヒートマップ・ポジション・戦術・セット分析など網羅。",
                badge: "コーチ画面",
              },
              {
                icon: Users,
                bg: "bg-green-500",
                title: "選手・チーム管理",
                desc: "選手情報・スタメン設定・相手チーム登録に対応。試合ごとのメンバー設定も簡単に。",
                badge: "相手チーム選択対応",
              },
              {
                icon: History,
                bg: "bg-rose-500",
                title: "試合履歴管理",
                desc: "過去の全試合をリスト管理。チーム名・会場・コードで検索でき、削除も一操作で完了。",
                badge: "検索・削除対応",
              },
            ].map(({ icon: Icon, bg, title, desc, badge }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200"
              >
                <div className={`inline-flex w-10 h-10 rounded-xl ${bg} items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-3">使い方</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">3ステップで分析開始</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                n: "1",
                title: "チームと試合を登録",
                desc: "選手情報を登録して試合を作成。相手チームもその場で選択・登録できます。",
              },
              {
                n: "2",
                title: "タップしながらデータ入力",
                desc: "データ入力画面で選手を選び、プレーをタップ記録。複数端末から同時入力も可能。",
              },
              {
                n: "3",
                title: "コーチ画面でリアルタイム分析",
                desc: "点数推移・選手別統計・ヒートマップが自動集計。AIが戦術提案を生成します。",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex gap-5 items-start p-6 rounded-2xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-base shrink-0">
                  {n}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ═════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-400">
        <div className="container max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-orange-100 text-sm font-semibold tracking-widest uppercase mb-1">
                AID ANALYTICS for Volleyball
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                今すぐ使い始める
              </h2>
              <p className="text-orange-100 text-sm">
                チーム登録から分析まですべて無料でご利用いただけます
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/teams">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  チーム管理
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl font-semibold">
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Button>
              </Link>
              <Link href="/guide">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl font-semibold">
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
