import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Implement admin dashboard with organization-wide statistics
  return NextResponse.json({ message: 'Admin dashboard endpoint not implemented' }, { status: 501 });
} 