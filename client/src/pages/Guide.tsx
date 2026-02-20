import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, LogIn, Users, Trophy, Activity, Target, Brain, Map, Settings as SettingsIcon, FileText, HelpCircle } from "lucide-react";

export default function Guide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* タイトル */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img src="/victor-logo.jpeg" alt="VICTOR" className="w-full max-w-xl h-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">使い方ガイド</h1>
          <p className="text-lg text-gray-600">VICTORの基本的な使い方を詳しく説明します</p>
        </div>

        {/* 目次 */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              目次
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              <a href="#intro" className="text-blue-600 hover:underline">📖 はじめに</a>
              <a href="#login" className="text-blue-600 hover:underline">🔐 ステップ1: ログイン</a>
              <a href="#team" className="text-blue-600 hover:underline">👥 ステップ2: チーム管理</a>
              <a href="#match" className="text-blue-600 hover:underline">🏐 ステップ3: 試合作成</a>
              <a href="#data" className="text-blue-600 hover:underline">⚡ ステップ4: データ入力</a>
              <a href="#coach" className="text-blue-600 hover:underline">📊 ステップ5: コーチビュー</a>
              <a href="#ai" className="text-blue-600 hover:underline">🤖 ステップ6: AI分析</a>
              <a href="#heatmap" className="text-blue-600 hover:underline">🗺️ ステップ7: ヒートマップ</a>
              <a href="#other" className="text-blue-600 hover:underline">⚙️ その他の機能</a>
              <a href="#tips" className="text-blue-600 hover:underline">💡 活用のコツ</a>
              <a href="#faq" className="text-blue-600 hover:underline">❓ よくある質問</a>
            </div>
          </CardContent>
        </Card>

        {/* はじめに */}
        <Card id="intro" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              📖 はじめに
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>VICTOR</strong>（Volleyball Intelligent Coach and Tactical Optimization Resource）は、バレーボールの試合をリアルタイムで記録・分析するためのシステムです。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">主な特徴</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✅ <strong>高速データ入力</strong>: 1プレーあたり3-4タップで完結</li>
                <li>✅ <strong>リアルタイム同期</strong>: 複数デバイスで同時に閲覧・入力可能</li>
                <li>✅ <strong>AI分析</strong>: Gemini APIによる戦術的示唆と相手パターン分析</li>
                <li>✅ <strong>ヒートマップ</strong>: 攻撃・サーブ・レシーブの位置を可視化</li>
                <li>✅ <strong>統計表示</strong>: 選手別・チーム別の詳細な統計情報</li>
                <li>✅ <strong>PDF出力</strong>: 試合レポートを簡単にエクスポート</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">利用シーン</h4>
              <ul className="space-y-2 text-gray-700">
                <li>🏐 <strong>公式試合</strong>: データ入力担当者が記録、コーチがリアルタイムで分析</li>
                <li>📊 <strong>練習試合</strong>: チームの弱点を発見し、次の練習に活かす</li>
                <li>🎯 <strong>戦術分析</strong>: 相手チームのパターンを分析し、対策を立てる</li>
                <li>📈 <strong>選手評価</strong>: 個人のパフォーマンスを数値化して評価</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ステップ1: ログイン */}
        <Card id="login" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LogIn className="h-6 w-6 text-green-600" />
              🔐 ステップ1: ログイン
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">新規登録（初回のみ）</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページ右上の「ログイン」ボタンをクリック</li>
                  <li>ログイン画面で「新規登録」タブをクリック</li>
                  <li>チーム名、ユーザーID、パスワードを入力</li>
                  <li>「チーム登録」ボタンをクリック</li>
                  <li>自動的にログインされ、ホーム画面に遷移します</li>
                </ol>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 ポイント</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• ユーザーIDとパスワードは忘れないようにメモしてください</li>
                  <li>• 同じチームのメンバーは同じユーザーIDとパスワードでログインします</li>
                  <li>• ログイン状態はブラウザに保存されるため、次回以降は自動的にログインされます</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2回目以降のログイン</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページ右上の「ログイン」ボタンをクリック</li>
                  <li>ユーザーIDとパスワードを入力</li>
                  <li>「ログイン」ボタンをクリック</li>
                  <li>ホーム画面に遷移します</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ2: チーム管理 */}
        <Card id="team" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-orange-600" />
              👥 ステップ2: チーム管理
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">チームの作成</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページの「チーム管理」ボタンをクリック</li>
                  <li>「新しいチームを作成」ボタンをクリック</li>
                  <li>チーム名とシーズン（任意）を入力</li>
                  <li>「チームを作成」ボタンをクリック</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">選手の登録</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>チーム一覧から対象のチームをクリック</li>
                  <li>「選手を追加」ボタンをクリック</li>
                  <li>選手名、背番号、ポジションを入力</li>
                  <li>「選手を追加」ボタンをクリック</li>
                  <li>必要な人数分繰り返します</li>
                </ol>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 ポイント</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• 選手は後からいつでも追加・編集できます</li>
                  <li>• ポジションは統計表示に使用されます</li>
                  <li>• 背番号は重複しても問題ありません</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ3: 試合作成 */}
        <Card id="match" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-red-600" />
              🏐 ステップ3: 試合作成
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">新しい試合を作成</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページの「新しい試合を開始」ボタンをクリック</li>
                  <li>自チームを選択</li>
                  <li>相手チーム名を入力</li>
                  <li>セット数（3セット制 or 5セット制）を選択</li>
                  <li>「試合を作成」ボタンをクリック</li>
                  <li>8桁の試合コードが表示されます（メモしてください）</li>
                </ol>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">試合コードの共有方法</h4>
                <p className="text-gray-700 mb-2">試合コードを使って、複数のデバイスで同じ試合を閲覧・入力できます：</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>データ入力担当者</strong>: 試合コードを使って「記録」画面にアクセス</li>
                  <li>• <strong>コーチ</strong>: 試合コードを使って「コーチビュー」にアクセス</li>
                  <li>• <strong>分析担当者</strong>: 試合コードを使って統計やヒートマップを閲覧</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">試合コードで参加</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページの「試合コードを入力」欄に8桁のコードを入力</li>
                  <li>「参加」ボタンをクリック</li>
                  <li>コーチビュー画面が開きます</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ4: データ入力 */}
        <Card id="data" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-6 w-6 text-cyan-600" />
              ⚡ ステップ4: データ入力
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                データ入力画面では、試合中のプレーを高速で記録できます。1プレーあたり3-4タップで完結します。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">プレーの記録方法</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">🏐 サーブ</h5>
                    <ol className="list-decimal list-inside text-gray-700 ml-4">
                      <li>「サーブ」ボタンをタップ</li>
                      <li>選手を選択</li>
                      <li>コート位置をタップ</li>
                      <li>結果（成功/失敗/エース）を選択</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">⚡ アタック</h5>
                    <ol className="list-decimal list-inside text-gray-700 ml-4">
                      <li>「アタック」ボタンをタップ</li>
                      <li>選手を選択</li>
                      <li>コート位置をタップ</li>
                      <li>結果（得点/ブロックされた/アウト/ネット）を選択</li>
                    </ol>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900">🙌 ブロック</h5>
                    <ol className="list-decimal list-inside text-gray-700 ml-4">
                      <li>「ブロック」ボタンをタップ</li>
                      <li>選手を選択</li>
                      <li>結果（成功/触った/失敗）を選択</li>
                    </ol>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900">🛡️ レシーブ/ディグ</h5>
                    <ol className="list-decimal list-inside text-gray-700 ml-4">
                      <li>「レシーブ」または「ディグ」ボタンをタップ</li>
                      <li>選手を選択</li>
                      <li>評価（A/B/C）を選択</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">⚡ 高速入力のコツ</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>背番号を覚える</strong>: 選手名ではなく背番号で選択すると速い</li>
                  <li>• <strong>コート位置は大まかでOK</strong>: 正確な位置より、入力速度を優先</li>
                  <li>• <strong>音声入力を活用</strong>: 「音声入力」ボタンで音声でプレーを記録</li>
                  <li>• <strong>セット終了ボタン</strong>: セットが終わったら「セット終了」ボタンで次のセットに切り替え</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ5: コーチビュー */}
        <Card id="coach" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-indigo-600" />
              📊 ステップ5: コーチビュー
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                コーチビューでは、試合中にリアルタイムで統計情報を確認できます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">表示される統計情報</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">📊 基本統計</h5>
                    <ul className="text-gray-700 text-sm">
                      <li>• 得点・失点</li>
                      <li>• サーブ成功率</li>
                      <li>• アタック決定率</li>
                      <li>• ブロック成功数</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">👥 選手別統計</h5>
                    <ul className="text-gray-700 text-sm">
                      <li>• 個人得点</li>
                      <li>• アタック本数・決定率</li>
                      <li>• サーブ本数・成功率</li>
                      <li>• レシーブ評価</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900">🎯 相手分析</h5>
                    <ul className="text-gray-700 text-sm">
                      <li>• 相手の弱点エリア</li>
                      <li>• 攻撃パターン</li>
                      <li>• サーブの傾向</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900">📈 トレンド</h5>
                    <ul className="text-gray-700 text-sm">
                      <li>• 得点推移グラフ</li>
                      <li>• ラリー数の分布</li>
                      <li>• セット別パフォーマンス</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💡 活用シーン</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>タイムアウト時</strong>: 統計を見て戦術を調整</li>
                  <li>• <strong>セット間</strong>: 前セットの反省と次セットの戦略立案</li>
                  <li>• <strong>選手交代</strong>: パフォーマンスが低い選手を交代</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ6: AI分析 */}
        <Card id="ai" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-pink-600" />
              🤖 ステップ6: AI分析
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Gemini APIを使用したAI分析機能で、戦術的な示唆を得ることができます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI分析の種類</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">🎯 攻撃パターン分析</h5>
                    <p className="text-gray-700 text-sm">自チームの攻撃パターンを分析し、効果的な攻撃方法を提案</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <h5 className="font-semibold text-red-900">🛡️ 相手チームの弱点発見</h5>
                    <p className="text-gray-700 text-sm">相手チームのデータから弱点エリアや守備の穴を特定</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">👥 選手別パフォーマンス評価</h5>
                    <p className="text-gray-700 text-sm">各選手のパフォーマンスを評価し、改善点を提案</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900">💡 戦術提案</h5>
                    <p className="text-gray-700 text-sm">試合状況に応じた具体的な戦術を提案</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900">📈 トレンド分析</h5>
                    <p className="text-gray-700 text-sm">複数試合のデータから長期的なトレンドを分析</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">使い方</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>コーチビュー画面で「AI分析」ボタンをクリック</li>
                  <li>分析したい項目を選択</li>
                  <li>「分析開始」ボタンをクリック</li>
                  <li>数秒で分析結果が表示されます</li>
                </ol>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">💡 推奨タイミング</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>タイムアウト時</strong>: 即座に戦術を調整</li>
                  <li>• <strong>セット間</strong>: 次セットの戦略を立案</li>
                  <li>• <strong>試合後</strong>: 詳細な分析レポートを作成</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ステップ7: ヒートマップ */}
        <Card id="heatmap" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Map className="h-6 w-6 text-teal-600" />
              🗺️ ステップ7: ヒートマップ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                ヒートマップ機能で、攻撃・サーブ・レシーブの位置を可視化できます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">ヒートマップの種類</h4>
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded">
                    <h5 className="font-semibold text-red-900">⚡ アタックヒートマップ</h5>
                    <p className="text-gray-700 text-sm">どのエリアから攻撃が多いか、決定率が高いエリアはどこかを表示</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">🏐 サーブヒートマップ</h5>
                    <p className="text-gray-700 text-sm">サーブの狙いどころ、エース率が高いエリアを表示</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">🛡️ レシーブヒートマップ</h5>
                    <p className="text-gray-700 text-sm">レシーブの成功率が高い/低いエリアを表示</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">見方</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong className="text-red-600">赤色</strong>: 頻度が高い、または成功率が高いエリア</li>
                  <li>• <strong className="text-blue-600">青色</strong>: 頻度が低い、または成功率が低いエリア</li>
                  <li>• <strong>円の大きさ</strong>: プレー回数の多さを表す</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">💡 活用方法</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>相手の弱点発見</strong>: 相手のレシーブが弱いエリアを狙う</li>
                  <li>• <strong>自チームの改善</strong>: 攻撃が偏っている場合、バリエーションを増やす</li>
                  <li>• <strong>選手の特徴把握</strong>: 各選手の得意エリアを把握</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* その他の機能 */}
        <Card id="other" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <SettingsIcon className="h-6 w-6 text-gray-600" />
              ⚙️ その他の機能
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-semibold text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF出力
                </h5>
                <p className="text-gray-700 text-sm">試合レポートをPDF形式でエクスポート。印刷して配布できます。</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h5 className="font-semibold text-green-900 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  リアルタイム同期
                </h5>
                <p className="text-gray-700 text-sm">複数デバイスで同時に閲覧・入力可能。データは自動的に同期されます。</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <h5 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  スターティングラインナップ
                </h5>
                <p className="text-gray-700 text-sm">試合開始前にスターティングメンバーを登録。ローテーションを管理できます。</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <h5 className="font-semibold text-yellow-900 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  試合比較
                </h5>
                <p className="text-gray-700 text-sm">複数の試合を比較して、チームの成長を確認できます。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 活用のコツ */}
        <Card id="tips" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-amber-600" />
              💡 活用のコツ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">試合前</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>✅ チームと選手を事前に登録</li>
                  <li>✅ データ入力担当者を決める</li>
                  <li>✅ 試合コードを関係者に共有</li>
                  <li>✅ デバイスの充電を確認</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">試合中</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>✅ データ入力担当者: 高速入力に集中</li>
                  <li>✅ コーチ: コーチビューで統計を確認</li>
                  <li>✅ タイムアウト時: AI分析で戦術を調整</li>
                  <li>✅ セット間: ヒートマップで弱点を確認</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">試合後</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>✅ PDF出力して選手に配布</li>
                  <li>✅ AI分析で詳細なレポートを作成</li>
                  <li>✅ 次の練習メニューに反映</li>
                  <li>✅ 選手個別にフィードバック</li>
                </ul>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">🎯 役割分担の例</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>データ入力担当者</strong>: ベンチでタブレットを使ってプレーを記録</li>
                  <li>• <strong>コーチ</strong>: スマホでコーチビューを見ながら指示</li>
                  <li>• <strong>分析担当者</strong>: ノートPCでヒートマップやAI分析を確認</li>
                  <li>• <strong>選手</strong>: 試合後にスマホで自分の統計を確認</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* よくある質問 */}
        <Card id="faq" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <HelpCircle className="h-6 w-6 text-rose-600" />
              ❓ よくある質問
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Q1. 複数のデバイスで同時に使えますか？</h4>
                <p className="text-gray-700 mt-1">A. はい、試合コードを使って複数のデバイスで同時に閲覧・入力できます。データはリアルタイムで同期されます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q2. オフラインでも使えますか？</h4>
                <p className="text-gray-700 mt-1">A. 現在はオンライン専用です。インターネット接続が必要です。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q3. データはどこに保存されますか？</h4>
                <p className="text-gray-700 mt-1">A. データは安全なクラウドサーバーに保存されます。ログインすればどのデバイスからでもアクセスできます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q4. 試合コードを忘れてしまいました</h4>
                <p className="text-gray-700 mt-1">A. ホームページの「最近の試合」から試合を選択できます。また、チーム管理画面からも過去の試合にアクセスできます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q5. 入力を間違えた場合、修正できますか？</h4>
                <p className="text-gray-700 mt-1">A. はい、データ入力画面で「履歴」ボタンから過去のプレーを編集・削除できます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q6. AI分析は無料ですか？</h4>
                <p className="text-gray-700 mt-1">A. 現在は無料で利用できます。ただし、将来的に制限が設けられる可能性があります。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center py-8">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
