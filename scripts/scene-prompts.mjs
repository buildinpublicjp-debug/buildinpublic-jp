// Scene prompt templates for Gemini image generation
// Each scene × phase combination has a unique prompt

const STYLE_HEADER = `Cinematic photograph, photorealistic. Shot on Sony A7III with 35mm f/1.4 lens. Shallow depth of field with natural bokeh. Film grain texture. Color grading: warm amber highlights, teal shadows. Cross-section architectural view — one wall removed, we see inside from outside. Thin cyan wireframe overlay on building edges. Real Japanese people, real skin texture, real fabric. NOT illustration, NOT anime. Could be a still from a Japanese indie film. Voyeuristic composition.`;

const MOTION_HEADER = (scene) => `Slow, intimate, almost still. Minimal movement. Camera: completely static, locked tripod. The stillness makes micro-movements feel enormous. ${scene === 'street' ? '' : 'Cross-section view.'}`;

const SCENES = {
  bar: {
    setting: 'A tiny 6-seat Tokyo bar in a Roppongi backstreet, dark walnut counter, 3 shelves of whiskey bottles (Nikka, Yamazaki) with warm amber LED backlight, single brass pendant light above.',
    window: 'Through window: blurred Tokyo neon "居酒屋" "BAR" as bokeh circles. Cool blue-cyan night.',
  },
  hotel: {
    setting: 'Compact Tokyo business hotel room (15sqm), Shibuya. Desk with warm brass lamp ON. Blackout curtain partially open.',
    window: 'Through curtain gap: blurred Tokyo nightscape, distant red aircraft warning light.',
  },
  izakaya: {
    setting: 'Traditional Tokyo izakaya in Shinjuku Golden-gai, 8 seats max. Low wooden table with navy zabuton on tatami. Paper lanterns (提灯) orange glow. Handwritten menu cards (短冊) on wall.',
    window: 'Shoji door half open showing warm hallway light. Small TV showing baseball, sound off.',
  },
  cafe: {
    setting: 'Quiet specialty coffee shop in Nakameguro. White plaster walls, exposed beams. Long light oak communal table along large window. Chrome espresso machine. Monstera plant.',
    window: 'Through window: Meguro River with green trees, people walking, afternoon sunlight.',
  },
  street: {
    setting: 'Narrow Ebisu backstreet (3m wide) at night. Wet asphalt reflecting neon. Closed yakitori shop, Coca-Cola vending machine glowing, parked bicycle. 3-story apartment building.',
    window: 'Distance: Ebisu station glow. A tabby cat on a wall.',
  },
};

const PHASES = {
  seed: {
    distance: '1.5 meters apart, no direct interaction yet',
    hisState: 'Unaware or barely aware of her. Relaxed, in his own world.',
    herState: 'Unaware or barely aware of him. Comfortable, present.',
    tension: 'Zero tension. Pure potential. Two strangers sharing space.',
    motion: 'Almost no movement between them. Only ambient motion — steam, light flicker, page turn.',
  },
  approach: {
    distance: '80cm, subtle awareness of each other',
    hisState: 'Trying not to look at her but failing. Ears slightly red.',
    herState: 'Aware of him. Hair tucked behind ear on his side. Slight blush.',
    tension: 'First electricity. The air between them has changed.',
    motion: 'His eyes drift toward her then snap away. Her finger traces her glass rim slowly.',
  },
  escalation: {
    distance: '30cm, bodies angled toward each other',
    hisState: 'Leaning in, confident mask cracking. Neck flushed. His drink nearly empty.',
    herState: 'Calm, knowing eyes. Faint smile. Her drink untouched. She sees through him.',
    tension: 'Electric. The viewer feels it through the screen.',
    motion: 'His fingers 2cm from her wrist. Smoke rising from ashtray. Pendant light flickers.',
  },
  critical: {
    distance: '15cm or touching, something has shifted',
    hisState: 'Walls down. Vulnerable. Processing what just happened or is about to.',
    herState: 'Eyes wide open. Decision point. Her body half-turned toward him, half away.',
    tension: 'Unbearable. Time has stopped.',
    motion: 'His hand on her wrist or shoulder. Her breathing visible. Minimal other movement.',
  },
  imminent: {
    distance: 'Contact. Faces 10-20cm apart.',
    hisState: 'Every wall down. Searching her face. Breath visible.',
    herState: 'She has decided. Her eyes say everything. Lower lip caught between teeth.',
    tension: 'Past the point of no return.',
    motion: 'His thumb on her pulse. Her face tilted up. Steam/smoke/rain as ambient.',
  },
};

export function generateImagePrompt(scene, phase) {
  const s = SCENES[scene];
  const p = PHASES[phase];
  if (!s || !p) throw new Error(`Invalid scene '${scene}' or phase '${phase}'`);

  return `${STYLE_HEADER}

${s.setting}

Two Japanese people. Distance: ${p.distance}.

Him (27): ${p.hisState}
Her (24): ${p.herState}

Atmosphere: ${p.tension}

${s.window}

Warm amber interior vs cool blue-cyan exterior. Shallow DOF. The space between them is the emotional center.

Do NOT include text, UI, labels, or speech bubbles.`;
}

export function generateMotionPrompt(scene, phase) {
  const s = SCENES[scene];
  const p = PHASES[phase];
  if (!s || !p) throw new Error(`Invalid scene '${scene}' or phase '${phase}'`);

  return `${MOTION_HEADER(scene)}

${p.motion}

Ambient: warm light flickers gently. Background bokeh shifts slightly. Subtle breathing visible on both.

4 seconds, seamless loop. Photorealistic. Film grain.`;
}

export function getAllScenePhases() {
  const combos = [];
  for (const scene of Object.keys(SCENES)) {
    for (const phase of Object.keys(PHASES)) {
      combos.push({ scene, phase });
    }
  }
  return combos;
}

export { SCENES, PHASES, STYLE_HEADER };
