import type { Play, Player } from "./contextPredictor";

/**
 * プレーパターン学習エンジン
 * 試合中のプレーデータを分析し、チーム別・ローテーション別の傾向を学習
 */

interface PlayPattern {
  fromType: string;
  toType: string;
  count: number;
  successRate: number;
}

interface PlayerPattern {
  playerId: number;
  playType: string;
  count: number;
  successRate: number;
  averagePosition: { x: number; y: number };
}

interface RotationPattern {
  rotation: number;
  commonPlays: { playType: string; count: number }[];
  preferredPlayers: { playerId: number; count: number }[];
}

interface TeamLearningData {
  playPatterns: PlayPattern[];
  playerPatterns: PlayerPattern[];
  rotationPatterns: RotationPattern[];
  lastUpdated: number;
}

const LEARNING_STORAGE_KEY = "victor_learning_data";

/**
 * プレーパターンを分析して学習データを更新
 */
export function analyzeAndLearn(plays: Play[], teamSide: "home" | "away"): void {
  const learningData = getLearningData(teamSide);

  // プレーシーケンスパターンの学習
  for (let i = 0; i < plays.length - 1; i++) {
    const currentPlay = plays[i];
    const nextPlay = plays[i + 1];

    if (currentPlay.teamSide === teamSide && nextPlay.teamSide === teamSide) {
      updatePlayPattern(learningData, currentPlay.playType, nextPlay.playType, nextPlay.result);
    }
  }

  // 選手別パターンの学習
  plays
    .filter(p => p.teamSide === teamSide)
    .forEach(play => {
      updatePlayerPattern(learningData, play);
    });

  // ローテーション別パターンの学習（簡易実装）
  // 実際のローテーション情報がない場合は、プレー数を6で割った余りを使用
  plays
    .filter(p => p.teamSide === teamSide)
    .forEach((play, index) => {
      const rotation = Math.floor(index / 6) % 6;
      updateRotationPattern(learningData, rotation, play);
    });

  learningData.lastUpdated = Date.now();
  saveLearningData(teamSide, learningData);
}

/**
 * 学習データを使用して予測精度を向上
 */
export function getPredictionWithLearning(
  baseConfidence: number,
  playType: string,
  playerId: number | undefined,
  recentPlays: Play[],
  teamSide: "home" | "away"
): number {
  const learningData = getLearningData(teamSide);

  let confidenceBoost = 0;

  // 最近のプレーパターンとの一致度をチェック
  if (recentPlays.length > 0) {
    const lastPlay = recentPlays[recentPlays.length - 1];
    const matchingPattern = learningData.playPatterns.find(
      p => p.fromType === lastPlay.playType && p.toType === playType
    );

    if (matchingPattern && matchingPattern.count >= 3) {
      // パターンが3回以上出現している場合、信頼度を上げる
      confidenceBoost += 0.15 * (matchingPattern.successRate / 100);
    }
  }

  // 選手別パターンとの一致度をチェック
  if (playerId) {
    const matchingPlayerPattern = learningData.playerPatterns.find(
      p => p.playerId === playerId && p.playType === playType
    );

    if (matchingPlayerPattern && matchingPlayerPattern.count >= 5) {
      // 選手が5回以上同じプレーをしている場合、信頼度を上げる
      confidenceBoost += 0.10 * (matchingPlayerPattern.successRate / 100);
    }
  }

  // 学習データの鮮度に応じて信頼度を調整
  const dataAge = Date.now() - learningData.lastUpdated;
  const freshnessMultiplier = dataAge < 300000 ? 1.0 : 0.8; // 5分以内なら100%、それ以降は80%

  return Math.min(baseConfidence + confidenceBoost * freshnessMultiplier, 0.95);
}

/**
 * プレーパターンを更新
 */
