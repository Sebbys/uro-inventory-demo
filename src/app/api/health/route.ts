import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    worker: !!process.env.WORKER_INGRESS_URL,
    db: !!process.env.DATABASE_URL,
  });
}
