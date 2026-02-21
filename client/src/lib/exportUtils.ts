import * as XLSX from "xlsx";

// 試合データをExcel形式でエクスポート
export function exportMatchToExcel(matchData: any, plays: any[]) {
  const wb = XLSX.utils.book_new();

  // 試合情報シート
  const matchInfo = [
    ["試合情報"],
    ["日付", new Date(matchData.date).toLocaleDateString("ja-JP")],
    ["会場", matchData.venue || "-"],
    ["ホームチーム", matchData.homeTeamName],
    ["アウェイチーム", matchData.awayTeamName],
    ["最終スコア", `${(matchData.scoreHome || []).reduce((a: number, b: number) => a + b, 0)} - ${(matchData.scoreAway || []).reduce((a: number, b: number) => a + b, 0)}`],
    ["セットスコア(H)", (matchData.scoreHome || []).join(", ") || "-"],
    ["セットスコア(A)", (matchData.scoreAway || []).join(", ") || "-"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(matchInfo);
  XLSX.utils.book_append_sheet(wb, ws1, "試合情報");

  // プレー記録シート
  if (plays && plays.length > 0) {
    const playsData = plays.map((play: any) => ({
      時刻: new Date(play.timestamp).toLocaleTimeString("ja-JP"),
      チーム: play.teamSide === "home" ? matchData.homeTeamName : matchData.awayTeamName,
      選手番号: play.playerNumber || "-",
      選手名: play.playerName || "-",
      プレータイプ: play.playType,
      結果: play.result,
      X座標: play.positionX.toFixed(2),
      Y座標: play.positionY.toFixed(2),
    }));
    const ws2 = XLSX.utils.json_to_sheet(playsData);
    XLSX.utils.book_append_sheet(wb, ws2, "プレー記録");

    // チーム別統計シート
    const homeStats = calculateTeamStats(plays, "home", matchData.homeTeamName);
    const awayStats = calculateTeamStats(plays, "away", matchData.awayTeamName);
    const teamStatsData = [
      ["項目", matchData.homeTeamName, matchData.awayTeamName],
      ["総プレー数", homeStats.totalPlays, awayStats.totalPlays],
      ["得点数", homeStats.points, awayStats.points],
      ["攻撃成功率", `${homeStats.attackRate}%`, `${awayStats.attackRate}%`],
      ["サーブエース", homeStats.serveAce, awayStats.serveAce],
      ["サーブミス", homeStats.serveError, awayStats.serveError],
      ["レシーブ成功率", `${homeStats.receiveRate}%`, `${awayStats.receiveRate}%`],
      ["ブロック得点", homeStats.blockPoints, awayStats.blockPoints],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(teamStatsData);
    XLSX.utils.book_append_sheet(wb, ws3, "チーム別統計");

    // 選手別統計シート（ホーム）
    const homePlayers = getPlayerStats(plays, "home");
    if (homePlayers.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(homePlayers);
      XLSX.utils.book_append_sheet(wb, ws4, `選手統計_${matchData.homeTeamName}`);
    }

    // 選手別統計シート（アウェイ）
    const awayPlayers = getPlayerStats(plays, "away");
    if (awayPlayers.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(awayPlayers);
      XLSX.utils.book_append_sheet(wb, ws5, `選手統計_${matchData.awayTeamName}`);
    }

    // プレータイプ別分析シート
    const playTypeStats = getPlayTypeStats(plays, matchData);
    const ws6 = XLSX.utils.json_to_sheet(playTypeStats);
    XLSX.utils.book_append_sheet(wb, ws6, "プレータイプ別分析");

    // 得失点推移シート
    const scoreProgression = getScoreProgression(plays, matchData);
    const ws7 = XLSX.utils.json_to_sheet(scoreProgression);
    XLSX.utils.book_append_sheet(wb, ws7, "得失点推移");
  }

  // ファイル名を生成
  const fileName = `試合レポート_${matchData.homeTeamName}vs${matchData.awayTeamName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
}

// チーム統計計算
function calculateTeamStats(plays: any[], teamSide: string, teamName: string) {
  const teamPlays = plays.filter((p: any) => p.teamSide === teamSide);
  const attacks = teamPlays.filter((p: any) => p.playType === "attack");
  const serves = teamPlays.filter((p: any) => p.playType === "serve");
  const receives = teamPlays.filter((p: any) => p.playType === "receive");
  const blocks = teamPlays.filter((p: any) => p.playType === "block");

  return {
    totalPlays: teamPlays.length,
    points: teamPlays.filter((p: any) => p.result === "point").length,
    attackRate: attacks.length > 0 ? ((attacks.filter((p: any) => p.result === "point").length / attacks.length) * 100).toFixed(1) : "0.0",
    serveAce: serves.filter((p: any) => p.result === "point").length,
    serveError: serves.filter((p: any) => p.result === "error").length,
    receiveRate: receives.length > 0 ? ((receives.filter((p: any) => p.result === "continue").length / receives.length) * 100).toFixed(1) : "0.0",
    blockPoints: blocks.filter((p: any) => p.result === "point").length,
  };
}

// 選手別統計
function getPlayerStats(plays: any[], teamSide: string) {
  const playerMap = new Map<number, any>();
  
  plays.filter((p: any) => p.teamSide === teamSide).forEach((play: any) => {
    if (!playerMap.has(play.playerId)) {
      playerMap.set(play.playerId, {
        選手番号: play.playerNumber || "-",
        選手名: play.playerName || "-",
        総プレー数: 0,
        得点: 0,
        攻撃数: 0,
        攻撃成功: 0,
        サーブ数: 0,
        サーブエース: 0,
        サーブミス: 0,
        レシーブ数: 0,
        レシーブ成功: 0,
        ブロック数: 0,
        ブロック成功: 0,
      });
    }
    
    const stats = playerMap.get(play.playerId);
    stats.総プレー数++;
    if (play.result === "point") stats.得点++;
    
    if (play.playType === "attack") {
      stats.攻撃数++;
      if (play.result === "point") stats.攻撃成功++;
    }
    if (play.playType === "serve") {
      stats.サーブ数++;
      if (play.result === "point") stats.サーブエース++;
      if (play.result === "error") stats.サーブミス++;
    }
    if (play.playType === "receive") {
      stats.レシーブ数++;
      if (play.result === "continue") stats.レシーブ成功++;
    }
    if (play.playType === "block") {
      stats.ブロック数++;
      if (play.result === "point") stats.ブロック成功++;
    }
  });

  return Array.from(playerMap.values()).map((stats: any) => ({
    ...stats,
    攻撃成功率: stats.攻撃数 > 0 ? `${((stats.攻撃成功 / stats.攻撃数) * 100).toFixed(1)}%` : "-",
    レシーブ成功率: stats.レシーブ数 > 0 ? `${((stats.レシーブ成功 / stats.レシーブ数) * 100).toFixed(1)}%` : "-",
  }));
}

// プレータイプ別統計
function getPlayTypeStats(plays: any[], matchData: any) {
  const types = ["serve", "receive", "set", "attack", "block", "dig"];
  const stats: any[] = [];

  types.forEach((type) => {
    const homePlays = plays.filter((p: any) => p.teamSide === "home" && p.playType === type);
    const awayPlays = plays.filter((p: any) => p.teamSide === "away" && p.playType === type);

    stats.push({
      プレータイプ: type,
      [`${matchData.homeTeamName}_総数`]: homePlays.length,
      [`${matchData.homeTeamName}_成功`]: homePlays.filter((p: any) => p.result === "point" || p.result === "continue").length,
      [`${matchData.awayTeamName}_総数`]: awayPlays.length,
      [`${matchData.awayTeamName}_成功`]: awayPlays.filter((p: any) => p.result === "point" || p.result === "continue").length,
    });
  });

  return stats;
}

// 得失点推移
function getScoreProgression(plays: any[], matchData: any) {
  let homeScore = 0;
  let awayScore = 0;
  const progression: any[] = [];

  plays.forEach((play: any, idx: number) => {
    if (play.result === "point") {
      if (play.teamSide === "home") homeScore++;
      else awayScore++;
    }

    progression.push({
      プレー番号: idx + 1,
      時刻: new Date(play.timestamp).toLocaleTimeString("ja-JP"),
      [`${matchData.homeTeamName}スコア`]: homeScore,
      [`${matchData.awayTeamName}スコア`]: awayScore,
      得点差: homeScore - awayScore,
      プレータイプ: play.playType,
      チーム: play.teamSide === "home" ? matchData.homeTeamName : matchData.awayTeamName,
    });
  });

  return progression;
}

// 選手統計をExcel形式でエクスポート
export function exportPlayerStatsToExcel(playerData: any, stats: any) {
  const wb = XLSX.utils.book_new();

  // 選手情報シート
  const playerInfo = [
    ["選手情報"],
    ["背番号", playerData.number],
    ["名前", playerData.name],
    ["ポジション", playerData.position],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(playerInfo);
  XLSX.utils.book_append_sheet(wb, ws1, "選手情報");

  // 統計情報シート
  const statsData = [
    ["統計項目", "値"],
    ["総プレー数", stats.totalPlays],
    ["成功プレー数", stats.successfulPlays],
    ["得点数", stats.points],
    ["エラー数", stats.errors],
    ["成功率", `${((stats.successfulPlays / stats.totalPlays) * 100).toFixed(1)}%`],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, ws2, "統計サマリー");

  // プレータイプ別統計シート
  if (stats.byPlayType) {
    const playTypeData = Object.entries(stats.byPlayType).map(([type, data]: [string, any]) => ({
      プレータイプ: type,
      総数: data.total,
      成功数: data.successful,
      成功率: `${((data.successful / data.total) * 100).toFixed(1)}%`,
    }));
    const ws3 = XLSX.utils.json_to_sheet(playTypeData);
    XLSX.utils.book_append_sheet(wb, ws3, "プレータイプ別統計");
  }

  // ファイル名を生成
  const fileName = `選手統計_${playerData.number}_${playerData.name}_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
}

// エイリアス（後方互換性のため）
export const exportPlayerStats = exportPlayerStatsToExcel;
export const exportTeamInfo = exportTeamStatsToExcel;

// チーム統計をExcel形式でエクスポート
export function exportTeamStatsToExcel(teamData: any, players: any[]) {
  const wb = XLSX.utils.book_new();

  // チーム情報シート
  const teamInfo = [
    ["チーム情報"],
    ["チーム名", teamData.teamName],
    ["シーズン", teamData.season || "-"],
    ["登録選手数", players.length],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(teamInfo);
  XLSX.utils.book_append_sheet(wb, ws1, "チーム情報");

  // 選手一覧シート
  if (players && players.length > 0) {
    const playersData = players.map((player: any) => ({
      背番号: player.number,
      名前: player.name,
      ポジション: player.position,
      リベロ: player.isLibero ? "はい" : "いいえ",
    }));
    const ws2 = XLSX.utils.json_to_sheet(playersData);
    XLSX.utils.book_append_sheet(wb, ws2, "選手一覧");
  }

  // ファイル名を生成
  const fileName = `チーム情報_${teamData.teamName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
}
