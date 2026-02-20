import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Guide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* タイトル */}
        <div className="text-center mb-12">
          <div className="text-5xl font-black text-blue-600 mb-6">
            VICTOR
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">使い方ガイド</h1>
          <p className="text-lg text-gray-600">VICTORの基本的な使い方を説明します</p>
        </div>

        {/* 簡略版の内容 */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">📖 はじめに</h2>
          <p className="text-gray-700">
            VICTORは、バレーボールの試合をリアルタイムで記録・分析するためのシステムです。
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">🔐 ステップ1: ログイン</h2>
          <p className="text-gray-700">
            ユーザーIDとパスワードを入力してログインしてください。
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">👥 ステップ2: チーム管理</h2>
          <p className="text-gray-700">
            チームを作成し、選手を登録します。
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">🏐 ステップ3: 試合作成</h2>
          <p className="text-gray-700">
            新しい試合を作成し、試合コードを共有します。
          </p>
        </Card>

        {/* フッター */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