function updatePlayPattern(
  learningData: TeamLearningData,
  fromType: string,
  toType: string,
  result: string
): void {
  const existingPattern = learningData.playPatterns.find(
    p => p.fromType === fromType && p.toType === toType
  );

  const isSuccess = result === "point" || result === "continue";

  if (existingPattern) {
    existingPattern.count++;
    existingPattern.successRate =
      (existingPattern.successRate * (existingPattern.count - 1) + (isSuccess ? 100 : 0)) /
      existingPattern.count;
  } else {
    learningData.playPatterns.push({
      fromType,
      toType,
      count: 1,
      successRate: isSuccess ? 100 : 0,
    });
  }
}

/**
 * 選手別パターンを更新
 */
function updatePlayerPattern(learningData: TeamLearningData, play: Play): void {
  const existingPattern = learningData.playerPatterns.find(
    p => p.playerId === play.playerId && p.playType === play.playType
  );

  const isSuccess = play.result === "point" || play.result === "continue";

  if (existingPattern) {
    existingPattern.count++;
    existingPattern.successRate =
      (existingPattern.successRate * (existingPattern.count - 1) + (isSuccess ? 100 : 0)) /
      existingPattern.count;

    // 平均位置を更新
    if (play.positionX !== undefined && play.positionY !== undefined) {
      existingPattern.averagePosition.x =
        (existingPattern.averagePosition.x * (existingPattern.count - 1) + play.positionX) /
        existingPattern.count;
      existingPattern.averagePosition.y =
        (existingPattern.averagePosition.y * (existingPattern.count - 1) + play.positionY) /
        existingPattern.count;
    }
  } else {
    learningData.playerPatterns.push({
      playerId: play.playerId,
      playType: play.playType,
      count: 1,
      successRate: isSuccess ? 100 : 0,
      averagePosition: {
        x: play.positionX || 0,
        y: play.positionY || 0,
      },
    });
  }
}

/**
 * ローテーション別パターンを更新
 */
function updateRotationPattern(
  learningData: TeamLearningData,
  rotation: number,
  play: Play
): void {
  let rotationPattern = learningData.rotationPatterns.find(r => r.rotation === rotation);

  if (!rotationPattern) {
    rotationPattern = {
      rotation,
      commonPlays: [],
      preferredPlayers: [],
    };
    learningData.rotationPatterns.push(rotationPattern);
  }

  // 共通プレーを更新
  const existingPlay = rotationPattern.commonPlays.find(p => p.playType === play.playType);
  if (existingPlay) {
    existingPlay.count++;
  } else {
    rotationPattern.commonPlays.push({ playType: play.playType, count: 1 });
  }

  // 優先選手を更新
  const existingPlayer = rotationPattern.preferredPlayers.find(p => p.playerId === play.playerId);
  if (existingPlayer) {
    existingPlayer.count++;
  } else {
    rotationPattern.preferredPlayers.push({ playerId: play.playerId, count: 1 });
  }
}

/**
 * 学習データを取得
 */
function getLearningData(teamSide: "home" | "away"): TeamLearningData {
  const key = `${LEARNING_STORAGE_KEY}_${teamSide}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // パースエラーの場合は新しいデータを返す
    }
  }

  return {
    playPatterns: [],
    playerPatterns: [],
    rotationPatterns: [],
    lastUpdated: Date.now(),
  };
}

/**
 * 学習データを保存
 */
function saveLearningData(teamSide: "home" | "away", data: TeamLearningData): void {
  const key = `${LEARNING_STORAGE_KEY}_${teamSide}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 学習データをクリア
 */
export function clearLearningData(teamSide?: "home" | "away"): void {
  if (teamSide) {
    const key = `${LEARNING_STORAGE_KEY}_${teamSide}`;
    localStorage.removeItem(key);
  } else {
    localStorage.removeItem(`${LEARNING_STORAGE_KEY}_home`);
    localStorage.removeItem(`${LEARNING_STORAGE_KEY}_away`);
  }
}
