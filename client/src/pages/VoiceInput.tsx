import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Mic, MicOff, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * 超高速音声入力システム
 * 
 * ラリースピードに追いつくための設計：
 * 1. 背番号を音声で言う（「15番」「3番」）→自動認識
 * 2. プレータイプをタップ（サーブ、アタック、ブロックなど）
 * 3. 結果をタップ（得点、エラー、継続）
 * 4. 即座に記録＆次のプレーへ
 */

type PlayType = "serve" | "receive" | "set" | "attack" | "block" | "dig";
type PlayResult = "point" | "error" | "continue";

export default function VoiceInput() {
  const { matchId } = useParams();

  // 音声認識の状態
  const [isListening, setIsListening] = useState(false);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // 入力状態
  const [selectedPlayType, setSelectedPlayType] = useState<PlayType | null>(null);
  const [recentPlays, setRecentPlays] = useState<Array<{
    playerNumber: number;
    playType: PlayType;
    result: PlayResult;
    timestamp: Date;
  }>>([]);

  // 試合情報を取得
  const { data: match, refetch: refetchMatch } = trpc.matches.getById.useQuery({ matchId: Number(matchId) });

  // プレー作成ミューテーション
  const createPlayMutation = trpc.plays.create.useMutation();

  // ブラウザ対応チェック
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      return;
    }

    const hasWebkitSpeech = "webkitSpeechRecognition" in window;
    const hasSpeech = "SpeechRecognition" in window;
    
    if (!hasWebkitSpeech && !hasSpeech) {
      setIsSupported(false);
      toast.error("このブラウザは音声認識に対応していません");
    }
  }, []);

  // 背番号抽出関数
  const extractPlayerNumber = (text: string): number | null => {
    // 「15番」「3番」「番号15」などから数字を抽出
    const match = text.match(/(\d+)\s*番|番号\s*(\d+)/);
    if (match) {
      const num = parseInt(match[1] || match[2]);
      if (num >= 1 && num <= 99) {
        return num;
      }
    }
    
    // 単純な数字のみの場合
    const simpleMatch = text.match(/^(\d+)$/);
    if (simpleMatch) {
      const num = parseInt(simpleMatch[1]);
      if (num >= 1 && num <= 99) {
        return num;
      }
    }
    
    return null;
  };

  // 録音開始
  const startListening = async () => {
    if (!isSupported) {
      toast.error("このブラウザは音声認識に対応していません");
      return;
    }

    // マイク許可をチェック
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error("マイクの使用が許可されていません");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ja-JP";

      recognition.onstart = () => {
        console.log("音声認識開始");
        setIsListening(true);
        toast.success("音声認識開始");
      };

      recognition.onresult = (event: any) => {
        let latestTranscript = "";
        
        // 最新の結果のみを取得
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            latestTranscript = transcript;
            console.log("確定文字起こし:", transcript);
            
            // 背番号を抽出
            const number = extractPlayerNumber(transcript);
            if (number !== null) {
              setPlayerNumber(number);
              toast.success(`#${number}を認識しました`, { duration: 1000 });
              console.log("背番号抽出:", number);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        // エラーログを抑制（ネットワークエラーは頻発するため）
        
        if (event.error === "no-speech") {
          // 無音状態は無視
          return;
        } else if (event.error === "network") {
          // ネットワークエラーは自動再接続せず、停止する
          setIsListening(false);
          toast.error("音声認識が利用できません。手動で再開してください。", { duration: 3000 });
        } else if (event.error === "not-allowed") {
          toast.error("マイクの使用が許可されていません");
          setIsListening(false);
        } else if (event.error === "aborted") {
          // 中断は正常な停止なので無視
          return;
        }
      };

      recognition.onend = () => {
        // 自動再開はisListeningがtrueの場合のみ
        // エラーで停止した場合は再開しない
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            // 再開失敗時は静かに停止
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("開始エラー:", e);
    }
  };

  // 録音停止
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info("音声認識停止");
    }
  };

  // プレーを記録
  const recordPlay = async (playType: PlayType, result: PlayResult) => {
    if (playerNumber === null) {
      toast.error("背番号を音声で言ってください");
      return;
    }

    try {
      await createPlayMutation.mutateAsync({
        matchId: Number(matchId),
        playType,
        result,
        teamSide: "home",
        playerId: playerNumber,
        setNumber: 1,
        rallyNumber: 1,
        positionX: 0,
        positionY: 0,
      });

      // 最近のプレーに追加
      setRecentPlays((prev) => [
        { playerNumber, playType, result, timestamp: new Date() },
        ...prev.slice(0, 4),
      ]);

      // スコア更新
      refetchMatch();

      // 成功通知
      const playTypeText = {
        serve: "サーブ",
        receive: "レシーブ",
        set: "セット",
        attack: "アタック",
        block: "ブロック",
        dig: "ディグ",
      }[playType];
      
      const resultText = {
        point: "得点",
        error: "エラー",
        continue: "継続",
      }[result];

      toast.success(`#${playerNumber} ${playTypeText} ${resultText}`, { duration: 1500 });

      // リセット
      setPlayerNumber(null);
      setSelectedPlayType(null);

    } catch (error) {
      console.error("記録エラー:", error);
      toast.error("記録に失敗しました");
    }
  };

  // プレータイプボタンクリック
  const handlePlayTypeClick = (playType: PlayType) => {
    if (playerNumber === null) {
      toast.error("背番号を音声で言ってください");
      return;
    }
    setSelectedPlayType(playType);
  };

  // 結果ボタンクリック
  const handleResultClick = (result: PlayResult) => {
    if (selectedPlayType === null) {
      toast.error("プレータイプを選択してください");
      return;
    }
    recordPlay(selectedPlayType, result);
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!match) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const playTypes: Array<{ type: PlayType; label: string; color: string }> = [
    { type: "serve", label: "サーブ", color: "bg-blue-500 hover:bg-blue-600" },
    { type: "receive", label: "レシーブ", color: "bg-green-500 hover:bg-green-600" },
    { type: "set", label: "セット", color: "bg-purple-500 hover:bg-purple-600" },
    { type: "attack", label: "アタック", color: "bg-red-500 hover:bg-red-600" },
    { type: "block", label: "ブロック", color: "bg-orange-500 hover:bg-orange-600" },
    { type: "dig", label: "ディグ", color: "bg-yellow-500 hover:bg-yellow-600" },
  ];

  const results: Array<{ result: PlayResult; label: string; color: string }> = [
    { result: "point", label: "得点", color: "bg-emerald-500 hover:bg-emerald-600" },
    { result: "error", label: "エラー", color: "bg-rose-500 hover:bg-rose-600" },
    { result: "continue", label: "継続", color: "bg-slate-500 hover:bg-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/input/${matchId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">超高速音声入力</h1>
              <p className="text-sm text-gray-500">
                {match.homeTeamName} vs {match.awayTeamName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {Array.isArray(match.scoreHome) ? match.scoreHome.reduce((a: number, b: number) => a + b, 0) : 0}
            </span>
            <span className="text-gray-400">-</span>
            <span className="text-2xl font-bold">
              {Array.isArray(match.scoreAway) ? match.scoreAway.reduce((a: number, b: number) => a + b, 0) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-4">
        {/* 録音コントロール */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isListening ? (
                <Button
                  size="lg"
                  onClick={startListening}
                  disabled={!isSupported}
                  className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <Mic className="w-6 h-6 mr-2" />
                  録音開始
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={stopListening}
                  className="bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                >
                  <MicOff className="w-6 h-6 mr-2" />
                  停止
                </Button>
              )}
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-600">録音中</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">背番号を音声で言ってください</p>
              <p className="text-xs text-gray-400">例：「15番」「3番」</p>
            </div>
          </div>
        </Card>

        {/* 背番号表示 */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">認識した背番号</p>
            {playerNumber !== null ? (
              <div className="text-6xl font-bold text-blue-600">#{playerNumber}</div>
            ) : (
              <div className="text-4xl text-gray-400">---</div>
            )}
          </div>
        </Card>

        {/* プレータイプ選択 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">1. プレータイプを選択</h3>
          <div className="grid grid-cols-2 gap-3">
            {playTypes.map(({ type, label, color }) => (
              <Button
                key={type}
                size="lg"
                onClick={() => handlePlayTypeClick(type)}
                className={`h-16 text-lg ${selectedPlayType === type ? 'ring-4 ring-blue-400' : ''} ${color}`}
                disabled={playerNumber === null}
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 結果選択 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">2. 結果を選択</h3>
          <div className="grid grid-cols-3 gap-3">
            {results.map(({ result, label, color }) => (
              <Button
                key={result}
                size="lg"
                onClick={() => handleResultClick(result)}
                className={`h-16 text-lg ${color}`}
                disabled={selectedPlayType === null}
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 最近のプレー */}
        {recentPlays.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">最近のプレー</h3>
              <Button variant="ghost" size="sm" onClick={() => setRecentPlays([])}>
                <Trash2 className="w-4 h-4 mr-1" />
                クリア
              </Button>
            </div>
            <div className="space-y-2">
              {recentPlays.map((play, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">#{play.playerNumber}</span>
                    <span className="text-gray-600">{
                      { serve: "サーブ", receive: "レシーブ", set: "セット", attack: "アタック", block: "ブロック", dig: "ディグ" }[play.playType]
                    }</span>
                    <span className={`font-semibold ${
                      play.result === "point" ? "text-green-600" : play.result === "error" ? "text-red-600" : "text-gray-600"
                    }`}>
                      {{ point: "得点", error: "エラー", continue: "継続" }[play.result]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {play.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
