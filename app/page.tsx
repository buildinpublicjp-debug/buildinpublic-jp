// v1 - 最初の状態。何もない。
// このファイルはAIが毎サイクル書き換える。

'use client'
import { useState } from 'react'

export default function Home() {
  const [sent, setSent] = useState(false)
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: text.trim() }),
    })
    setSent(true)
    setText('')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm tracking-widest uppercase">buildinpublic.jp</p>
          <h1 className="text-3xl font-bold">何作ればいい？</h1>
          <p className="text-gray-400 text-sm">コメントがAIに渡され、次のバージョンが生まれる</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-400">送信完了</p>
            <button onClick={() => setSent(false)} className="text-gray-600 text-sm underline">
              もう一件送る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="なんでも書いて"
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400 resize-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              送信
            </button>
          </form>
        )}

        <div className="text-center">
          <a href="/versions" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            バージョン履歴 →
          </a>
        </div>
      </div>
    </main>
  )
}
