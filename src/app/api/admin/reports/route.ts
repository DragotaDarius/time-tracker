import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Implement report generation with export options
  return NextResponse.json({ message: 'Admin reports endpoint not implemented' }, { status: 501 });
} 