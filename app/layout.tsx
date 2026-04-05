import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'buildinpublic.jp',
  description: 'コミュニティのコメントでAIがサイトを毎回進化させる実験',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
