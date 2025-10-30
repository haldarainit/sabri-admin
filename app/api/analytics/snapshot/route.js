import { NextResponse } from 'next/server';

// Snapshot endpoint removed - realtime API provides live metrics now.
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Snapshot endpoint has been removed. Use /api/analytics/realtime for live metrics.'
  }, { status: 410 });
}
