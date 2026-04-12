'use client';

import { useState, useMemo } from 'react';
import type { Phase } from '../../engine/scoring';
import type { EmotionState } from '../../engine/emotions';

interface PlayChoice {
  text: string;
  hint: string;
  delta: Partial<EmotionState>;
  /** 選んだ後の短いリアクション */
  reaction: string;
}

interface PlayChoicesProps {
  phase: Phase;
  personAName: string;
  personBName: string;
  onChoose: (delta: Partial<EmotionState>) => void;
}

// フェーズ別の選択肢テンプレート
function generateChoices(phase: Phase, nameA: string, nameB: string): PlayChoice[] {
  switch (phase) {
    case 'seed':
      return [
        {
          text: `${nameA}にLINEを送らせる`,
          hint: '「今夜��う？」— 軽いノリで',
          delta: { desire: 5, excitement: 8, anxiety: 3 },
          reaction: `${nameA}がスマホを手に取った。打っては消し、打っては消し…送信。`,
        },
        {
          text: 'もう少し��たせる',
          hint: '焦らすのもテクニック',
          delta: { anxiety: 10, desire: 3, denial: 5 },
          reaction: `${nameB}がスマホを確認する頻度が上がっている。`,
        },
        {
          text: '偶然を装って会わせる',
          hint: '同じ駅で「あれ？」',
          delta: { excitement: 12, trust: 5, vulnerability: 3 },
          reaction: `「え、うそ、なんでここに？」— 計算通り。`,
        },
      ];

    case 'approach':
      return [
        {
          text: '隣に座らせる',
          hint: 'カウンター席に変更',
          delta: { desire: 8, vulnerability: 6, excitement: 5 },
          reaction: `肩が触れる距離。${nameB}は少し体を傾けた。`,
        },
        {
          text: '2杯目を頼ませる',
          hint: 'ワインで少��大胆に',
          delta: { excitement: 6, surrender: 4, anxiety: -5 },
          reaction: `グラスを傾けながら、目が��う時間が長くなっている。`,
        },
        {
          text: '店を出させる',
          hint: '「散歩しない？」',
          delta: { trust: 8, tenderness: 5, vulnerability: 4 },
          reaction: `夜風が気持ちいい。2人の距離が30cmになった。`,
        },
      ];

    case 'escalation':
      return [
        {
          text: '手を触れさせる',
          hint: '「手、冷たいね」',
          delta: { desire: 12, vulnerability: 10, excitement: 8 },
          reaction: `指先が触れた瞬間、2人とも黙った。離さない。`,
        },
        {
          text: '秘密を打ち明けさせる',
          hint: '心の壁を一枚脱がせる',
          delta: { trust: 15, vulnerability: 12, tenderness: 8 },
          reaction: `「こんなこと、誰にも言ったことないんだけど…」`,
        },
        {
          text: '嫉妬させる',
          hint: '他の客をチラ見させる',
          delta: { jealousy: 15, desire: 8, power: 5 },
          reaction: `${nameA}の表情が一瞬変わった。${nameB}はそれに気づいている。`,
        },
      ];

    case 'critical':
      return [
        {
          text: '終電を逃させる',
          hint: '時計を見ない空気を作る',
          delta: { desire: 15, surrender: 10, anxiety: 5 },
          reaction: `「あ…もうこんな���間」嘘だ。2人とも時計を見ていた。`,
        },
        {
          text: 'タクシーに乗せる',
          hint: '行き先は…',
          delta: { excitement: 18, desire: 12, vulnerability: 8 },
          reaction: `後部座席。膝が触れている。「…どこ行く？」`,
        },
        {
          text: '一���引かせる',
          hint: '「今日は楽しかった」と言わせる',
          delta: { tenderness: 12, trust: 8, denial: 8 },
          reaction: `別れ際。見つめ合う。3秒。離れがたい。`,
        },
      ];

    case 'imminent':
      return [
        {
          text: '部屋の照明を落とす',
          hint: '間接照明だけに',
          delta: { desire: 20, surrender: 15, vulnerability: 12 },
          reaction: `暗がりの中、呼吸だけが聞こえる。`,
        },
        {
          text: '音楽をかけさせる',
          hint: '気まずさを音で埋める',
          delta: { anxiety: -10, excitement: 10, tenderness: 8 },
          reaction: `知らな���曲。でも今はどんな曲でも2人のBGM���なる。`,
        },
        {
          text: '見つめさせる',
          hint: '言葉���要らない',
          delta: { desire: 15, trust: 12, surrender: 18 },
          reaction: `目が合った。もう逸らさない。`,
        },
      ];
  }
}

// Phase-based reaction emoji
const PHASE_REACTIONS: Record<Phase, string[]> = {
  seed: ['😮', '👀', '💭'],
  approach: ['😊', '💓', '✨'],
  escalation: ['😏', '🔥', '💋'],
  critical: ['😮', '💘', '🫣'],
  imminent: ['🥵', '💥', '❤️‍🔥'],
};

export function PlayChoices({ phase, personAName, personBName, onChoose }: PlayChoicesProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionEmoji, setReactionEmoji] = useState<string | null>(null);

  const choices = useMemo(
    () => generateChoices(phase, personAName, personBName),
    [phase, personAName, personBName]
  );

  // リアクション表示後にリセット
  if (reaction) {
    return (
      <div className="px-4 py-3">
        {/* Character reaction emoji flash */}
        {reactionEmoji && (
          <div
            className="text-center text-2xl mb-2"
            style={{ animation: 'emojiPop 0.6s ease forwards' }}
          >
            {reactionEmoji}
          </div>
        )}
        <div
          className="text-[11px] text-white/60 leading-relaxed text-center"
          style={{
            animation: 'fadeInUp 0.5s ease forwards',
          }}
        >
          {reaction}
        </div>
        <button
          onClick={() => {
            setChosen(null);
            setReaction(null);
            setReactionEmoji(null);
          }}
          className="block mx-auto mt-3 text-[8px] tracking-[3px] text-white/20 hover:text-white/40 transition-colors"
        >
          NEXT
        </button>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes emojiPop {
            0% { transform: scale(0) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.4) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="text-[8px] tracking-[3px] text-white/20 text-center mb-2 uppercase">
        Choose an action
      </div>

      {choices.map((choice, i) => (
        <button
          key={i}
          onClick={() => {
            setChosen(i);
            onChoose(choice.delta);
            // Show reaction emoji then text
            const emojis = PHASE_REACTIONS[phase];
            setReactionEmoji(emojis[i % emojis.length]);
            setTimeout(() => setReaction(choice.reaction), 300);
          }}
          disabled={chosen !== null}
          className={`
            w-full text-left px-3 py-2.5 rounded border transition-all duration-300
            ${chosen === i
              ? 'bg-white/10 border-white/30 scale-[0.97]'
              : chosen !== null
                ? 'opacity-30 bg-transparent border-white/5'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.95]'
            }
          `}
          style={{
            opacity: 0,
            animation: `choiceSpringIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.12 * i}s forwards`,
            transition: 'transform 0.15s ease, background 0.3s, border-color 0.3s, opacity 0.3s',
          }}
        >
          <div className="text-[12px] text-white/80 font-medium">{choice.text}</div>
          <div className="text-[9px] text-white/30 mt-0.5">{choice.hint}</div>
        </button>
      ))}

      <style>{`
        @keyframes choiceSpringIn {
          0% { opacity: 0; transform: translateX(-16px) scale(0.95); }
          60% { opacity: 1; transform: translateX(3px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
