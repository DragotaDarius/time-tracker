import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Implement email verification logic
  return NextResponse.json({ message: 'Verify endpoint not implemented' }, { status: 501 });
} 