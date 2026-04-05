import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function main() {
  const stateDir = join(process.cwd(), 'state')
  const commentsPath = join(stateDir, 'comments.json')
  const currentVersionPath = join(stateDir, 'current_version.json')
  const nextPlanPath = join(stateDir, 'next_plan.md')

  const rawComments = readFileSync(commentsPath, 'utf-8')
  const comments: { body: string; id: string }[] = JSON.parse(rawComments)
  const currentVersion: { number: number; description: string } = JSON.parse(
    readFileSync(currentVersionPath, 'utf-8')
  )

  if (comments.length === 0) {
    console.log('コメントなし。スキップ。')
    process.exit(0)
  }

  console.log(`コメント${comments.length}件を分析中...`)
  console.log(`現在: v${currentVersion.number} - ${currentVersion.description}`)

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    thinking: { type: 'enabled', budget_tokens: 10000 } as any,
    messages: [
      {
        role: 'user',
        content: `あなたはbuildinpublic.jpというWebサイトの進化を管理するAIです。

## 現在の状態
バージョン: v${currentVersion.number}
説明: ${currentVersion.description}

## 集まったコメント
${comments.map((c, i) => `${i + 1}. ${c.body}`).join('\n')}

## あなたのタスク

1. これらのコメントから100個の「サイトの進化の方向性」を内部的に生成する
2. それぞれに1-100のスコアをつける（動画コンテンツとして面白いか、実装が30分以内か、視聴者が驚くか、前バージョンとのギャップが大きいか）
3. 最高スコアの1案に決め込む
4. その案を実装するための完全なプランをMarkdownで書く

## 重要なルール
- コメントは必ず「拡大解釈」する。文字通りに取らない
- 突拍子もない方向性ほど動画として面白い
- プランはNext.js + Tailwind CSSで実装可能なものに限る
- app/page.tsxを書き換えることでサイトが変わる

## 出力フォーマット（このフォーマットで必ず出力）

### 採用案
- コメント: （どのコメントを採用したか）
- 拡大解釈: （どう解釈したか）
- スコア: （何点 / 100）
- 判断理由: （なぜこれを選んだか）

### 実装プラン
（app/page.tsxに何をどう書くか、具体的なコードレベルで指示）

### 特記事項
（CCエージェントへの追加指示があれば）
`,
      },
    ],
  })

  const planText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')

  mkdirSync(stateDir, { recursive: true })
  writeFileSync(nextPlanPath, `# Next Plan\n生成日時: ${new Date().toISOString()}\n\n${planText}`)

  const nextNum = currentVersion.number + 1
  const versionNum = String(nextNum).padStart(3, '0')
  const versionsDir = join(stateDir, 'versions')
  mkdirSync(versionsDir, { recursive: true })

  const commentMatch = planText.match(/コメント[：:] ?(.+)/)
  const adoptedComment = commentMatch ? commentMatch[1].trim() : comments[0].body
  const reasonMatch = planText.match(/判断理由[：:] ?(.+)/)
  const reason = reasonMatch ? reasonMatch[1].trim() : planText.slice(0, 200)
  const scoreMatch = planText.match(/(\d+) ?\/? ?100/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

  writeFileSync(
    join(versionsDir, `v${versionNum}.json`),
    JSON.stringify(
      {
        number: `v${versionNum}`,
        comment: adoptedComment,
        reason,
        score,
        date: new Date().toLocaleDateString('ja-JP'),
        plan: planText,
      },
      null,
      2
    )
  )

  writeFileSync(
    currentVersionPath,
    JSON.stringify(
      {
        number: nextNum,
        description: `コメント「${adoptedComment.slice(0, 30)}」から進化`,
        last_updated: new Date().toISOString(),
      },
      null,
      2
    )
  )

  console.log(`✅ プラン生成完了 → state/next_plan.md`)
  console.log(`✅ バージョン記録 → state/versions/v${versionNum}.json`)
}

main().catch(console.error)
