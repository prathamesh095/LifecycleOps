import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SyncBatchSchema } from '@/lib/validators';

const MOCK_USER_EMAIL = 'pawarprathamesh095@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = SyncBatchSchema.parse(body);

    let user = await prisma.user.findUnique({
      where: { email: MOCK_USER_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: MOCK_USER_EMAIL,
          name: 'Prathamesh Pawar',
        },
      });
    }

    const userId = user.id;

    if (validatedData.applications) {
      for (const app of validatedData.applications) {
        await prisma.application.upsert({
          where: { id: app.id },
          update: {
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            status: app.status,
            location: app.location,
            salaryRange: app.salaryRange,
            jobUrl: app.jobUrl,
            notes: app.notes,
            channelType: app.channelType,
            nextFollowUpAt: app.nextFollowUpAt ? new Date(app.nextFollowUpAt) : null,
            interviewDate: app.interviewDate ? new Date(app.interviewDate) : null,
            lastActivityAt: new Date(app.lastActivityAt),
            isHighPriority: app.isHighPriority,
            isArchived: app.isArchived,
            updatedAt: new Date(app.updatedAt),
          },
          create: {
            id: app.id,
            userId,
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            status: app.status,
            location: app.location,
            salaryRange: app.salaryRange,
            jobUrl: app.jobUrl,
            notes: app.notes,
            channelType: app.channelType,
            nextFollowUpAt: app.nextFollowUpAt ? new Date(app.nextFollowUpAt) : null,
            interviewDate: app.interviewDate ? new Date(app.interviewDate) : null,
            lastActivityAt: new Date(app.lastActivityAt),
            isHighPriority: app.isHighPriority,
            isArchived: app.isArchived,
            updatedAt: new Date(app.updatedAt),
          },
        });
      }
    }

    if (validatedData.contacts) {
      for (const contact of validatedData.contacts) {
        await prisma.contact.upsert({
          where: { id: contact.id },
          update: {
            name: contact.name,
            company: contact.company,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            linkedinUrl: contact.linkedinUrl,
            notes: contact.notes,
            lastContactAt: contact.lastContactAt ? new Date(contact.lastContactAt) : null,
            updatedAt: new Date(contact.updatedAt),
          },
          create: {
            id: contact.id,
            userId,
            name: contact.name,
            company: contact.company,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            linkedinUrl: contact.linkedinUrl,
            notes: contact.notes,
            lastContactAt: contact.lastContactAt ? new Date(contact.lastContactAt) : null,
            updatedAt: new Date(contact.updatedAt),
          },
        });
      }
    }

    if (validatedData.activities) {
      for (const activity of validatedData.activities) {
        await prisma.activity.upsert({
          where: { id: activity.id },
          update: {
            type: activity.type,
            notes: activity.notes,
            occurredAt: new Date(activity.occurredAt),
            updatedAt: new Date(activity.updatedAt),
          },
          create: {
            id: activity.id,
            userId,
            applicationId: activity.applicationId,
            type: activity.type,
            notes: activity.notes,
            occurredAt: new Date(activity.occurredAt),
            updatedAt: new Date(activity.updatedAt),
          },
        });
      }
    }

    if (validatedData.reminders) {
      for (const reminder of validatedData.reminders) {
        await prisma.reminder.upsert({
          where: { id: reminder.id },
          update: {
            title: reminder.title,
            notes: reminder.notes,
            dueAt: new Date(reminder.dueAt),
            completed: reminder.completed,
            updatedAt: new Date(reminder.updatedAt),
          },
          create: {
            id: reminder.id,
            userId,
            title: reminder.title,
            notes: reminder.notes,
            dueAt: new Date(reminder.dueAt),
            completed: reminder.completed,
            updatedAt: new Date(reminder.updatedAt),
          },
        });
      }
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[SyncAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
