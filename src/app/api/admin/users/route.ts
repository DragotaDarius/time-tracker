import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Implement all users management with bulk operations
  return NextResponse.json({ message: 'Admin users endpoint not implemented' }, { status: 501 });
} 