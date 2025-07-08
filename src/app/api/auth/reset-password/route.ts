import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO: Implement password reset logic
  return NextResponse.json({ message: 'Reset password endpoint not implemented' }, { status: 501 });
} 