import { trpc } from "@/lib/trpc";

export default function DbHealth() {
  const { data, isLoading, error } = trpc.dbHealth.useQuery();

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">DB診断</h1>
      {isLoading && <p>確認中...</p>}
      {error && <p className="text-red-600">tRPCエラー: {error.message}</p>}
      {data && (
        <div className="space-y-4">
          <div>
            <span className="font-bold">接続: </span>
            <span className={data.connected ? "text-green-600" : "text-red-600"}>
              {data.connected ? "OK" : "NG"}
            </span>
          </div>
          {data.error && (
            <div>
              <span className="font-bold text-red-600">エラー: </span>
              <pre className="bg-red-50 p-2 rounded mt-1 whitespace-pre-wrap">{data.error}</pre>
            </div>
          )}
          <div>
            <span className="font-bold">テーブル一覧 ({data.tables.length}件): </span>
            {data.tables.length === 0 ? (
              <span className="text-red-600 ml-2">テーブルなし（マイグレーション未実行の可能性）</span>
            ) : (
              <ul className="mt-1 ml-4 list-disc">
                {data.tables.map(t => <li key={t}>{t}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
