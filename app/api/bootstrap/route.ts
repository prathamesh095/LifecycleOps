import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const MOCK_USER_EMAIL = 'pawarprathamesh095@gmail.com';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: MOCK_USER_EMAIL },
      include: {
        applications: true,
        contacts: true,
        activities: true,
        reminders: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        applications: [],
        contacts: [],
        activities: [],
        reminders: [],
        serverTime: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      applications: user.applications,
      contacts: user.contacts,
      activities: user.activities,
      reminders: user.reminders,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[BootstrapAPI] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
