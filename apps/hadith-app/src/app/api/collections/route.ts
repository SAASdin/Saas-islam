// @ts-nocheck
import { NextResponse } from 'next/server'
import { getCollections } from '@/lib/db'

export async function GET() {
  try {
    const collections = await getCollections()
    return NextResponse.json({ data: collections })
  } catch (err) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  }
}
