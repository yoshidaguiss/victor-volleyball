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
    ["最終スコア", `${matchData.homeScore} - ${matchData.awayScore}`],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(matchInfo);
  XLSX.utils.book_append_sheet(wb, ws1, "試合情報");

  // プレー記録シート
  if (plays && plays.length > 0) {
    const playsData = plays.map((play: any) => ({
      時刻: new Date(play.timestamp).toLocaleTimeString("ja-JP"),
      チーム: play.teamSide === "home" ? matchData.homeTeamName : matchData.awayTeamName,
      選手番号: play.playerNumber,
      選手名: play.playerName,
      プレータイプ: play.playType,
      結果: play.result,
      X座標: play.positionX,
      Y座標: play.positionY,
    }));
    const ws2 = XLSX.utils.json_to_sheet(playsData);
    XLSX.utils.book_append_sheet(wb, ws2, "プレー記録");
  }

  // ファイル名を生成
  const fileName = `試合レポート_${matchData.homeTeamName}vs${matchData.awayTeamName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
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
