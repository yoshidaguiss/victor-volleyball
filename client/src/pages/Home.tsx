import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Trophy, ChevronRight, History,
  Users, Settings, BookOpen,
  Zap, TrendingUp, Sparkles,
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
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">

          {/* badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 tracking-widest uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 2.5 Flash 搭載
          </div>

          {/* brand name */}
          <h1 className="font-black tracking-tight leading-tight mb-6">
            <span className="block text-5xl md:text-6xl text-gray-950">AID ANALYTICS</span>
            <span className="block text-3xl md:text-4xl text-orange-500 mt-1">for Volleyball</span>
          </h1>

          {/* tagline */}
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            全プレーをリアルタイムで記録・分析。AIが試合状況を読み解き、
            コーチングに必要な洞察を届けます。
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/setup">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-base rounded-xl shadow-md shadow-orange-200 transition-colors"
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
                className="border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-6 text-base rounded-xl transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                試合履歴
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

      {/* ── Features ─────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "高速タップ入力",
                desc: "1プレー3〜4タップで完結。コート図タップで着弾点・アウト・ブロックアウトも即記録。",
              },
              {
                icon: TrendingUp,
                title: "リアルタイム分析",
                desc: "点数推移・選手別統計・ヒートマップなど9種類のビューを複数端末から同時閲覧。",
              },
              {
                icon: Sparkles,
                title: "AI 戦術提案",
                desc: "Gemini 2.5 Flashが試合データを解析し、タイムアウト・セット間に具体的な改善案を提示。",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer nav ───────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-400">
            AID ANALYTICS <span className="text-orange-400">for Volleyball</span>
          </p>
          <div className="flex gap-2">
            {[
              { href: "/teams", icon: Users, label: "チーム管理" },
              { href: "/settings", icon: Settings, label: "設定" },
              { href: "/guide", icon: BookOpen, label: "使い方ガイド" },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-700 rounded-lg text-xs">
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
