import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  // TODO: Implement get session breaks with break history
  return NextResponse.json({ message: 'Get session breaks endpoint not implemented' }, { status: 501 });
} 