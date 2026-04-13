// Character Identity Anchors for image generation
// Each character has a fixed visual description used in EVERY prompt

export const TEST_PAIR = {
  him: {
    id: 'estp_m_27_001',
    name: { ja: '高橋 颯太', en: 'Sota Takahashi' },
    mbti: 'ESTP',
    age: 27,
    gender: 'male',
    job: 'フリーランスのカメラマン',
    area: '渋谷',

    // === IDENTITY ANCHOR (include in EVERY prompt) ===
    identityAnchor: [
      'Japanese man, 27 years old',
      'angular jawline with slight stubble',
      'short black textured hair, slightly messy, pushed back on the right side',
      'deep-set dark brown eyes with slight creases when focused',
      'medium tan skin with a small scar on left eyebrow',
      'height 178cm, athletic lean build',
      'silver ring on right middle finger',
    ].join(', '),

    // Style anchor (outfit varies but base style is consistent)
    styleAnchor: 'street-smart casual: black oversized vintage tee, slim dark jeans, worn white sneakers, silver chain necklace',

    // For Nano Banana prompt
    portraitPrompt: `Photorealistic portrait photograph of a Japanese man, 27 years old. Angular jawline with slight stubble. Short black textured hair, slightly messy, pushed back on the right side. Deep-set dark brown eyes with slight creases when focused. Medium tan skin with a small scar on left eyebrow. Athletic lean build. Wearing a black oversized vintage tee and silver chain necklace. Silver ring on right middle finger.

Shot on Sony A7III, 85mm f/1.8 lens. Soft natural window light from the left. Shallow depth of field. Neutral warm-gray background. No text, no UI, no watermark. The face should feel real — visible pores, natural skin texture, slight asymmetry.`,

    // Variant prompts (same identity, different context)
    variantPrompts: {
      threeQuarter: 'Same person, three-quarter angle facing right. Same lighting setup. Same outfit. Maintain exact facial features.',
      instagram_cafe: 'Same person sitting at a specialty coffee shop counter, checking photos on a mirrorless camera. Morning light through large windows. Candid moment, slight smile. Same outfit and accessories.',
      instagram_street: 'Same person walking through a narrow Ebisu backstreet at golden hour. Camera hanging from neck strap. Confident stride, looking slightly to the side. Street photography aesthetic.',
      instagram_work: 'Same person crouching low, shooting photos of a subject off-camera. Focused expression. Urban rooftop setting, city skyline behind. Late afternoon light.',
    },

    profile: {
      birthplace: '東京都渋谷区',
      education: '武蔵野美術大学中退',
      favoriteFood: '渋谷のAFURIの柚子塩ラーメン',
      hobby: 'ストリートスナップ撮影',
      music: 'King Gnu',
      trauma: '衝動的な行動で大切な人を傷つけた',
      deepestDesire: 'まだ誰も見たことのない景色を見ること',
      innerMonologue: '深く潜るのが怖いだけかもしれない。水面でバタバタしてるだけかも。',
      attachment: 'avoidant',
      loveLanguage: 'touch',
    },
  },

  her: {
    id: 'infj_f_24_001',
    name: { ja: '山口 紬', en: 'Tsumugi Yamaguchi' },
    mbti: 'INFJ',
    age: 24,
    gender: 'female',
    job: '臨床心理士',
    area: '中目黒',

    // === IDENTITY ANCHOR ===
    identityAnchor: [
      'Japanese woman, 24 years old',
      'soft oval face with high cheekbones',
      'long straight dark brown hair, middle-parted, falling just past shoulders',
      'large gentle dark eyes with long natural lashes',
      'fair porcelain skin with a faint beauty mark below right eye',
      'height 162cm, slim delicate build',
      'thin gold bracelet on left wrist',
    ].join(', '),

    styleAnchor: 'quiet minimal elegance: cream knit top, high-waisted dark trousers, simple white canvas shoes, small leather crossbody bag',

    portraitPrompt: `Photorealistic portrait photograph of a Japanese woman, 24 years old. Soft oval face with high cheekbones. Long straight dark brown hair, middle-parted, falling just past shoulders. Large gentle dark eyes with long natural lashes. Fair porcelain skin with a faint beauty mark below right eye. Slim delicate build. Wearing a cream knit top. Thin gold bracelet on left wrist.

Shot on Sony A7III, 85mm f/1.8 lens. Soft natural window light from the left. Shallow depth of field. Neutral warm-gray background. No text, no UI, no watermark. The face should feel real — visible pores, natural skin texture, slight asymmetry. Calm, thoughtful expression with a hint of warmth in the eyes.`,

    variantPrompts: {
      threeQuarter: 'Same person, three-quarter angle facing left. Same lighting setup. Same outfit. Maintain exact facial features — identical eye shape, nose bridge contour, jawline angle, lip proportions, beauty mark below right eye, and skin texture.',
      instagram_cafe: 'Same person reading a paperback book at a quiet Nakameguro cafe. Afternoon light filtering through curtains. Absorbed in reading, hair tucked behind left ear. Same gold bracelet visible.',
      instagram_evening: 'Same person standing on a small bridge over Meguro River at dusk. Soft blue-hour light. Looking down at the water with a gentle contemplative expression. Wearing a long beige coat over the cream knit top.',
      instagram_work: 'Same person in a consultation room, sitting in a warm-toned armchair, notepad on lap. Professional but warm. Soft lamp light. Slight encouraging smile.',
    },

    profile: {
      birthplace: '神奈川県鎌倉市',
      education: '上智大学外国語学部卒',
      favoriteFood: '鎌倉のイワタコーヒーのホットケーキ',
      hobby: '古本屋巡り',
      music: 'Ichiko Aoba',
      trauma: '共依存的な恋愛で自分を見失った',
      deepestDesire: '魂レベルで繋がれる人と出会うこと',
      innerMonologue: 'この人の中に、まだ誰にも見せてない部屋がある気がする。',
      attachment: 'anxious',
      loveLanguage: 'words',
    },
  },

  // Scene: bar-escalation (the two of them together)
  scenePrompt: {
    image: `Cinematic photograph, photorealistic. Shot on Sony A7III with 35mm f/1.4 lens. Shallow depth of field with natural bokeh. Film grain texture. Color grading: warm amber highlights, teal shadows. Cross-section architectural view.

A tiny 6-seat Tokyo bar in Roppongi. Dark walnut counter, whiskey bottles with amber LED backlight.

Two people at the bar, 30cm apart, bodies angled toward each other.
Him (27): Angular jawline with stubble, short black messy hair, black vintage tee, silver chain. Leaning in, confident mask cracking. Neck flushed.
Her (24): Oval face, long dark brown hair middle-parted, cream knit top, gold bracelet. Calm knowing eyes, faint smile.

Through window: blurred Tokyo neon as bokeh. Cool blue-cyan night.
Do NOT include text, UI, labels.`,
    motion: `Slow, intimate, almost still. Camera: completely static, locked tripod. Cross-section view.
His fingers 2cm from her wrist on the counter. Smoke rising from ashtray. Pendant light flickers.
Ambient: warm light flickers gently. Background bokeh shifts slightly. Subtle breathing visible.
8 seconds, photorealistic, film grain.`,
  },
};
