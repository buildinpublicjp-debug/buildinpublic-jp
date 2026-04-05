import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function main() {
  const stateDir = join(process.cwd(), 'state')
  const commentsPath = join(stateDir, 'comments.json')         // 今回の未使用コメント
  const allCommentsPath = join(stateDir, 'all_comments.json')  // 全コメント履歴
  const currentVersionPath = join(stateDir, 'current_version.json')
  const nextPlanPath = join(stateDir, 'next_plan.md')
  const versionsDir = join(stateDir, 'versions')

  const newComments: { body: string; id: string }[] = JSON.parse(
    readFileSync(commentsPath, 'utf-8')
  )
  const currentVersion: { number: number; description: string } = JSON.parse(
    readFileSync(currentVersionPath, 'utf-8')
  )

  if (newComments.length === 0) {
    console.log('新規コメントなし。スキップ。')
    process.exit(0)
  }

  // 全コメント履歴（used含む）を読み込む
  const allComments: { body: string; id: string; used?: boolean }[] = existsSync(allCommentsPath)
    ? JSON.parse(readFileSync(allCommentsPath, 'utf-8'))
    : []

  // 新コメントを全履歴に追記（重複除外）
  const existingIds = new Set(allComments.map(c => c.id))
  const merged = [
    ...allComments,
    ...newComments.filter(c => !existingIds.has(c.id))
  ]
  mkdirSync(stateDir, { recursive: true })
  writeFileSync(allCommentsPath, JSON.stringify(merged, null, 2))

  // 過去バージョンの履歴を読み込む
  let versionHistory = ''
  if (existsSync(versionsDir)) {
    const { readdirSync } = require('fs')
    const files = readdirSync(versionsDir)
      .filter((f: string) => f.endsWith('.json'))
      .sort()
      .slice(-5) // 直近5バージョン
    versionHistory = files
      .map((f: string) => {
        const v = JSON.parse(readFileSync(join(versionsDir, f), 'utf-8'))
        return `${v.number}: ${v.comment} → ${v.reason?.slice(0, 80)}`
      })
      .join('\n')
  }

  console.log(`新規コメント: ${newComments.length}件`)
  console.log(`全コメント蓄積: ${merged.length}件`)
  console.log(`現在: v${currentVersion.number} - ${currentVersion.description}`)

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    thinking: { type: 'enabled', budget_tokens: 12000 } as any,
    messages: [
      {
        role: 'user',
        content: `あなたはbuildinpublic.jpというWebサイトの進化を導くAIディレクターです。

## 現在の状態
バージョン: v${currentVersion.number}
説明: ${currentVersion.description}

## 過去のバージョン履歴（直近5件）
${versionHistory || 'まだ履歴なし'}

## 今回の新規コメント（${newComments.length}件）
${newComments.map((c, i) => `${i + 1}. ${c.body}`).join('\n')}

## これまでの全コメント累計（${merged.length}件）
${merged.map((c, i) => `${i + 1}. ${c.body}`).join('\n')}

---

## あなたのタスク

### Phase 1: 集合的無意識の読み取り
全コメントを横断的に読んで、コミュニティが表面上は言っていないが
**底に流れている本質的な欲求・空気感・集合的な意志**を読み取ってください。
個別のリクエストの文字通りの意味ではなく、
「このコミュニティは何を本当に求めているのか」を深く考えてください。

### Phase 2: 方向性100案の生成と厳密なスコアリング
読み取った集合的意志を出発点に、100個の進化の方向性を生成し、
以下の基準で1-100点でスコアをつけてください。

**高得点の条件（これが重要）:**
- スクショしたくなる → SNSで自然に拡散するビジュアル
- 「なんでこうなった」と言いたくなる → コメント誘発力が高い
- 前バージョンと全然違う → ギャップが大きいほど動画になる
- コミュニティの空気を独自解釈している → 意外だが「確かに」と思える
- 一言タイトルになる → 「AIがサイトをゲームにした」「AIがサイトを告白画面にした」

**低得点の条件:**
- 色を変えただけ、フォントを変えただけ
- 「機能を追加」しただけで見た目が変わらない
- 説明しないと伝わらない
- 過去バージョンと似ている

### Phase 3: 最高スコアの1案に決め込む
最高スコアの方向性を選び、具体的な実装プランを書く。
「30分で実装できるか」は考慮しない。面白さだけで決める。

---

## 出力フォーマット（厳守）

### コミュニティの集合的意志
（全コメントから読み取った本質的な欲求・空気感を200字以内で）

### 採用案
- 方向性: （一言タイトル）
- 集合的意志との接点: （なぜこれがコミュニティの意志を体現するか）
- 拡大解釈の内容: （どう解釈・発展させたか）
- スコア: （XX / 100）
- 動画タイトル案: 「AIがbuildinpublic.jpを〇〇にした」

### 実装プラン
（app/page.tsxに何をどう書くか。Next.js 14 + Tailwind CSSで実装可能な具体的な指示。
コードの構造、使うHTML要素、スタイリングの方向性まで詳細に）

### 特記事項
（CCエージェントへの追加指示）
`,
      },
    ],
  })

  const planText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')

  writeFileSync(nextPlanPath, `# Next Plan\n生成日時: ${new Date().toISOString()}\n\n${planText}`)

  // バージョン記録
  const nextNum = currentVersion.number + 1
  const versionNum = String(nextNum).padStart(3, '0')
  mkdirSync(versionsDir, { recursive: true })

  const directionMatch = planText.match(/方向性[：:] ?(.+)/)
  const adoptedDirection = directionMatch ? directionMatch[1].trim() : newComments[0].body
  const reasonMatch = planText.match(/集合的意志との接点[：:] ?(.+)/)
  const reason = reasonMatch ? reasonMatch[1].trim() : planText.slice(0, 200)
  const scoreMatch = planText.match(/(\d+) ?\/? ?100/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0
  const titleMatch = planText.match(/動画タイトル案[：:] ?「?(.+?)」?$/)
  const videoTitle = titleMatch ? titleMatch[1].trim() : ''

  writeFileSync(
    join(versionsDir, `v${versionNum}.json`),
    JSON.stringify(
      {
        number: `v${versionNum}`,
        comment: adoptedDirection,
        reason,
        score,
        video_title: videoTitle,
        total_comments_at_time: merged.length,
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
        description: adoptedDirection.slice(0, 50),
        last_updated: new Date().toISOString(),
      },
      null,
      2
    )
  )

  console.log(`✅ プラン生成完了 → state/next_plan.md`)
  console.log(`✅ バージョン記録 → state/versions/v${versionNum}.json`)
  console.log(`📹 動画タイトル案: ${videoTitle}`)
}

main().catch(console.error)
