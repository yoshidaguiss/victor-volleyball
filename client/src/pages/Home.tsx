import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Trophy, ChevronRight, History, Users, Settings, BookOpen,
  Zap, TrendingUp, Sparkles, BarChart2, Layers, ShieldCheck,
  ArrowRight, CheckCircle2, Mic, FileSpreadsheet,
} from "lucide-react";

const NAVY = "#1a3560";

/* ── Brand lockup ──────────────────────────────────────────── */
function BrandLogo({ size = "default" }: { size?: "default" | "sm" }) {
  const main = size === "sm"
    ? "text-2xl"
    : "text-[clamp(2.8rem,8vw,5.5rem)]";
  const sub = size === "sm"
    ? "text-xs tracking-[0.35em]"
    : "text-[clamp(0.75rem,1.8vw,1.1rem)] tracking-[0.45em]";

  return (
    <div className="inline-block leading-none select-none">
      <div
        className={`font-black bg-clip-text text-transparent ${main}`}
        style={{
          letterSpacing: "-0.02em",
          backgroundImage: "linear-gradient(100deg, #1a3560 0%, #1a3560 45%, #c75000 100%)",
        }}
      >
        AID ANALYTICS
      </div>
      <div className={`font-light text-orange-500 uppercase ${sub} mt-1`}>
        for Volleyball
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
      if (result.data) setLocation(`/coach/${result.data.id}`);
      else toast.error("試合が見つかりません。コードを確認してください。");
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* AI badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border mb-10"
            style={{ color: NAVY, borderColor: `${NAVY}25`, background: `${NAVY}06` }}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Gemini 2.5 Flash 搭載 · リアルタイム AI 分析
          </div>

          {/* Brand lockup */}
          <div className="mb-8" style={{ color: NAVY }}>
            <BrandLogo />
          </div>

          {/* tagline */}
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10">
            全プレーをリアルタイムで記録・分析。<br className="hidden md:block" />
            AIが戦況を読み解き、コーチングに必要な洞察を届けます。
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link href="/setup">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-base rounded-xl shadow-lg shadow-orange-200 transition-colors"
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
                className="border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-6 text-base rounded-xl"
              >
                <History className="w-4 h-4 mr-2" />
                試合履歴
              </Button>
            </Link>
          </div>

          {/* Secondary nav */}
          <div className="flex gap-2 justify-center mb-7">
            <Link href="/teams">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-700 rounded-lg text-xs px-3">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                チーム管理
              </Button>
            </Link>
            <span className="text-gray-200 text-sm self-center">|</span>
            <Link href="/guide">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-700 rounded-lg text-xs px-3">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                使い方ガイド
              </Button>
            </Link>
          </div>

          {/* match code */}
          <div className="flex gap-2 justify-center">
            <Input
              className="w-44 border-gray-200 text-center font-mono text-sm rounded-xl placeholder:text-gray-300 focus:border-orange-400"
              placeholder="試合コード（8桁）"
              value={matchCode}
              onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinMatch()}
              maxLength={8}
            />
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-gray-700"
              disabled={!matchCode || getByCodeQuery.isFetching}
              onClick={handleJoinMatch}
            >
              {getByCodeQuery.isFetching ? "…" : "参加 →"}
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section className="border-y border-gray-100 py-8 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "3秒", label: "平均記録時間 / プレー" },
            { value: "9種", label: "コーチ画面の分析ビュー" },
            { value: "AI", label: "Gemini 2.5 Flash" },
            { value: "∞", label: "同時閲覧端末数" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black text-orange-500 leading-none">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: NAVY }}>
              勝利に必要なすべてが揃っています
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              入力から分析・AI提案まで、スタッフひとりで完結する設計です
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap,             bg: "bg-orange-100", color: "text-orange-500", title: "高速タップ入力",     desc: "1プレー3〜4タップで完結。コート図タップで着弾点・アウト・ブロックアウトも即記録。" },
              { icon: TrendingUp,      bg: "bg-sky-100",    color: "text-sky-600",    title: "点数推移グラフ",     desc: "ラリーごとのスコア変化をライングラフでリアルタイム表示。ターニングポイントを一目で把握。" },
              { icon: Sparkles,        bg: "bg-amber-100",  color: "text-amber-500",  title: "AI 戦術提案",        desc: "Gemini 2.5 Flashが試合データを解析し、タイムアウト・セット間に具体的な改善案を提示。" },
              { icon: BarChart2,       bg: "bg-violet-100", color: "text-violet-600", title: "9種類の分析ビュー",  desc: "概要・選手別・チーム比較・ヒートマップ・ポジション・時系列など多角的な分析タブ。" },
              { icon: Mic,             bg: "bg-green-100",  color: "text-green-600",  title: "音声入力対応",       desc: "「7番アタック成功」などの音声実況からプレーを自動抽出。ハンズフリーで高速記録。" },
              { icon: FileSpreadsheet, bg: "bg-rose-100",   color: "text-rose-500",   title: "Excel エクスポート", desc: "試合データをExcel形式でエクスポート。選手別・セット別の詳細データを外部でも活用可能。" },
            ].map(({ icon: Icon, bg, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: NAVY }}>
              3ステップで分析開始
            </h2>
            <p className="text-gray-500 text-sm">セットアップから分析まで、最短5分で使い始められます</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01", title: "チームと試合を登録",
                desc: "選手情報を登録して試合を作成。相手チームも選択・登録でき、試合コードが自動発行されます。",
                checks: ["選手・背番号の登録", "相手チームの選択", "試合コードの自動発行"],
              },
              {
                step: "02", title: "タップでデータ入力",
                desc: "データ入力画面で選手を選びプレーをタップ記録。複数端末から同時入力も可能です。",
                checks: ["1プレー3〜4タップ", "複数端末の同時入力", "音声入力にも対応"],
              },
              {
                step: "03", title: "コーチ画面で分析",
                desc: "試合コードを共有するだけで、コーチ・スタッフがリアルタイムで統計を閲覧できます。",
                checks: ["スコア推移グラフ", "選手別パフォーマンス", "AI による戦術提案"],
              },
            ].map(({ step, title, desc, checks }) => (
              <div key={step} className="rounded-2xl border border-gray-100 p-7 relative overflow-hidden">
                <div
                  className="absolute top-3 right-5 text-7xl font-black leading-none select-none pointer-events-none"
                  style={{ color: `${NAVY}07` }}
                >
                  {step}
                </div>
                <div
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-black mb-5"
                  style={{ backgroundColor: NAVY }}
                >
                  {parseInt(step)}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2">
                  {checks.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AI SPOTLIGHT
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ backgroundColor: `${NAVY}07` }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-orange-500 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-5" style={{ color: NAVY }}>
              タイムアウトの<br />
              <span className="text-orange-500">15秒</span>を、<br />
              最大限に活かす
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm">
              Gemini 2.5 Flashがリアルタイムで試合データを解析。相手の攻撃パターン・
              弱点・調子のよい選手など、コーチが必要な情報を即座に日本語でまとめます。
            </p>
            <ul className="space-y-3 mb-8">
              {["相手の攻撃パターン分析", "自チームの改善ポイント提示", "選手交代のタイミング提案", "サーブ狙い目の示唆"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/setup">
              <Button
                className="text-white font-bold rounded-xl px-6 py-5 transition-all hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                試してみる <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* AI suggestion panel */}
          <div className="rounded-2xl bg-white border p-6 shadow-lg" style={{ borderColor: `${NAVY}18` }}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold" style={{ color: NAVY }}>AI 戦術提案</span>
              <span className="ml-auto text-xs text-gray-400">第2セット終了時</span>
            </div>
            {[
              { label: "相手の攻撃傾向", body: "#7 はクロス方向への攻撃が68%。レシーブの右寄りポジション調整を推奨します。", accent: "orange" },
              { label: "サーブの狙い目",  body: "#3 のレシーブ成功率が42%と低下中。積極的にサーブを集めることで崩せる可能性が高い。", accent: "navy" },
              { label: "選手交代の検討", body: "#11 の直近5プレーでエラーが3回。#15 への交代でレシーブ安定が期待できます。", accent: "navy" },
            ].map(({ label, body, accent }) => (
              <div key={label} className="mb-3 last:mb-0 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-bold mb-1" style={{ color: accent === "orange" ? "#f97316" : NAVY }}>
                  {label}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MULTI-DEVICE
      ══════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Multi-Device</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: NAVY }}>
              役割分担で、<br />もっとスムーズに
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              試合コードを共有するだけで、記録・閲覧・分析を複数端末から同時に行えます。
              マネージャーが入力しながらコーチがリアルタイムで分析できます。
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {[
              { icon: Zap,         title: "データ入力",  sub: "スマホ / タブレット", who: "マネージャー・スタッフ" },
              { icon: BarChart2,   title: "コーチ閲覧",  sub: "タブレット / PC",    who: "コーチ・監督" },
              { icon: Sparkles,    title: "AI 分析",     sub: "任意の端末",          who: "チーム全員で共有" },
              { icon: ShieldCheck, title: "試合記録",    sub: "クラウド保存",        who: "いつでも振り返り可能" },
            ].map(({ icon: Icon, title, sub, who }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Icon className="w-4 h-4 text-orange-500 mb-2" />
                <div className="text-sm font-bold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                <div className="text-xs font-semibold mt-2" style={{ color: NAVY }}>{who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-16 px-6 text-white" style={{ backgroundColor: NAVY }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div style={{ color: "white" }}>
              <BrandLogo size="sm" />
            </div>
            <p className="text-white/40 text-sm mt-3">チーム登録から分析まですべて無料</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/setup">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-7 transition-colors">
                <Trophy className="w-4 h-4 mr-2" />試合を開始する
              </Button>
            </Link>
            {[
              { href: "/teams",    icon: Users,     label: "チーム管理" },
              { href: "/settings", icon: Settings,  label: "設定" },
              { href: "/guide",    icon: BookOpen,  label: "使い方ガイド" },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent rounded-xl px-5">
                  <Icon className="w-4 h-4 mr-2" />{label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
