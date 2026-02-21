import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Users, Trophy, Activity, Target, Brain, Map, Settings as SettingsIcon, FileText, HelpCircle, Smartphone, Monitor, ClipboardEdit } from "lucide-react";

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
          <p className="text-lg text-gray-600">VICTORの基本的な使い方をステップごとに説明します</p>
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
              <a href="#intro" className="text-blue-600 hover:underline py-1">1. はじめに - VICTORとは？</a>
              <a href="#flow" className="text-blue-600 hover:underline py-1">2. 基本的な流れ</a>
              <a href="#team" className="text-blue-600 hover:underline py-1">3. チームと選手の登録</a>
              <a href="#match" className="text-blue-600 hover:underline py-1">4. 試合を作成する</a>
              <a href="#data" className="text-blue-600 hover:underline py-1">5. データを入力する</a>
              <a href="#coach" className="text-blue-600 hover:underline py-1">6. コーチビューで分析する</a>
              <a href="#ai" className="text-blue-600 hover:underline py-1">7. AI分析を活用する</a>
              <a href="#heatmap" className="text-blue-600 hover:underline py-1">8. ヒートマップを見る</a>
              <a href="#roles" className="text-blue-600 hover:underline py-1">9. 役割分担のススメ</a>
              <a href="#tips" className="text-blue-600 hover:underline py-1">10. 活用のコツ</a>
              <a href="#faq" className="text-blue-600 hover:underline py-1">11. よくある質問</a>
            </div>
          </CardContent>
        </Card>

        {/* 1. はじめに */}
        <Card id="intro" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              1. はじめに - VICTORとは？
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>VICTOR</strong>（Volleyball Intelligent Coach and Tactical Optimization Resource）は、バレーボールの試合をリアルタイムで記録・分析するためのシステムです。
              スマホやタブレットから簡単に操作でき、試合中のデータ入力からAI分析まで一貫して行えます。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-900 mb-3">VICTORでできること</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <ClipboardEdit className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-sm">高速データ入力</strong>
                    <p className="text-xs text-gray-600">1プレー3-4タップで記録完了</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-sm">リアルタイム統計</strong>
                    <p className="text-xs text-gray-600">複数端末で同時閲覧可能</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-sm">AI戦術分析</strong>
                    <p className="text-xs text-gray-600">Gemini AIが戦術を提案</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Map className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-sm">ヒートマップ</strong>
                    <p className="text-xs text-gray-600">攻撃・サーブの位置を可視化</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. 基本的な流れ */}
        <Card id="flow" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-green-600" />
              2. 基本的な流れ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">VICTORの基本的な使い方は以下の5ステップです。</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900">チームと選手を登録する</h4>
                  <p className="text-sm text-gray-600">「チーム管理」からチーム名と選手（背番号・名前・ポジション）を登録します。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900">試合を作成する</h4>
                  <p className="text-sm text-gray-600">「新しい試合を開始」から自チーム・相手チーム名・セット数を設定します。8桁の試合コードが発行されます。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-orange-200">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900">試合中にデータを入力する</h4>
                  <p className="text-sm text-gray-600">データ入力画面で、プレーの種類→選手→コート位置→結果をタップして記録します。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-900">コーチビューで統計を確認する</h4>
                  <p className="text-sm text-gray-600">コーチや他のスタッフは試合コードでコーチビューにアクセスし、リアルタイムで統計を確認します。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-pink-200">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">5</div>
                <div>
                  <h4 className="font-bold text-gray-900">AI分析・ヒートマップで深掘りする</h4>
                  <p className="text-sm text-gray-600">タイムアウトやセット間にAI分析を実行。試合後にヒートマップやPDFレポートを確認します。</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. チーム管理 */}
        <Card id="team" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-orange-600" />
              3. チームと選手の登録
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">チームの作成</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページの<strong>「チーム管理」</strong>ボタンをクリック</li>
                  <li><strong>「新しいチームを作成」</strong>ボタンをクリック</li>
                  <li>チーム名（例：茗溪学園男子バレー部）とシーズン（例：2026）を入力</li>
                  <li><strong>「チームを作成」</strong>ボタンをクリック</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">選手の登録</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>チーム一覧から対象のチームをクリック</li>
                  <li><strong>「選手を追加」</strong>ボタンをクリック</li>
                  <li>背番号、選手名、ポジション（S/MB/WS/OP/L）を入力</li>
                  <li><strong>「選手を追加」</strong>ボタンをクリック</li>
                  <li>全選手分を繰り返します（後から追加・編集も可能）</li>
                </ol>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">ポイント</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ ポジションは統計表示やAI分析で使用されるので正確に入力しましょう</li>
                  <li>・ リベロの選手は「L」ポジションを選択してください</li>
                  <li>・ 選手は後からいつでも追加・編集・削除できます</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. 試合作成 */}
        <Card id="match" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-red-600" />
              4. 試合を作成する
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">新しい試合を作成</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>ホームページの<strong>「新しい試合を開始」</strong>ボタンをクリック</li>
                  <li>自チームをドロップダウンから選択</li>
                  <li>相手チーム名を入力（例：○○高校）</li>
                  <li>セット数（3セット制 or 5セット制）を選択</li>
                  <li><strong>「試合を作成」</strong>ボタンをクリック</li>
                  <li><strong>8桁の試合コード</strong>が表示されます</li>
                </ol>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">試合コードとは？</h4>
                <p className="text-gray-700 mb-2">試合コードは、同じ試合を複数のデバイスで共有するための8桁のコードです。</p>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ <strong>データ入力担当</strong>：試合作成後に自動で入力画面に遷移します</li>
                  <li>・ <strong>コーチ・他のスタッフ</strong>：ホーム画面で試合コードを入力して「参加」をクリック</li>
                  <li>・ 試合コードはメモするか、LINEなどで共有してください</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. データ入力 */}
        <Card id="data" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-6 w-6 text-cyan-600" />
              5. データを入力する
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                データ入力画面では、試合中のプレーを高速で記録できます。<strong>1プレーあたり3-4タップ</strong>で完結します。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">プレーの記録方法</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">サーブ</h5>
                    <p className="text-gray-700 text-sm">「サーブ」→ 選手を選択 → コート位置をタップ → 結果（エース/イン/アウト等）を選択</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">アタック</h5>
                    <p className="text-gray-700 text-sm">「アタック」→ 選手を選択 → コート位置をタップ → 結果（得点/ブロック/アウト等）を選択</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900">ブロック</h5>
                    <p className="text-gray-700 text-sm">「ブロック」→ 選手を選択 → 結果（成功/タッチ/失敗）を選択</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900">レシーブ / ディグ</h5>
                    <p className="text-gray-700 text-sm">「レシーブ」or「ディグ」→ 選手を選択 → 評価（A/B/C）を選択</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">高速入力のコツ</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ <strong>背番号で選手を選択</strong>すると速い（名前を読む必要なし）</li>
                  <li>・ <strong>コート位置は大まかでOK</strong>：正確さより入力速度を優先</li>
                  <li>・ <strong>音声入力を活用</strong>：「7番アタック成功」のように話すだけで記録</li>
                  <li>・ <strong>セット終了時</strong>は「セット終了」ボタンで次のセットに切り替え</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. コーチビュー */}
        <Card id="coach" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-indigo-600" />
              6. コーチビューで分析する
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                コーチビューでは、試合中にリアルタイムで統計情報を確認できます。データ入力と同時に自動更新されます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">表示される統計情報</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900 text-sm">基本統計</h5>
                    <p className="text-gray-700 text-xs">得点・失点、サーブ成功率、アタック決定率、ブロック成功数</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900 text-sm">選手別統計</h5>
                    <p className="text-gray-700 text-xs">個人得点、アタック決定率、サーブ成功率、レシーブ評価</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900 text-sm">相手分析</h5>
                    <p className="text-gray-700 text-xs">相手の弱点エリア、攻撃パターン、サーブの傾向</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900 text-sm">トレンド</h5>
                    <p className="text-gray-700 text-xs">得点推移グラフ、ラリー数の分布、セット別パフォーマンス</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">活用シーン</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ <strong>タイムアウト時</strong>：統計を見て戦術を調整</li>
                  <li>・ <strong>セット間</strong>：前セットの反省と次セットの戦略立案</li>
                  <li>・ <strong>選手交代の判断</strong>：パフォーマンスが低い選手を交代</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. AI分析 */}
        <Card id="ai" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-pink-600" />
              7. AI分析を活用する
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Gemini AIを使用した分析機能で、データに基づいた戦術的な示唆を得ることができます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">使い方</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>コーチビュー画面で<strong>「AI分析」</strong>ボタンをクリック</li>
                  <li>分析したい項目（攻撃パターン、弱点分析、戦術提案など）を選択</li>
                  <li><strong>「分析開始」</strong>ボタンをクリック</li>
                  <li>数秒で分析結果が表示されます</li>
                </ol>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">おすすめのタイミング</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ <strong>タイムアウト時</strong>：即座に戦術を調整するヒントを得る</li>
                  <li>・ <strong>セット間</strong>：次セットの戦略を立案する</li>
                  <li>・ <strong>試合後</strong>：詳細な分析レポートを作成して振り返る</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI分析を使うには</h4>
                <p className="text-gray-700 text-sm">
                  AI分析を使用するには、設定画面でGemini APIキーを登録する必要があります。
                  ホーム画面の「設定」→「APIキー管理」からAPIキーを登録してください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. ヒートマップ */}
        <Card id="heatmap" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Map className="h-6 w-6 text-teal-600" />
              8. ヒートマップを見る
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                ヒートマップ機能で、攻撃・サーブ・レシーブの位置をコート上に可視化できます。
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">見方</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>・ <strong className="text-red-600">赤色</strong>：頻度が高い / 成功率が高いエリア</li>
                  <li>・ <strong className="text-blue-600">青色</strong>：頻度が低い / 成功率が低いエリア</li>
                  <li>・ <strong>円の大きさ</strong>：プレー回数の多さを表す</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">活用方法</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>・ 相手のレシーブが弱いエリアを狙う</li>
                  <li>・ 攻撃が偏っている場合、バリエーションを増やす</li>
                  <li>・ 各選手の得意エリアを把握する</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 9. 役割分担 */}
        <Card id="roles" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Smartphone className="h-6 w-6 text-gray-600" />
              9. 役割分担のススメ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                VICTORは複数のデバイスで同時に使えるため、役割を分担すると効果的です。
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <ClipboardEdit className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-blue-900">データ入力担当（マネージャー等）</h5>
                    <p className="text-gray-700 text-sm">ベンチでタブレットやスマホを使い、プレーを記録します。入力に集中できる人が適任です。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <Monitor className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-green-900">コーチ</h5>
                    <p className="text-gray-700 text-sm">スマホでコーチビューを見ながら、リアルタイムの統計を元に指示を出します。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-purple-900">分析担当</h5>
                    <p className="text-gray-700 text-sm">ノートPCでヒートマップやAI分析を確認し、タイムアウト時にコーチに情報を伝えます。</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 10. 活用のコツ */}
        <Card id="tips" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-amber-600" />
              10. 活用のコツ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">試合前</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>・ チームと選手を事前に登録</li>
                    <li>・ データ入力担当者を決める</li>
                    <li>・ 試合コードを関係者に共有</li>
                    <li>・ デバイスの充電を確認</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">試合中</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>・ 入力担当は高速入力に集中</li>
                    <li>・ コーチはコーチビューで確認</li>
                    <li>・ タイムアウト時にAI分析</li>
                    <li>・ セット間にヒートマップ確認</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">試合後</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>・ PDF出力して選手に配布</li>
                    <li>・ AI分析で詳細レポート作成</li>
                    <li>・ 次の練習メニューに反映</li>
                    <li>・ 選手個別にフィードバック</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 11. よくある質問 */}
        <Card id="faq" className="mb-8 scroll-mt-20">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <HelpCircle className="h-6 w-6 text-rose-600" />
              11. よくある質問
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-gray-900">Q. 複数のデバイスで同時に使えますか？</h4>
                <p className="text-gray-700 mt-1 text-sm">はい。試合コードを使って複数のデバイスで同時に閲覧・入力できます。データはリアルタイムで同期されます。</p>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-gray-900">Q. オフラインでも使えますか？</h4>
                <p className="text-gray-700 mt-1 text-sm">現在はオンライン専用です。Wi-Fiまたはモバイルデータ通信が必要です。</p>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-gray-900">Q. データはどこに保存されますか？</h4>
                <p className="text-gray-700 mt-1 text-sm">データはクラウドサーバーに安全に保存されます。どのデバイスからでもアクセスできます。</p>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-gray-900">Q. 試合コードを忘れてしまいました</h4>
                <p className="text-gray-700 mt-1 text-sm">ホームページの「最近の試合」セクションから過去の試合にアクセスできます。</p>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-gray-900">Q. 入力を間違えた場合、修正できますか？</h4>
                <p className="text-gray-700 mt-1 text-sm">はい。データ入力画面の「履歴」ボタンから過去のプレーを編集・削除できます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Q. AI分析を使うにはどうすればいいですか？</h4>
                <p className="text-gray-700 mt-1 text-sm">設定画面でGemini APIキーを登録してください。登録後、コーチビューからAI分析が利用可能になります。</p>
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
