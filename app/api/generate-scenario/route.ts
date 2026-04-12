import { NextRequest, NextResponse } from 'next/server';
import { generateScenario, type ScenarioInput } from '../../../lib/anthropic';

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body: ScenarioInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.personA || !body.personB || !body.area || !body.phase) {
    return NextResponse.json({ error: 'Missing required fields: personA, personB, area, phase' }, { status: 400 });
  }

  try {
    const scenario = await generateScenario(body);
    return NextResponse.json(scenario);
  } catch (err) {
    console.error('Scenario generation failed:', err);
    return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
  }
}
