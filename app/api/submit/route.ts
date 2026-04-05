import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { comment } = await req.json()

  if (!comment || comment.trim().length === 0) {
    return NextResponse.json({ error: 'empty' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { error } = await supabase
    .from('comments')
    .insert({ body: comment.trim(), used: false })

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'db' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
