import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO: Implement start break with break type and session association
  return NextResponse.json({ message: 'Start break endpoint not implemented' }, { status: 501 });
} 