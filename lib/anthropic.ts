import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export interface ScenarioInput {
  personA: { name: string; mbti: string; emotion?: Record<string, number> };
  personB: { name: string; mbti: string; emotion?: Record<string, number> };
  area: string;
  phase: string;
}

export interface ScenarioOutput {
  narration: string;
  dialogue: { speaker: string; text: string }[];
  choices: { text: string; hint: string; deltaA: Record<string, number>; deltaB: Record<string, number> }[];
}

export async function generateScenario(input: ScenarioInput): Promise<ScenarioOutput> {
  const prompt = `あなたはビジュアルノベルのシナリオライター。以下の設定でシーンを生成してください。

人物A: ${input.personA.name} (${input.personA.mbti})
人物B: ${input.personB.name} (${input.personB.mbti})
場所: ${input.area}
フェーズ: ${input.phase}

JSON形式で返してください:
{
  "narration": "情景描写（2-3文）",
  "dialogue": [{"speaker": "名前", "text": "セリフ"}],
  "choices": [{"text": "選択肢テキスト", "hint": "ヒント", "deltaA": {"desire": 5}, "deltaB": {"trust": 3}}]
}

選択肢は3つ。各選択肢のdeltaは感情12軸(desire,anxiety,trust,vulnerability,excitement,tenderness,jealousy,shame,power,surrender,nostalgia,denial)の変動値。`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse scenario JSON from response');

  return JSON.parse(jsonMatch[0]) as ScenarioOutput;
}
