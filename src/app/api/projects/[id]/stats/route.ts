import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement project statistics and time distribution
  return NextResponse.json({ message: 'Project stats endpoint not implemented' }, { status: 501 });
} 