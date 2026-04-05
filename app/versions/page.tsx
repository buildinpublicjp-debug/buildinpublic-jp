import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

type Version = {
  number: string
  comment: string
  reason: string
  score: number
  date: string
}

function getVersions(): Version[] {
  try {
    const dir = join(process.cwd(), 'state/versions')
    const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort().reverse()
    return files.map(f => JSON.parse(readFileSync(join(dir, f), 'utf-8')))
  } catch {
    return []
  }
}

export default function VersionsPage() {
  const versions = getVersions()

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="space-y-1">
          <a href="/" className="text-gray-600 text-xs hover:text-gray-400">← back</a>
          <h1 className="text-2xl font-bold">バージョン履歴</h1>
          <p className="text-gray-500 text-sm">どのコメントがどう解釈されてサイトが変わったか</p>
        </div>

        {versions.length === 0 ? (
          <p className="text-gray-600">まだバージョンなし。最初のコメントを送って。</p>
        ) : (
          <div className="space-y-8">
            {versions.map((v) => (
              <div key={v.number} className="border border-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">{v.number}</span>
                  <span className="text-xs text-gray-600">{v.date}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">採用コメント</p>
                  <p className="text-white">「{v.comment}」</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">AIの判断理由</p>
                  <p className="text-gray-300 text-sm">{v.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">スコア（100案中）</p>
                  <p className="text-gray-400 text-sm font-mono">{v.score} / 100</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
